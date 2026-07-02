import { describe, it, expect, vi, beforeEach } from 'vitest';

const reconcileBookingStatus = vi.fn();
vi.mock('@/lib/konsultasi-payment-confirm', () => ({
  reconcileBookingStatus: (...a: unknown[]) => reconcileBookingStatus(...a),
}));

import { GET } from './route';

function get(bookingId: string) {
  return GET(new Request(`https://site.com/api/konsultasi/payment/status/${bookingId}`), {
    params: Promise.resolve({ bookingId }),
  });
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/konsultasi/payment/status/[bookingId]', () => {
  it('400s on a malformed booking id without touching the store', async () => {
    expect((await get('DROP TABLE')).status).toBe(400);
    expect(reconcileBookingStatus).not.toHaveBeenCalled();
  });

  it('404s when the booking does not exist', async () => {
    reconcileBookingStatus.mockResolvedValue(null);
    expect((await get('KB-NOPE')).status).toBe(404);
  });

  it('returns the reconciled status payload with the request origin', async () => {
    reconcileBookingStatus.mockResolvedValue({
      status: 'pending_payment', paymentUrl: 'https://x.myr.id/invoices/abc', meetLink: null,
      service: 'Konsultasi Keuangan — Paket Starter', date: '2099-01-01', time: '10:00', amount: '500000',
    });
    const res = await get('KB-ABC123');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.status).toBe('pending_payment');
    expect(json.paymentUrl).toBe('https://x.myr.id/invoices/abc');
    expect(reconcileBookingStatus).toHaveBeenCalledWith('KB-ABC123', 'https://site.com');
  });

  it('500s when reconciliation throws', async () => {
    reconcileBookingStatus.mockRejectedValue(new Error('sheets down'));
    expect((await get('KB-ABC123')).status).toBe(500);
  });
});
