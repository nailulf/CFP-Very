# Konsultasi Keuangan — Service Page & Booking Flow

**Date:** 2026-06-14
**Status:** Approved design — ready for implementation plan
**Source requirement:** `docs/Order Booking Page.docx`

---

## 1. Summary

Expand the existing "Konsultasi Keuangan" service into a complete, self-explanatory
flow consisting of two deliverables:

1. **A dedicated service detail page** (`/konsultasi`) that explains the consultation
   service through two content sections — "Bagaimana Kami Membantu" and "Layanan
   Konsultasi" — plus trust badges and an FAQ, ending in a booking call-to-action.
2. **A 3-step booking flow** (`/konsultasi/booking`) that captures the customer's
   consultation topic and contact details, lets them pick a session date/time from
   **admin-configurable availability**, and shows a confirmation page with **fully
   offline payment instructions**.

Payment is **offline only** (bank transfer + QRIS + WhatsApp fallback). No payment
gateway is integrated. Bookings are recorded to **Google Sheets** with a `Pending`
status; the admin confirms manually and emails the Google Meet link out-of-band.

This feature is **bilingual (ID default, EN second)** and must use the **current
design system** (teal/navy, Outfit + JetBrains Mono), not the outdated styling still
present in the legacy `/services` page.

---

## 2. Goals & Non-Goals

### Goals
- Give prospective clients a clear, branded explanation of the consultation service.
- Let clients self-serve a booking: pick a slot, describe their concern, submit.
- Capture every booking to a place the admin can read and act on (Google Sheets).
- Let the admin control when booking is open and which days/times are offered.
- Keep payment friction-free for a manual back-office: instructions + WhatsApp.

### Non-Goals (YAGNI)
- **No online payment gateway** (Midtrans/Xendit/Stripe etc.).
- **No live availability / double-booking prevention.** Slots offered are config-driven;
  the admin deduplicates manually when confirming. (Acceptable because confirmation is
  manual and volume is low.)
- **No automated email sending** in this iteration. Confirmation emails / Gmeet links are
  sent manually by the admin. (The app has no email infrastructure today.)
- **No in-app payment-proof upload.** Proof is sent by the customer via WhatsApp/email.
- **No login / accounts.** The booking flow is anonymous, like the Financial Health Check.
- **No package selector.** The three price tiers (Starter/Family/Comprehensive) appear in
  the FAQ as informational content only — they are not a selectable product in v1.

---

## 3. User Flow

```
Home (Services section) ─► click "Konsultasi Keuangan" card
        │
        ▼
/konsultasi  (service detail page)
   Hero + badges │ Bagaimana Kami Membantu │ Layanan Konsultasi │ FAQ │ CTA
        │ click "Jadwalkan Sesi Konsultasi"
        ▼
/konsultasi/booking  (3-step flow)
   Step 1  Pilih Jadwal      → Alur Konsultasi timeline + date/time picker
   Step 2  Data Diri         → name, email, phone, consultation topic (free text)
   Step 3  Konfirmasi        → review → submit → offline payment instructions
        │ submit
        ▼
POST /api/konsultasi/book → append row to Google Sheets ("Konsultasi Bookings", status Pending)
        │
        ▼
Success state: payment instructions (BNI/BCA, QRIS, WhatsApp) + 24h note + "we'll email your Gmeet"
```

If availability is toggled **off**, `/konsultasi/booking` shows a "booking sementara
ditutup" message with a WhatsApp CTA instead of the wizard.

---

## 4. Architecture & Components

Follows existing project conventions (see `CLAUDE.md`). The booking flow mirrors the
single-client-component pattern of `HealthCheckForm.tsx`.

### 4.1 Routes / Pages
| Path | Type | Description |
|------|------|-------------|
| `/konsultasi` | Server component page | Service detail page; assembles sections |
| `/konsultasi/booking` | Page + client component | 3-step booking wizard |
| `POST /api/konsultasi/book` | Route handler | Validates + appends booking to Google Sheets |

