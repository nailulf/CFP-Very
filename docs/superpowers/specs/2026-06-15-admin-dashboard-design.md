# Admin Dashboard — Design Spec

**Date:** 2026-06-15
**Status:** Approved (pending spec review)
**Author:** Brainstormed with Claude

## Goal

Give the site owner a single admin portal to manage the consultation business, reusing the existing invoice login credentials. The portal lets the owner:

1. Edit available slots and dates (booking availability rules + blackout dates).
2. Edit package prices and set an optional sale ("slice") price per package.
3. View bookings and change their status. (Payment-gateway handling is a later phase.)

The existing invoice tool is also consolidated into this portal.

## Key constraint

Package prices ([src/lib/konsultasi-packages.ts](../../../src/lib/konsultasi-packages.ts)) and booking availability ([src/lib/booking-availability.ts](../../../src/lib/booking-availability.ts)) are currently **hardcoded TypeScript constants**. On Vercel the runtime filesystem is read-only, so these cannot be rewritten at runtime. Editable settings must move into a persistent store.

## Decisions

- **Storage:** Google Sheets — a new `Settings` tab in the same spreadsheet already used for invoices and bookings. No new infrastructure; hand-editable as a fallback.
- **Pricing model:** Each package has an original price and an optional sale price. When a sale price is set, the booking page shows the original struck through next to the lower price. The amount charged is `salePrice ?? price`, always resolved server-side.
- **Slot control:** Edit the recurring availability rules (weekdays, hours, slot length, lead time, horizon, master on/off) plus an add/remove blackout-dates list. No per-date overrides, no hand-picked individual slots.
- **Bookings (this phase):** View list + change status. No payment-gateway work yet.
- **Location:** A consolidated `/admin` hub. The existing invoice tool moves under `/admin/invoice`. Single login at `/admin/login`.
- **Auth:** Reuse the existing `getInvoiceSession()` / cookie. No new auth system.
- **Language:** Admin UI is Indonesian-only (internal tool, like the current invoice admin). Not added to `translations.ts`.
- **Styling:** Reuse the existing design system (cards, `#205781` / `#f79d35`, invoice-list table patterns). No new design tokens.

## Architecture

### Settings store

New `Settings` tab — key/value layout:

| Column | Meaning |
|---|---|
| A `Key` | `packages` or `availability` |
| B `Value` | JSON string |
| C `Updated At` | ISO timestamp |
| D `Updated By` | admin email |

Stored values are **overrides**, keyed by stable IDs defined in code:

- `packages` → `{ "starter": { "price": 500000, "salePrice": null }, "family": {...}, "comprehensive": {...} }`
  Only `price` and `salePrice` are editable. The package `id` and `service` label stay code-defined so Order-sheet records never break.
- `availability` → the editable subset of `BookingAvailability`: `enabled`, `weekdays`, `startHour`, `endHour`, `slotMinutes`, `leadTimeDays`, `horizonDays`, `blackoutDates`. `timezone` stays fixed in code.

New module `src/lib/settings-store.ts`:

- `getPackagePricing(): Promise<Record<KonsultasiPackageId, { price: number; salePrice: number | null }>>` — reads the `packages` key, merges over code defaults.
- `getAvailabilityConfig(): Promise<BookingAvailability>` — reads the `availability` key, merges over the code default `BOOKING_AVAILABILITY`.
- `savePackagePricing(value, updatedBy)` / `saveAvailabilityConfig(value, updatedBy)` — write JSON to the tab, update the in-memory cache immediately.
- Module-level cache with ~60s TTL so the booking page does not read the Sheet on every load; writes bust it.
- Both getters **fall back to the current hardcoded values** when the key is missing or the Sheet is unreachable (fail-open, never breaks booking).

### Refactor of existing code

