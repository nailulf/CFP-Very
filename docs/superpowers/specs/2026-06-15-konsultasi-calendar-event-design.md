# Konsultasi Booking — Create Calendar Event + Client Invite (OAuth)

**Date:** 2026-06-15
**Status:** Approved (design), ready for implementation
**Branch:** `feat/konsultasi-slot-availability`
**Builds on:** the slot-availability feature.

## Goal

When a booking is confirmed, also create a Google Calendar event **as the owner**
(via OAuth), with a **real Google Meet link** and the **client added as an
attendee** so Google sends them a native invite. Surface the Meet link on the
success page and in the WhatsApp message.

## Why OAuth (decision)

Live probes against the personal calendar proved:
- Bare `events.insert` via the **service account**: ✅ works.
- `conferenceData` (Meet) via service account: ❌ `400 Invalid conference type value`.
- `attendees` via service account: ❌ `403 needs Domain-Wide Delegation`.

So **service accounts cannot create Meet links or invite attendees** on a personal
Gmail. **OAuth acting as the owner** can do both. OAuth also makes Google send the
client a **native cross-provider invite** (`.ics` email + RSVP) — which **replaces**
the previously-planned custom nodemailer/.ics build. Less code, better UX.

## Auth split

- **Service account** (existing): Sheets + Calendar **freeBusy read** (availability).
  Unchanged. Scope stays `spreadsheets` + `calendar.readonly`.
- **OAuth owner token** (new): Calendar **event write** (`calendar.events`). Used
  only for `createBookingEvent`.

## Non-negotiable: fail-soft

The booking is recorded in the `Order` sheet first. Event creation is **best-effort**:
any failure (OAuth unconfigured, API error) is logged; the booking still returns
`200`. The success page only shows the Meet/calendar link when creation succeeded.

## Architecture

```
POST /api/konsultasi/book
  ├─ isSlotAvailable(...)             (existing guard)
  ├─ appendBooking(...)              (existing — records booking)
  └─ createBookingEvent(...) ─ try/catch ─► { meetLink?, htmlLink? }   (best-effort, OAuth)
        events.insert (conferenceDataVersion=1):
          conferenceData → Meet, attendees:[client], sendUpdates:'all' → native invite
  → 200 { success, bookingId, meetLink?, eventLink? }
```

### Modules

| File | Role |
|------|------|
| `src/lib/google-oauth.ts` (NEW, server-only) | `getOwnerAccessToken()` — mint owner token from `GOOGLE_OAUTH_REFRESH_TOKEN` (+ client id/secret), cached. Throws `OAuthNotConfigured` if env missing |
| `scripts/google-oauth-setup.mjs` (NEW) | One-time loopback consent flow → prints `GOOGLE_OAUTH_REFRESH_TOKEN` |
| `src/lib/google-calendar.ts` (EDIT) | `createBookingEvent(input): Promise<{meetLink?,htmlLink?}>` via owner token; fail-soft `{}` |
| `src/lib/google-calendar-link.ts` (NEW, pure, client-safe) | `googleCalendarTemplateUrl(input)` for the success-page "Add to Calendar" button |
| `src/app/api/konsultasi/book/route.ts` (EDIT) | Best-effort `createBookingEvent`, return `meetLink`/`eventLink` |
| `src/app/konsultasi/booking/BookingFlow.tsx` (EDIT) | Success: "Join Google Meet", "Add to Google Calendar" button, Meet link in WA |

`nodemailer`/custom `.ics` are **not** needed (Google sends the invite).

## Event content

- **Summary:** `Konsultasi Keuangan — {packageName} ({clientName})`
- **Start/End:** slot `[start, start+slotMinutes)`, `start.dateTime` + `timeZone: 'Asia/Jakarta'`.
- **Description:** package, topic, booking ref, Meet link.
- **Attendees:** `[{ email: clientEmail }]`, `sendUpdates: 'all'`.
- **Conference:** `createRequest` `hangoutsMeet`, `conferenceDataVersion=1` → `meetLink` from `hangoutLink`.

## Testing (TDD, vitest)

Pure: `googleCalendarTemplateUrl` — correct `dates=YYYYMMDDTHHMMSSZ/…Z` (WIB→UTC),
encoded `text`/`details`/`location`. I/O (`createBookingEvent`, route) verified by a
manual booking after OAuth setup.

## One-time setup (owner)

1. Google Cloud → **OAuth consent screen** (External, Testing): add your email as a
   test user; add scope `.../auth/calendar.events`.
2. **Credentials → Create OAuth client ID → Desktop app** → Client ID + Secret.
3. Run `node scripts/google-oauth-setup.mjs <CLIENT_ID> <CLIENT_SECRET>` → consent in
   browser → it prints the refresh token.
4. Set in `.env.local`: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
   `GOOGLE_OAUTH_REFRESH_TOKEN`.

Until done, event creation no-ops (fail-soft) and booking still works.

## Risk to verify post-setup

- Meet link attaches under OAuth (expected yes — real user organizer).
- Native invite reaches the client (expected yes).
