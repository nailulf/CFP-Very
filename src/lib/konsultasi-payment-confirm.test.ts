// src/lib/konsultasi-payment-confirm.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getInvoice = vi.fn();
const createInvoice = vi.fn();
const isMayarConfigured = vi.fn(() => true);
vi.mock('./mayar', async (importOriginal) => ({
  getInvoice: (...a: unknown[]) => getInvoice(...a),
  createInvoice: (...a: unknown[]) => createInvoice(...a),
  isMayarConfigured: () => isMayarConfigured(),
  // Pure URL normalizer — use the real one so tests exercise actual behavior.
  invoiceUrl: (await importOriginal<typeof import('./mayar')>()).invoiceUrl,
}));

const getBookingById = vi.fn();
const listBookings = vi.fn();
const markPaid = vi.fn();
const setInvoiceId = vi.fn();
const setMeetLink = vi.fn();
const updateBookingStatus = vi.fn();
vi.mock('./konsultasi-store', () => ({
  getBookingById: (...a: unknown[]) => getBookingById(...a),
  listBookings: (...a: unknown[]) => listBookings(...a),
  markPaid: (...a: unknown[]) => markPaid(...a),
  setInvoiceId: (...a: unknown[]) => setInvoiceId(...a),
  setMeetLink: (...a: unknown[]) => setMeetLink(...a),
  updateBookingStatus: (...a: unknown[]) => updateBookingStatus(...a),
}));

const createBookingEvent = vi.fn();
vi.mock('./google-calendar', () => ({
  createBookingEvent: (...a: unknown[]) => createBookingEvent(...a),
}));

const getAvailabilityConfig = vi.fn();
vi.mock('./settings-store', () => ({
  getAvailabilityConfig: (...a: unknown[]) => getAvailabilityConfig(...a),
}));

import { confirmPayment, reconcileBookingStatus } from './konsultasi-payment-confirm';

const FRESH = new Date().toISOString();
const STALE = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'KB-1', name: 'Ann', email: 'a@x.com', phone: '0812',
    service: 'Konsultasi Keuangan — Paket Starter', amount: '500000',
    paymentStatus: 'pending_payment', bookingDate: '2099-01-01 10:00',
    date: '2099-01-01', time: '10:00', topic: 'Dana darurat',
    createdAt: FRESH, invoiceId: 'inv-1', paymentMethod: '', paidAt: '', meetLink: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  isMayarConfigured.mockReturnValue(true);
  getAvailabilityConfig.mockResolvedValue({ slotMinutes: 90 });
  createBookingEvent.mockResolvedValue({ meetLink: 'https://meet.google.com/abc' });
});

describe('confirmPayment', () => {
  it('marks paid + creates the calendar event only when Mayar says paid', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
    expect(createBookingEvent).toHaveBeenCalled();
    expect(setMeetLink).toHaveBeenCalledWith('KB-1', 'https://meet.google.com/abc');
  });

  it('does nothing when Mayar says unpaid', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid' });
    expect(await confirmPayment('KB-1')).toBe(false);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it('is idempotent: an already-paid booking only retries the calendar event', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'paid' }));
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(getInvoice).not.toHaveBeenCalled();
    expect(markPaid).not.toHaveBeenCalled();
    expect(createBookingEvent).toHaveBeenCalled();
  });

  it('never flips cancelled/refunded bookings back to paid', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'refunded' }));
    expect(await confirmPayment('KB-1')).toBe(false);
    expect(getInvoice).not.toHaveBeenCalled();
    expect(markPaid).not.toHaveBeenCalled();
  });

  it('allows expired → paid (customer money wins)', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'expired' }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    expect(await confirmPayment('KB-1')).toBe(true);
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
  });

  it('returns false for a missing booking or missing invoice id', async () => {
    getBookingById.mockResolvedValue(null);
    expect(await confirmPayment('KB-404')).toBe(false);
    getBookingById.mockResolvedValue(booking({ invoiceId: '' }));
    expect(await confirmPayment('KB-1')).toBe(false);
  });
});

describe('reconcileBookingStatus', () => {
  const ORIGIN = 'https://site.com';

  it('returns null for a missing booking', async () => {
    getBookingById.mockResolvedValue(null);
    expect(await reconcileBookingStatus('KB-404', ORIGIN)).toBeNull();
  });

  it('marks a stale pending booking expired (after a last-chance Mayar check)', async () => {
    getBookingById.mockResolvedValue(booking({ createdAt: STALE }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('expired');
    expect(updateBookingStatus).toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('paid wins over expired on the last-chance check', async () => {
    getBookingById.mockResolvedValue(booking({ createdAt: STALE }));
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
    expect(updateBookingStatus).not.toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('self-heals a booking without an invoice by creating one', async () => {
    getBookingById.mockResolvedValue(booking({ invoiceId: '' }));
    createInvoice.mockResolvedValue({ id: 'inv-new', link: 'https://x.myr.id/invoices/new' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBe('https://x.myr.id/invoices/new');
    expect(setInvoiceId).toHaveBeenCalledWith('KB-1', 'inv-new');
    const arg = createInvoice.mock.calls[0][0];
    expect(arg.statusUrl).toBe('https://site.com/konsultasi/booking/status/KB-1');
    expect(arg.amount).toBe(500000);
  });

  it('does not self-heal an invoice for a garbled amount', async () => {
    getBookingById.mockResolvedValue(booking({ invoiceId: '', amount: '' }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it('reconciles a missed webhook: pending in sheet, paid on Mayar', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(markPaid).toHaveBeenCalledWith('KB-1', 'mayar');
  });

  it('marks expired when Mayar closed the invoice', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'closed' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('expired');
    expect(updateBookingStatus).toHaveBeenCalledWith('KB-1', 'expired');
  });

  it('returns the payment link while still unpaid (detail shape: slug link + full paymentUrl)', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({
      id: 'inv-1',
      status: 'unpaid',
      link: 'abc123slug',
      paymentUrl: 'https://x.mayar.shop/invoices/abc123slug',
    });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBe('https://x.mayar.shop/invoices/abc123slug');
  });

  it('never exposes a bare slug as the payment url', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid', link: 'abc123slug' });
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBeNull();
  });

  it('stays pending (no crash) when Mayar is down', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockRejectedValue(new Error('ECONNREFUSED'));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('pending_payment');
    expect(r?.paymentUrl).toBeNull();
  });

  it('retries the calendar event for a paid booking with no meet link yet', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'paid', meetLink: '' }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(createBookingEvent).toHaveBeenCalled();
    expect(r?.meetLink).toBe('https://meet.google.com/abc');
  });

  it('passes terminal statuses through untouched', async () => {
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'cancelled' }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('cancelled');
    expect(getInvoice).not.toHaveBeenCalled();
  });
});