- [src/lib/konsultasi-packages.ts](../../../src/lib/konsultasi-packages.ts): keep current amounts as `defaultPricing`. Add `price`/`salePrice` to the package shape conceptually; the resolved amount = `salePrice ?? price`.
- [src/lib/booking-availability.ts](../../../src/lib/booking-availability.ts): keep `BOOKING_AVAILABILITY` as the default.
- Booking page ([src/app/konsultasi/booking/page.tsx](../../../src/app/konsultasi/booking/page.tsx), already `force-dynamic`): fetch availability + pricing from `settings-store`, pass resolved package prices (original + sale) into `BookingFlow` as props.
- `BookingFlow` ([src/app/konsultasi/booking/BookingFlow.tsx](../../../src/app/konsultasi/booking/BookingFlow.tsx)): stop importing the price const; render prices from props. Show strikethrough original + sale price where a sale is set.
- Book API ([src/app/api/konsultasi/book/route.ts](../../../src/app/api/konsultasi/book/route.ts)): resolve the charged `amount` from `getPackagePricing()` (`salePrice ?? price`) — server-authoritative, client cannot tamper.

### Bookings store

`src/lib/konsultasi-store.ts` gains:

- `listBookings(): Promise<Booking[]>` — full Order rows, newest first.
- `updateBookingStatus(id, status): Promise<boolean>` — updates the Payment Status cell.

Status set: **Pending → Paid → Cancelled / Refunded**. `Cancelled` and `Refunded` are already in the "released" set, so freeing a slot needs no extra logic — `getBookedSlots()` already excludes released statuses.

## Routes

### Pages (all server-guarded; redirect to `/admin/login?next=…` if no session)

| Route | Purpose |
|---|---|
| `/admin/login` | Single login for the hub (moved from `/generate-invoice/login`) |
| `/admin` | Hub: cards for Bookings, Packages & Pricing, Availability, Invoices |
| `/admin/bookings` | Bookings table + status dropdown |
| `/admin/packages` | Edit price + optional sale price per package, live strikethrough preview |
| `/admin/availability` | Edit availability rules + blackout dates, master on/off |
| `/admin/invoice` | Invoice generator (moved from `/generate-invoice`) |
| `/admin/invoice/list` | Invoice list (moved) |
| `/admin/invoice/[id]` | Single invoice view (moved) |

Old `/generate-invoice/*` URLs redirect to the new `/admin/invoice/*` paths via `next.config` redirects (preserves bookmarks). Login redirect default becomes `/admin`, honoring `?next=`.

### API routes (all protected by `getInvoiceSession()`)

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/settings/packages` | GET / PUT | Read / save package pricing |
| `/api/admin/settings/availability` | GET / PUT | Read / save availability config |
| `/api/admin/bookings` | GET | List all bookings |
| `/api/admin/bookings/[id]` | PATCH | Update booking status |

Existing `/api/invoice/*` and `/api/invoice-auth/*` routes are **unchanged** (only the page paths that call them are updated).

## Auth flow

- Cookie is already site-wide (`path: '/'`), so one login covers `/admin` and `/admin/invoice`.
- Add `?next=` support: visiting a guarded page while logged out redirects to `/admin/login?next=<path>`; on success, redirect back to `next` (default `/admin`).

## Validation

- Settings PUT routes validate with Zod: prices are positive integers; `salePrice` is null or a positive integer less than `price`; weekdays are 0–6; hours 0–23 with `startHour < endHour`; `slotMinutes`, `leadTimeDays`, `horizonDays` positive; blackout dates match `YYYY-MM-DD`.
- Book API continues to validate the slot is still available before writing.

## Out of scope (this phase)

- Payment-gateway / DOKU automation and payment reconciliation.
- Search/filter on the bookings table.
- Per-date availability overrides and hand-picked individual slots.
- Multilingual admin UI.

## Testing

- Settings store: getters fall back to defaults when the key is missing or the Sheet is unreachable; merge logic; cache invalidation on write.
- Pricing: charged amount resolves to `salePrice ?? price` server-side; client-sent amounts are ignored.
- Availability edits flow through to selectable dates/slots on the booking page.
- Booking status change to Cancelled/Refunded frees the slot.
- Auth guard: unauthenticated access to any `/admin/*` page or `/api/admin/*` route redirects/401s.
- Old `/generate-invoice/*` URLs redirect to `/admin/invoice/*`.
