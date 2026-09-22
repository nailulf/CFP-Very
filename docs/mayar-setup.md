# Mayar.id Setup — Konsultasi Payments

## Environment variables (.env.local / Vercel)

| Var | Value |
|---|---|
| `MAYAR_API_KEY` | Mayar dashboard → API Keys → generate a **Read & Write** key. Sandbox (mayar.club) and production (mayar.id) use **separate keys**. |
| `MAYAR_BASE_URL` | Development: `https://api.mayar.club/hl/v2` · Production: `https://api.mayar.id/hl/v2` |
| `MAYAR_WEBHOOK_TOKEN` | Long random string, e.g. `openssl rand -hex 32`. Shared secret in the webhook URL. |
| `MAYAR_PUBLIC_ORIGIN` | Optional. Public site origin (e.g. `https://yourdomain.com`) used for the status link shown on invoices; falls back to the request origin. Set it in production so preview/deployment URLs never leak onto invoices. |

## Mayar dashboard steps (manual, once per environment)

1. Generate the API key (above).
2. Register the webhook: **Integration → Webhook** →
   `https://<domain>/api/konsultasi/payment/webhook?token=<MAYAR_WEBHOOK_TOKEN>`
3. Decide the fee-bearing setting (admin/channel fee borne by customer vs merchant)
   under payment/checkout settings.
4. Use **Test URL Hook** on the webhook page to send a test event and confirm a
   200 response in the deployment logs.

> Note: the webhook token rides in the URL, so it appears in Mayar's logs and any proxy access logs. Rotating `MAYAR_WEBHOOK_TOKEN` (env + re-registering the webhook URL) is the revocation mechanism.

## Calendar invites (separate from Mayar)

The Meet invite is created after payment, and needs **two** Google identities to
agree about one calendar — they fail differently and both fail silently:

| Identity | Does | Needs on `GOOGLE_CALENDAR_ID` |
|---|---|---|
| `GOOGLE_OAUTH_REFRESH_TOKEN` | `events.insert` + Meet link | **writer** ("Make changes to events") |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | free/busy for slot availability | **read** |

Point `GOOGLE_CALENDAR_ID` at a dedicated calendar shared with both. Verify with:

```
node scripts/check-calendar-config.mjs                 # local
vercel env pull .env.production --environment=production
node scripts/check-calendar-config.mjs .env.production # production
```

`404` = the OAuth token is for a different Google account than the calendar.
`403` = that account has the calendar as a reader, not a writer. A free/busy
failure is the quiet one: `getCalendarBusy()` fails open to `[]`, so booked
slots stop being blocked and customers can double-book.

> Production and local env are configured independently here but share one
> `GOOGLE_SHEET_ID`. Running `next dev` against a real booking will send that
> customer's confirmation email from your personal account and take the
> column-Q send-once lock, permanently silencing production for that booking.

## Go-live checklist

1. Deploy with sandbox values; run a full booking → sandbox payment → sheet flips
   to `paid` → Calendar event created → status page shows the Meet link.
2. Negative paths: let an invoice expire (slot released ≤ 1h), hit the webhook with a
   wrong token (404), book while `MAYAR_API_KEY` is unset (status page self-heals).
3. Swap `MAYAR_BASE_URL` + production API key, register the production webhook.
4. Live test with the cheapest package, then refund it from the Mayar dashboard and
   mark the booking `refunded` in the admin dashboard.