### 4.2 New files
```
src/app/konsultasi/
  page.tsx                       # /konsultasi — service detail (assembles sections, sets metadata)
  booking/
    page.tsx                     # /konsultasi/booking — renders BookingFlow
    BookingFlow.tsx              # 'use client' — 3-step wizard, all state via React
    lib/
      types.ts                   # Booking form/state types
      availability.ts            # Pure helpers: derive selectable dates/slots from config

src/components/sections/konsultasi/
  KonsultasiHero.tsx             # Hero + 4 trust badges + CTA
  BagaimanaKamiMembantu.tsx      # 4-card section
  LayananKonsultasi.tsx          # 3-card section
  KonsultasiFAQ.tsx              # Accordion of 10 Q&A

src/lib/
  booking-availability.ts        # server-safe config: master toggle, weekdays, time window, blackouts
  konsultasi-store.ts            # 'server-only' — appendBooking() + HEADERS, wraps google-sheets

src/app/api/konsultasi/book/route.ts
```

### 4.3 Reused existing assets
- `src/lib/google-sheets.ts` — `appendSheetRow`, `getSheetRowCount` (header bootstrap pattern).
- `src/lib/invoice-payments.ts` — `PAYMENT_ACCOUNTS` (BNI/BCA) for the payment-instructions panel.
  *(Currently `server-only`; expose the bank/QRIS display data to the confirmation step via the
  API response or a small server-rendered panel — never import `invoice-payments.ts` into a client
  component directly.)*
- `src/lib/translations.ts` + `useLang()` — all UI strings (ID first, then EN).
- UI primitives: `Container`, `Button`, `Badge`, `SectionHeader`, `ServiceInfoCard`.
- Design reference nodes in `design website.pen`: `baG1y` (checkout header/stepper), `ICbdI`
  (Book a Date), `4rk7V` (Payment → adapt to offline), `PpzHi` (Confirmation), `pbCZ9` (tokens).

### 4.4 QRIS asset
Static image at `public/konsultasi-qris.png` (user supplies later). Safe to serve publicly —
a QRIS merchant code is meant to be shown. Referenced from the confirmation step.

---

## 5. Data Model

### 5.1 Booking form state (`types.ts`)
```ts
type BookingForm = {
  // Step 1 — schedule
  date: string;          // ISO date 'YYYY-MM-DD', from configured availability
  timeSlot: string;      // 'HH:mm' WIB, from configured slots
  // Step 2 — details
  name: string;
  email: string;
  phone: string;
  topic: string;         // free-text "apa yang ingin dikonsultasikan" (required, min length)
};
```

### 5.2 Availability config (`booking-availability.ts`)
```ts
type BookingAvailability = {
  enabled: boolean;            // master on/off — off hides the wizard
  timezone: 'Asia/Jakarta';   // display only; all times are WIB
  weekdays: number[];          // 0=Sun..6=Sat that are bookable (default: all → Mon–Sun)
  startHour: number;           // 9  (09:00)
  endHour: number;             // 20 (20:00) — last slot start
  slotMinutes: number;         // 60
  leadTimeDays: number;        // earliest bookable day offset (e.g. 2 → not before H+2)
  horizonDays: number;         // how far ahead bookings open (e.g. 30)
  blackoutDates: string[];     // ISO dates to exclude
};
```
`availability.ts` exposes pure functions: `getSelectableDates(config, today)` and
`getSlotsForDate(config, date)`. Deterministic and unit-testable.

### 5.3 Google Sheets row ("Konsultasi Bookings" tab)
Header bootstrapped on first write (same as health-check-lead):
```
Timestamp | Booking ID | Nama | Email | No. HP | Tanggal Sesi | Jam Sesi | Topik Konsultasi | Status | Catatan
```
- `Booking ID`: short server-generated id (e.g. `KB-<timestamp36>`), shown to the user as a reference.
- `Status`: always `Pending` on create. Admin edits to `Paid` / `Confirmed` / `Expired` manually.
- `Timestamp`: `Asia/Jakarta` locale string (matches existing routes).

