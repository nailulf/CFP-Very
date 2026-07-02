import { describe, it, expect, vi, beforeEach } from 'vitest';

const confirmPayment = vi.fn();
const reconcileAllPending = vi.fn();
vi.mock('@/lib/konsultasi-payment-confirm', () => ({
  confirmPayment: (...a: unknown[]) => confirmPayment(...a),
  reconcileAllPending: (...a: unknown[]) => reconcileAllPending(...a),
}));

import { POST } from './route';

const URL_OK = 'https://site.com/api/konsultasi/payment/webhook?token=secret';

function post(url: string, body: unknown) {
  return POST(
    new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.MAYAR_WEBHOOK_TOKEN = 'secret';
});

describe('POST /api/konsultasi/payment/webhook', () => {
  it('404s on a wrong or missing token', async () => {
    expect((await post('https://site.com/api/konsultasi/payment/webhook?token=nope', {})).status).toBe(404);
    expect((await post('https://site.com/api/konsultasi/payment/webhook', {})).status).toBe(404);
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it('404s when the server has no token configured (fail closed)', async () => {
    delete process.env.MAYAR_WEBHOOK_TOKEN;
    expect((await post(URL_OK, {})).status).toBe(404);
  });

  it('acks non-payment events without processing', async () => {
    const res = await post(URL_OK, { event: 'payment.reminder', data: {} });
    expect(res.status).toBe(200);
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(reconcileAllPending).not.toHaveBeenCalled();
  });

  it('confirms the booking from extraData.bookingId', async () => {
    confirmPayment.mockResolvedValue(true);
    const res = await post(URL_OK, {
      event: 'payment.received',
      data: { extraData: { bookingId: 'KB-ABC123' } },
    });
    expect(res.status).toBe(200);
    expect(confirmPayment).toHaveBeenCalledWith('KB-ABC123');
  });

  it('falls back to reconciling all pending when no bookingId is present', async () => {
    const res = await post(URL_OK, { event: 'payment.received', data: { id: 'txn-1' } });
    expect(res.status).toBe(200);
    expect(reconcileAllPending).toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it('still acks 200 when processing throws (Mayar retries are undocumented)', async () => {
    confirmPayment.mockRejectedValue(new Error('boom'));
    const res = await post(URL_OK, {
      event: 'payment.received',
      data: { extraData: { bookingId: 'KB-ABC123' } },
    });
    expect(res.status).toBe(200);
  });

  it('acks a malformed (non-JSON) body', async () => {
    const res = await POST(new Request(URL_OK, { method: 'POST', body: 'not-json' }));
    expect(res.status).toBe(200);
  });
});
