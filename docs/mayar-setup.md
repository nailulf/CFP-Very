# Mayar.id Setup — Konsultasi Payments

## Environment variables (.env.local / Vercel)

| Var | Value |
|---|---|
| `MAYAR_API_KEY` | Mayar dashboard → API Keys → generate a **Read & Write** key. Sandbox (mayar.club) and production (mayar.id) use **separate keys**. |
| `MAYAR_BASE_URL` | Development: `https://api.mayar.club/hl/v2` · Production: `https://api.mayar.id/hl/v2` |
| `MAYAR_WEBHOOK_TOKEN` | Long random string, e.g. `openssl rand -hex 32`. Shared secret in the webhook URL. |

## Mayar dashboard steps (manual, once per environment)

1. Generate the API key (above).
2. Register the webhook: **Integration → Webhook** →
   `https://<domain>/api/konsultasi/payment/webhook?token=<MAYAR_WEBHOOK_TOKEN>`
3. Decide the fee-bearing setting (admin/channel fee borne by customer vs merchant)
   under payment/checkout settings.
4. Use **Test URL Hook** on the webhook page to send a test event and confirm a
   200 response in the deployment logs.

## Go-live checklist

1. Deploy with sandbox values; run a full booking → sandbox payment → sheet flips
   to `paid` → Calendar event created → status page shows the Meet link.
2. Negative paths: let an invoice expire (slot released ≤ 1h), hit the webhook with a
   wrong token (404), book while `MAYAR_API_KEY` is unset (status page self-heals).
3. Swap `MAYAR_BASE_URL` + production API key, register the production webhook.
4. Live test with the cheapest package, then refund it from the Mayar dashboard and
   mark the booking `refunded` in the admin dashboard.