---

## 6. API Contract

`POST /api/konsultasi/book`

Request body (validated with `zod`, mirroring `contact/route.ts`):
```ts
{ name, email, date, timeSlot, topic, phone? }
```
- `name`: min 2 · `email`: valid email · `date`: ISO date · `timeSlot`: 'HH:mm' ·
  `topic`: min 10 · `phone`: optional.
- Server re-validates the chosen `date`/`timeSlot` against `booking-availability.ts`
  (reject if availability is `enabled:false` or the slot is not offered — guards against
  stale client state / tampering).

Response:
```ts
// 200
{ success: true, bookingId: 'KB-...' }
// 400 invalid payload or slot no longer available
{ success: false, message: string }
// 500
{ success: false, message: 'Internal server error' }
```

Env: requires `GOOGLE_SHEET_ID` (already used) and a new optional
`GOOGLE_KONSULTASI_TAB` (default `'Konsultasi Bookings'`).

---

## 7. UI / Design Notes

- **Design system is non-negotiable** (`CLAUDE.md`): page bg `#F0F7FA`, white cards with
  `#E0EBF5` border, primary gradient `#205781→#4F9DA6`, amber `#f79d35` CTAs, Outfit +
  JetBrains Mono. Do **not** copy the legacy `/services` blue/gray styling.
- **Stepper**: reuse the checkout-header pattern from design node `baG1y` — 3 steps
  (Pilih Jadwal → Data Diri → Konfirmasi). Active = `#205781` filled pill; completed =
  teal `#4F9DA6`; inactive = muted.
- **Booking form inputs** follow the Financial Health Check form rules from `CLAUDE.md`
  (always-rendered hint slot, `h-[48px]`, `bg-[#F5F8FC]`, `border-[#CBDCEA]`,
  `rounded-[10px]`, amber focus ring, label `text-[13px] font-semibold text-[#3A5A70]`).
- **Timeline** (Alur Konsultasi) on Step 1: Minggu 1 Initial Meeting (60 min) → Minggu 2
  Penyampaian Data (via email) → Minggu 3 Recommendation Meeting.
- **Confirmation/payment panel**: bank accounts (BNI/BCA) with copy-to-clipboard, QRIS
  image, prominent "Bayar dalam 24 jam" note, refund policy line (H-2, max 50%), and a
  WhatsApp button (`wa.me/6281806484635`) for payment issues.
- **FAQ**: accordion; content includes the 3 informational price tiers.

---

## 8. Internationalisation

- All new strings live in `src/lib/translations.ts` under a new `konsultasi` namespace
  (and `booking` sub-object), **ID written first, EN immediately below** — per `CLAUDE.md`.
- Source copy from the doc is Indonesian; EN equivalents will be authored and **flagged for
  user review** before shipping (CLAUDE.md rule 6).
- Consume via `const t = translations[lang].konsultasi;`.

---

## 9. Testing

- **Unit (pure logic):** `availability.ts` — `getSelectableDates` / `getSlotsForDate` across
  config permutations (weekday filter, blackout dates, lead time, horizon, disabled).
- **API validation:** `/api/konsultasi/book` rejects bad payloads and slots not in config;
  accepts a valid booking (Sheets call mockable).
- **Manual:** full flow on dev server — disabled-availability state, each step, submit,
  payment panel, ID/EN toggle, mobile layout. Compare against design nodes.

---

## 10. Open Items / User-supplied later

- QRIS image file → `public/konsultasi-qris.png`.
- Final EN translations sign-off.
- Confirm which exact card(s) on home/`/services` should link to `/konsultasi` (default:
  the "Konsultasi Keuangan" consultation card).
- Decide eventual fate of the legacy `/services` page (out of scope here).
