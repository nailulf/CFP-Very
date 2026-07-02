# Konsultasi Booking — Payment Proof Upload (Google Drive)

**Date:** 2026-06-15
**Status:** Built; activates after OAuth re-auth with the Drive scope.
**Builds on:** the calendar/OAuth feature (reuses the owner OAuth token).

## Goal

Since there is no payment integration, let the client **upload a payment-proof
file** (transfer receipt) after booking. Store it in the owner's Google Drive and
record the file link + status against the booking in the `Order` sheet.

## Why owner OAuth (not the service account)

Decision: upload via the **owner OAuth token**, not the service account.
- A service account has **no Drive storage quota on a personal Gmail**, so uploads
  to My Drive fail; "Shared Drives" (the workaround) are **Workspace-only**.
- The owner OAuth token (already used for calendar) uploads as the user — files are
  owned by the owner and use their 15 GB. We add the **`drive.file`** scope.

## Flow

```
Client picks receipt (jpg/png/webp/pdf, ≤5MB)
  → POST /api/konsultasi/payment-proof  (multipart: bookingId + file)
       → validate type/size + bookingId format
       → bookingExists(bookingId)            (anti-spam: must be a real booking)
       → uploadPaymentProof()                (owner OAuth → Drive)
            findOrCreateFolder("Bukti Pembayaran Konsultasi")  (app-created; shared w/ reviewer)
            multipart upload, parents=[folderId], name "<bookingId> - bukti.<ext>"
       → setPaymentProof(bookingId, link)    (Order sheet col N + status)
  → success: "Bukti pembayaran terkirim ✓"
```

## Modules

| File | Role |
|------|------|
| `scripts/google-oauth-setup.mjs` | Scope now includes `drive.file` (re-run to grant it) |
| `src/lib/google-drive.ts` (NEW) | `uploadPaymentProof()` — find/create a private folder (auto-shared with `KONSULTASI_PROOF_SHARE_EMAIL`, default Aditya), multipart upload, return `webViewLink` |
| `src/lib/konsultasi-store.ts` | `bookingExists()`, `setPaymentProof()` — write Drive link to **column N** ("Bukti Pembayaran") + flip status to `menunggu_verifikasi` |
| `src/app/api/konsultasi/payment-proof/route.ts` (NEW) | Validate, verify booking, upload, record. `runtime = 'nodejs'` |
| `src/app/konsultasi/booking/BookingFlow.tsx` | Upload control on the success screen |

`drive.file` only ever sees app-created files, so a name search reliably resolves
the folder — no folder-ID env needed.

## Guardrails

- Server-side checks: mime in {jpeg, png, webp, pdf}, size ≤ 5 MB, `bookingId`
  matches `^KB-[A-Z0-9]+$` **and** exists in the sheet (prevents folder spam).
- Folder is **private** (sensitive receipts); shared only with the reviewer email.
- Filename is app-controlled (`<bookingId> - bukti.<ext>`), not the client's name.

## Activation (one-time, owner)

The current refresh token has only `calendar.events`. To turn uploads on, **re-run
the setup script** (it now requests `drive.file` too) and replace
`GOOGLE_OAUTH_REFRESH_TOKEN`. Best bundled with the upcoming "switch sender to
Aditya" re-auth. Until then the API returns a clear error and the booking is
otherwise unaffected.

Optional env: `KONSULTASI_PROOF_FOLDER` (folder name),
`KONSULTASI_PROOF_SHARE_EMAIL` (reviewer to auto-share with).

## Not in v1 (possible later)

- A **return link** (`/konsultasi/booking/<ref>`) so clients can upload later
  (current upload only lives on the in-memory success screen).
- Showing the proof link in the admin `listBookings` view.
- Verify/approve workflow (status is set to `menunggu_verifikasi`; approval is manual).
