import { describe, it, expect, vi, beforeEach } from 'vitest';

const getInvoiceSession = vi.fn();
vi.mock('@/lib/invoice-auth', () => ({
  getInvoiceSession: (...a: unknown[]) => getInvoiceSession(...a),
}));

const updateBookingStatus = vi.fn();
vi.mock('@/lib/konsultasi-store', () => ({
  updateBookingStatus: (...a: unknown[]) => updateBookingStatus(...a),
}));

const confirmPaymentManually = vi.fn();
vi.mock('@/lib/konsultasi-payment-confirm', () => ({
  confirmPaymentManually: (...a: unknown[]) => confirmPaymentManually(...a),
}));

import { PATCH } from './route';

function patch(body: unknown, id = 'KB-1') {
  return PATCH(
    new Request(`https://site.com/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getInvoiceSession.mockResolvedValue({ user: 'admin' });
  updateBookingStatus.mockResolvedValue(true);
  confirmPaymentManually.mockResolvedValue(true);
});

describe('PATCH /api/admin/bookings/[id]', () => {
  it('401s without a session', async () => {
    getInvoiceSession.mockResolvedValue(null);
    const res = await patch({ status: 'paid' });
    expect(res.status).toBe(401);
    expect(confirmPaymentManually).not.toHaveBeenCalled();
    expect(updateBookingStatus).not.toHaveBeenCalled();
  });

  it('400s on an invalid status', async () => {
    expect((await patch({ status: 'lunas' })).status).toBe(400);
    expect((await patch(null)).status).toBe(400);
    expect(confirmPaymentManually).not.toHaveBeenCalled();
  });

  it('runs the full fulfillment path when marking a booking paid', async () => {
    const res = await patch({ status: 'paid' });
    expect(res.status).toBe(200);
    // Not a bare column-G write: paid goes through the same path as a webhook.
    expect(updateBookingStatus).not.toHaveBeenCalled();
    expect(confirmPaymentManually).toHaveBeenCalledWith('KB-1', { recreateCalendarEvent: false });
  });

  it('forwards the calendar re-create flag when the admin asks for it', async () => {
    const res = await patch({ status: 'paid', recreateCalendarEvent: true });
    expect(res.status).toBe(200);
    expect(confirmPaymentManually).toHaveBeenCalledWith('KB-1', { recreateCalendarEvent: true });
  });

  it('404s when the booking does not exist', async () => {
    confirmPaymentManually.mockResolvedValue(false);
    expect((await patch({ status: 'paid' })).status).toBe(404);
  });

  it('keeps the plain status write for every other status', async () => {
    for (const status of ['pending_payment', 'cancelled', 'refunded', 'expired']) {
      const res = await patch({ status });
      expect(res.status).toBe(200);
      expect(updateBookingStatus).toHaveBeenCalledWith('KB-1', status);
    }
    expect(confirmPaymentManually).not.toHaveBeenCalled();
  });

  it('404s when a non-paid status targets a missing booking', async () => {
    updateBookingStatus.mockResolvedValue(false);
    expect((await patch({ status: 'cancelled' })).status).toBe(404);
  });
});
