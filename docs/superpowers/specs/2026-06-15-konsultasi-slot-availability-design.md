# Konsultasi Booking — Show Only Available Time Slots

**Date:** 2026-06-15
**Status:** Approved (design), ready for implementation
**Branch:** `feat/konsultasi-slot-availability`

## Problem

Time slots in the booking wizard are generated purely from config
([availability.ts](../../../src/app/konsultasi/booking/lib/availability.ts) `getSlotsForDate`):
every hour from `startHour`–`endHour` always shows, regardless of whether someone
already booked it. Two people can pick the same 10:00 slot, and the planner's own
calendar conflicts are invisible.

## Goal

Show only genuinely-open slots by subtracting two sources of "taken" from the
config-generated slots:

1. **Existing bookings** — date+time already recorded in the `Order` sheet.
2. **Google Calendar busy times** — anything on the planner's calendar.

Plus a **submit-time re-check** so a slot booked between page load and submit
cannot double-book (UI filtering is UX; the re-check is correctness).

## Non-goals

- Capacity > 1 per slot (assume **one booking fully blocks a time**).
- Per-date lazy fetching / loading states (Approach B). We compute upfront
  (Approach A); can evolve later if volume grows.
- Caching layer (kept out of v1 for simplicity; low booking volume).
- Payment gating (no payment in the flow today).

## Definition of "available"

A config-generated slot for `date` at `time` (WIB) is **available** unless:
- `"${date} ${time}"` is in the booked set from the `Order` sheet, **or**
- the slot interval `[start, start+slotMinutes)` (WIB → UTC) overlaps any Google
  Calendar busy interval.

A booking blocks regardless of payment status (we hold the slot on booking).
Future `cancelled`/`refunded` statuses are excluded from the booked set.

## Architecture — Approach A (compute upfront) + submit re-check

```
booking/page.tsx (server, force-dynamic)
  ├─ getSelectableDates(config, today)               (pure, existing)
  └─ getFreeSlotsByDate(config, dates)               (NEW, server orchestration)
        ├─ getBookedSlots()            → Set<"YYYY-MM-DD HH:mm">   (Order sheet)
        ├─ getCalendarBusy(min,max)    → BusyInterval[]            (freeBusy API)
        └─ filterFreeSlots(...)        (pure, per date)
  → slotsByDate (only free slots) → <BookingFlow>

api/konsultasi/book/route.ts (server)
  └─ isSlotAvailable(config, date, time, today)      (NEW, server orchestration)
        → config-valid AND not booked AND not calendar-busy
        → 400 "Jadwal ... sudah tidak tersedia." if taken
```

### Modules & boundaries

| File | Role | I/O? |
|------|------|------|
| `src/lib/google-auth.ts` (NEW) | `getGoogleAccessToken()` — extracted JWT minting, scope = `spreadsheets` + `calendar.readonly`, token cached | yes |
| `src/lib/google-sheets.ts` (EDIT) | Use shared `getGoogleAccessToken` instead of local copy | yes |
| `src/lib/google-calendar.ts` (NEW, server-only) | `getCalendarBusy(timeMinISO, timeMaxISO): Promise<BusyInterval[]>` via `freeBusy`; `[]` if `GOOGLE_CALENDAR_ID` unset or on error (fail-open) | yes |
| `src/lib/konsultasi-store.ts` (EDIT) | `getBookedSlots(): Promise<Set<string>>` — read `Order!A:M`, parse Booking Date col | yes |
| `src/app/konsultasi/booking/lib/availability.ts` (EDIT) | Pure helpers: `parseBookingDateCell`, `slotIntervalUTC`, `filterFreeSlots` | no |
| `src/lib/konsultasi-availability.ts` (NEW, server-only) | Orchestration: `getFreeSlotsByDate`, `isSlotAvailable`; fail-open per source | yes |
| `src/app/konsultasi/booking/page.tsx` (EDIT) | Build free `slotsByDate` via `getFreeSlotsByDate` | yes |
| `src/app/api/konsultasi/book/route.ts` (EDIT) | Replace `isValidSlot` with `isSlotAvailable` | yes |

Pure logic lives in `availability.ts` (unit-tested, no I/O). I/O + fail-open
orchestration lives in `konsultasi-availability.ts`.

## Timezone handling

Indonesia (WIB) is a fixed **+07:00**, no DST. A slot's UTC interval:

```
startMs = Date.parse(`${date}T${time}:00+07:00`)
endMs   = startMs + slotMinutes * 60_000
```

Calendar `freeBusy` returns UTC ISO intervals. Overlap test (half-open):
`startMs < busyEndMs && endMs > busyStartMs` (touching boundaries ≠ overlap).

`freeBusy` query window covers the whole horizon:
`timeMin` = first date `00:00+07:00`, `timeMax` = last date `23:59+07:00`.

## Booking Date parsing (`parseBookingDateCell`)

`Order` column J ("Booking Date") holds mixed formats:
- New consultation rows: `"2026-06-18 10:00"` (24h).
- Legacy rows: `"2026-05-15 1:00 PM"` (12h AM/PM).

Parser → `{ date: "YYYY-MM-DD", time: "HH:mm" }` or `null` (skip if unparseable).
Booked-set key = `"${date} ${time}"` (24h), matched against generated slots.

## Error handling — fail-open

If the Sheet read or Calendar call throws, log and treat that source as empty
(slot stays selectable). Rationale: a Calendar/Sheets outage must not take down
booking. Rare double-book is preferable to a fully broken booking page. The
submit re-check applies the same policy.

## Testing (TDD, vitest)

Unit-test the pure functions in `availability.test.ts`:
- `slotIntervalUTC` — WIB→UTC (10:00 WIB → 03:00Z).
- `filterFreeSlots` — removes booked keys; removes slots overlapping a busy
  interval; keeps slots only touching a boundary; partial-overlap removed.
- `parseBookingDateCell` — 24h format, 12h AM/PM format, unparseable → null,
  noon/midnight edge (12:00 AM → 00:00, 12:00 PM → 12:00).

Orchestration (`konsultasi-availability`, `google-calendar`, `getBookedSlots`)
is I/O — verified by a manual end-to-end booking against the real sheet/calendar.

## Setup required (one-time, by the owner)

1. Enable the **Google Calendar API** in the Cloud project.
2. Share the booking calendar with the **service-account email**, permission
   **"See only free/busy"**.
3. Set `GOOGLE_CALENDAR_ID` (a dedicated "Konsultasi" calendar recommended, so
   personal events don't all block slots).

Until then, calendar blocking no-ops (fail-open) and only Order-sheet bookings
filter slots — so the feature ships safely before calendar setup is done.
