# Konsultasi Booking — Mayar.id Payment Integration

**Date:** 2026-07-02
**Status:** Approved design, pending implementation
**Supersedes (payment step only):** `2026-06-15-konsultasi-payment-proof-upload-design.md` — the manual transfer + proof-upload flow is replaced by Mayar hosted checkout. The Google Sheets record-keeping from that spec is **kept unchanged**.

## Goal

Replace the manual bank-transfer + payment-proof-upload step of the konsultasi booking flow with Mayar.id hosted checkout (API v2), so payments are confirmed automatically and admins no longer verify proofs by hand.

## Decisions (agreed with owner)

| Decision | Choice |
|---|---|
| Relation to manual proof flow | Mayar **replaces** it. Proof-upload UI removed from BookingFlow; `/api/konsultasi/payment-proof` route and `src/lib/google-drive.ts` stay in the repo, dormant. |
| Google Sheets | **Stays the system of record.** No columns removed; every booking still writes a row to the `Order` tab exactly as today. |
| Checkout UX | Auto-redirect to Mayar's hosted payment page after booking submit (with a brief interstitial that shows the status-page link first). |
| Payment window | **1 hour**, clamped to never extend past the appointment start time. Expired ⇒ booking `expired` ⇒ slot released. |
| Calendar/Meet | Google Calendar event + Meet invite are created **after payment is confirmed** (moved out of the book route). |
| Mayar account | Verified & ready. Build against **sandbox** (`api.mayar.club`), flip to production via env var. |
| API choice | `POST /hl/v2/invoices/create` (Invoice API) — line items, customer record, `expiredAt`, `extraData.bookingId`. |

## Architecture

```
Customer                    Our server                        Mayar
   │  submit booking            │                                │
   ├──────────────────────────► │ 1. validate + append row      │
   │                            │    (status: pending_payment)   │
   │                            │ 2. POST /invoices/create ────► │
   │                            │ ◄──── invoice id + link ────── │
   │                            │ 3. invoice id → col H          │
   │  ◄── bookingId+paymentUrl ─│                                │
   ├── redirect to Mayar hosted checkout ───────────────────────►│
   │                            │ ◄── webhook payment.received ──│
   │                            │ 4. re-fetch invoice (verify)   │
   │                            │ 5. status → paid, paidAt,      │
   │                            │    method → sheet              │
   │                            │ 6. Calendar event + Meet       │
   │  /konsultasi/booking/status/[bookingId] polls until paid    │
```

Two independent confirmation paths:
1. **Webhook** (`payment.received`) — primary.
2. **Status-page polling** — fallback; the status endpoint re-checks Mayar directly, so a missed webhook cannot lose a payment.

## Components

### 1. `src/lib/mayar.ts` (new)

Thin API client, no SDK. Reads env at call time (same pattern as `google-sheets.ts`).

- `createInvoice(booking)` → `POST {base}/invoices/create` with:
  - `name`, `email`, `mobile` (phone is already required in the details step UI)
  - `items: [{ quantity: 1, rate: amount, description: service label }]`
  - `expiredAt`: ISO 8601, `min(now + 1h, appointment start)`
  - `description`: `"{bookingId} — {service}"` plus the status-page URL so it is visible on the invoice
  - `extraData: { bookingId }`
  - Returns `{ id, transactionId, link, expiredAt }`.
- `getInvoice(id)` → `GET {base}/invoices/{id}` → `{ status: 'paid' | 'unpaid' | 'closed', link, ... }`.
- Base URL from `MAYAR_BASE_URL` (default production `https://api.mayar.id/hl/v2`; sandbox `https://api.mayar.club/hl/v2` during development). Auth: `Authorization: Bearer ${MAYAR_API_KEY}`.
- On non-2xx: throw with `statusCode` + `messages` from Mayar's envelope. Treat 429 (duplicate request) as retryable-later.

### 2. `src/app/api/konsultasi/book/route.ts` (modified)

- Keep: validation, slot check, package resolution, sheet append (`pending_payment`).
- Remove: Calendar event + Meet creation (moves to payment confirmation).
- Add: after append, `createInvoice()`; write invoice id to column H via new store helper.
- Response: `{ success, bookingId, paymentUrl }` (no more `meetLink`).
- If Mayar call fails: still return `{ success, bookingId, paymentUrl: null }`. The row stays `pending_payment`; the status page self-heals (see §4).

### 3. `src/app/api/konsultasi/payment/webhook/route.ts` (new)

- `POST` receiver registered in the Mayar dashboard as `https://{domain}/api/konsultasi/payment/webhook?token={MAYAR_WEBHOOK_TOKEN}`.
- Mayar webhooks are **unsigned** (no HMAC documented), so the handler trusts nothing in the payload:
  1. Reject if `token` query param ≠ `MAYAR_WEBHOOK_TOKEN` (404 to avoid probing).
  2. Only process `event === 'payment.received'`; ack everything else with 200.
  3. Extract `bookingId` from `extraData` (fallback: match by invoice/transaction id in column H).
  4. Call shared `confirmPayment(bookingId)` (§5). Payment truth comes from re-fetching the invoice, never from the webhook body.
- Always respond 200 quickly; log and swallow internal errors (Mayar's retry behavior is undocumented).

### 4. `src/app/api/konsultasi/payment/status/[bookingId]/route.ts` (new)

Public, unauthenticated by design (bookingId is the capability, same as the proof-upload route). `GET` returns `{ status, paymentUrl, meetLink }`.

- Read booking row. If terminal (`paid` / `cancelled` / `refunded` / `expired`) → return as-is.
- If `pending_payment`:
  - **Expiry check** (no new sheet column needed): expired when `now > createdAt (col L) + 1h` or `now ≥ appointment start`. If expired → set status `expired` (releases slot), return `expired`.
  - **Self-heal:** if column H is empty (invoice creation failed at booking time) → `createInvoice()` now, store id.
  - **Reconcile:** `getInvoice(colH)`; if `paid` → `confirmPayment(bookingId)`; if `closed` → mark `expired`. Otherwise return the invoice `link` as `paymentUrl` so the page can re-offer the button.
- Availability safety net: slot-availability computation treats `pending_payment` rows older than 1 h as released, so an unpaid booking that nobody ever polls cannot hold a slot (statuses are still only *written* by the status endpoint / admin).

### 5. `confirmPayment(bookingId)` — shared helper in `src/lib/konsultasi-store.ts`

Called by webhook and status endpoints. Sequence:

1. Re-read row; **no-op if already `paid`** (idempotency guard — webhook and poll may race; Sheets has no transactions, and the re-read narrows but does not eliminate the window. Worst case is a duplicate calendar event, which is acceptable and visible to the admin).
2. `getInvoice(colH)` must return `status === 'paid'` — the only source of truth.
3. Update sheet: col G → `paid`, col K → paidAt, col I → payment method (from invoice detail when available, else `mayar`).
4. Create Calendar event + Meet invite (existing logic moved out of the book route into a reusable function), best-effort/non-blocking exactly as today. Write the Meet link to **column O ("Meet Link" — new, additive-only; no existing column is touched)** so the status page and admin can retrieve it later.

New small store helpers: `setInvoiceId(bookingId, invoiceId)`, `setMeetLink(bookingId, link)`, plus reuse of existing status-update and row-read functions.

### 6. `src/app/konsultasi/booking/status/[bookingId]/page.tsx` (new) + client component

Replaces the old post-booking success/proof-upload screen; revisitable via URL.

- Polls the status endpoint every ~5 s while `pending_payment` (stops on terminal status or after ~15 min, with a manual "Cek status" button).
- States: **pending** (spinner + "Bayar Sekarang" button with `paymentUrl`), **paid** (booking ref, package, schedule, Meet link, WhatsApp share — the current success-screen content), **expired** ("waktu pembayaran habis" + link to rebook), **cancelled/refunded** (informational).
- Follows the design system: page bg `#F0F7FA`, white cards with `#E0EBF5` border, status colors from the defined palette.

### 7. `src/app/konsultasi/booking/BookingFlow.tsx` (modified)

- Confirm step: replace the yellow "manual transfer" warning with a note that the customer will be redirected to secure payment (Mayar) with a 1-hour window.
- On submit success: show a brief interstitial card — "Booking dibuat! Simpan link status ini …" with the status-page URL — then auto-redirect to `paymentUrl` after ~3 s (immediate button too). If `paymentUrl` is null, send them to the status page instead (self-heal path).
- Remove the proof-upload UI block and its state.

### 8. Admin dashboard (minimal touch)

- No structural change; status dropdown keeps working as a manual override.
- Add `expired` to the accepted status enum in `PATCH /api/admin/bookings/[id]` and the dropdown, so admins can see/set it.

## Data model (Google Sheets `Order` tab — unchanged structure)

| Col | Field | Usage after this change |
|---|---|---|
| G | Payment Status | `pending_payment` → `paid` \| `expired` \| `cancelled` \| `refunded` (`menunggu_verifikasi` no longer produced; legacy rows keep it and admins resolve them manually) |
| H | Invoice ID | **Now used:** Mayar invoice UUID |
| I | Payment Method | Set from invoice detail on confirmation (else `mayar`) |
| K | Paid At | Set by `confirmPayment` |
| N | Bukti Pembayaran | Kept, no longer written |
| O | Meet Link | **New, additive-only.** Written by `confirmPayment` after the Calendar event is created; read by the status endpoint and (optionally) admin table |

## i18n (`src/lib/translations.ts`)

New strings (ID first, then EN, per project rules): confirm-step payment note, interstitial copy, status-page labels (pending/paid/expired/cancelled headings + body), "Bayar Sekarang", "Cek status", rebook CTA.

## Environment variables

| Var | Purpose |
|---|---|
| `MAYAR_API_KEY` | Bearer key from Mayar dashboard (Read & Write) |
| `MAYAR_BASE_URL` | `https://api.mayar.club/hl/v2` (sandbox) → `https://api.mayar.id/hl/v2` (prod). Note: Mayar sandbox and production use **separate API keys**. |
| `MAYAR_WEBHOOK_TOKEN` | Long random string; shared secret in the webhook URL |

Manual dashboard steps (documented in the plan): generate API key; register webhook URL (Integration → Webhook); decide fee-bearing setting (admin fee borne by customer or merchant).

## Error handling & edge cases

| Case | Behavior |
|---|---|
| Mayar down at booking | Row saved; response has `paymentUrl: null`; client routes to status page, which self-heals by creating the invoice on next poll. |
| Webhook never arrives | Status-page polling reconciles directly against `GET /invoices/{id}`. |
| Forged webhook | Token check + payment truth only from Mayar API re-fetch — forgery cannot mark a booking paid. |
| Customer pays at 59:59, webhook after expiry | `confirmPayment` trusts Mayar's `paid` status even if our clock says expired — paid wins over expired **only if** the row was not already flipped; if the row is `expired` but Mayar says `paid`, flip to `paid` anyway (customer money is authoritative) and surface any resulting double-booking to the admin. |
| Double payment/slot race | Slot check happens at booking, and unpaid holds expire after 1 h; the residual race (two bookings created within the same hour for one slot, both paid) already exists today and is handled by the admin (refund one). |
| Calendar creation fails after payment | Same as today: best-effort, booking stays `paid`; status endpoint retries Calendar/Meet creation on later polls while column O is empty, and the status page falls back to "undangan Meet dikirim ke email" copy. |
| Legacy `menunggu_verifikasi` rows | Untouched; admin resolves via dashboard as today. |

## Out of scope

- Refund automation via Mayar (admin marks `refunded` manually as today).
- Coupons/discounts, cross-sell, Mayar customer portal.
- Email notifications beyond the Calendar/Meet invite.
- Removing the dormant proof-upload route/lib.

## Testing & rollout

1. **Unit-ish:** `mayar.ts` client against sandbox (create + get invoice); expiry-clamp logic.
2. **E2E on sandbox:** full booking → redirect → sandbox payment → webhook (use Mayar's *Test URL Hook*) → sheet flips to `paid` → Calendar event created → status page shows Lunas + Meet link.
3. **Negative paths:** expired invoice releases slot; forged webhook rejected; booking with Mayar down self-heals.
4. **Rollout:** deploy with sandbox keys → owner does a real sandbox run → swap `MAYAR_BASE_URL` + production API key + register production webhook → live test with the cheapest package (then refund).
