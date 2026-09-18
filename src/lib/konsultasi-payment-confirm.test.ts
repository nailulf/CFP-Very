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
const setPaymentLink = vi.fn();
const updateBookingStatus = vi.fn();
const claimConfirmationEmail = vi.fn();
const markConfirmationEmailSent = vi.fn();
const releaseConfirmationEmailClaim = vi.fn();
vi.mock('./konsultasi-store', () => ({
  getBookingById: (...a: unknown[]) => getBookingById(...a),
  listBookings: (...a: unknown[]) => listBookings(...a),
  markPaid: (...a: unknown[]) => markPaid(...a),
  setInvoiceId: (...a: unknown[]) => setInvoiceId(...a),
  setMeetLink: (...a: unknown[]) => setMeetLink(...a),
  setPaymentLink: (...a: unknown[]) => setPaymentLink(...a),
  updateBookingStatus: (...a: unknown[]) => updateBookingStatus(...a),
  claimConfirmationEmail: (...a: unknown[]) => claimConfirmationEmail(...a),
  markConfirmationEmailSent: (...a: unknown[]) => markConfirmationEmailSent(...a),
  releaseConfirmationEmailClaim: (...a: unknown[]) => releaseConfirmationEmailClaim(...a),
}));

const sendMail = vi.fn();
const isMailerConfigured = vi.fn(() => true);
vi.mock('./mailer', () => ({
  sendMail: (...a: unknown[]) => sendMail(...a),
  isMailerConfigured: () => isMailerConfigured(),
}));

const createBookingEvent = vi.fn();
vi.mock('./google-calendar', () => ({
  createBookingEvent: (...a: unknown[]) => createBookingEvent(...a),
}));

const getAvailabilityConfig = vi.fn();
vi.mock('./settings-store', () => ({
  getAvailabilityConfig: (...a: unknown[]) => getAvailabilityConfig(...a),
}));

import { confirmPayment, confirmPaymentManually, reconcileBookingStatus } from './konsultasi-payment-confirm';

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
  setMeetLink.mockResolvedValue(true);
  isMailerConfigured.mockReturnValue(true);
  claimConfirmationEmail.mockResolvedValue(true);
  sendMail.mockResolvedValue(true);
  process.env.NEXT_PUBLIC_BASE_URL = 'https://temantumbuh.id';
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
    expect(setPaymentLink).toHaveBeenCalledWith('KB-1', 'https://x.myr.id/invoices/new');
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

  it('does not create a duplicate calendar event when a concurrent call already claimed it', async () => {
    // Initial fetch sees no meet link yet; the re-check right before creating
    // the event sees another in-flight call's claim (e.g. the webhook firing
    // alongside this status-page poll) and backs off instead of racing it.
    getBookingById
      .mockResolvedValueOnce(booking({ paymentStatus: 'paid', meetLink: '' }))
      .mockResolvedValueOnce(booking({ paymentStatus: 'paid', meetLink: `__creating__:${Date.now()}` }));
    const r = await reconcileBookingStatus('KB-1', ORIGIN);
    expect(r?.status).toBe('paid');
    expect(r?.meetLink).toBeNull();
    expect(createBookingEvent).not.toHaveBeenCalled();
    expect(setMeetLink).not.toHaveBeenCalled();
  });

  it('reclaims a stale (abandoned) claim and creates the event', async () => {
    // A claim older than the staleness window means a prior request crashed
    // or timed out mid-flight — treat it as abandoned rather than blocking
    // the booking from ever getting a calendar event.
    getBookingById
      .mockResolvedValueOnce(booking({ paymentStatus: 'paid', meetLink: '' }))
      .mockResolvedValueOnce(booking({ paymentStatus: 'paid', meetLink: `__creating__:${Date.now() - 60_000}` }));
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

describe('payment-confirmed email', () => {
  it('emails the customer once Mayar confirms the payment', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });

    await confirmPayment('KB-1');

    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0] as { to: string; subject: string; html: string };
    expect(sent.to).toBe('a@x.com');
    expect(sent.subject).toContain('KB-1');
    expect(sent.html).toContain('https://meet.google.com/abc');
  });

  it('records the send so a later trigger does not email again', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });

    await confirmPayment('KB-1');

    expect(markConfirmationEmailSent).toHaveBeenCalledWith('KB-1');
    expect(releaseConfirmationEmailClaim).not.toHaveBeenCalled();
  });

  it('stays silent when another request already holds the send claim', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    claimConfirmationEmail.mockResolvedValue(false);

    await confirmPayment('KB-1');

    expect(sendMail).not.toHaveBeenCalled();
  });

  it('releases the claim when the send fails, so the next trigger retries', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(confirmPayment('KB-1')).resolves.toBe(true);

    expect(releaseConfirmationEmailClaim).toHaveBeenCalledWith('KB-1');
    expect(markConfirmationEmailSent).not.toHaveBeenCalled();
  });

  it('never emails a booking Mayar has not confirmed', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'unpaid' });

    await confirmPayment('KB-1');

    expect(claimConfirmationEmail).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('still confirms the payment when the mailer is not configured', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    isMailerConfigured.mockReturnValue(false);

    await expect(confirmPayment('KB-1')).resolves.toBe(true);

    expect(markPaid).toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('sends the confirmation even when the calendar produced no Meet link', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });
    createBookingEvent.mockResolvedValue({});

    await confirmPayment('KB-1');

    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0] as { text: string };
    expect(sent.text).toMatch(/menyusul/i);
  });

  it('emails from the status-page reconcile path too (missed webhook)', async () => {
    getBookingById.mockResolvedValue(booking());
    getInvoice.mockResolvedValue({ id: 'inv-1', status: 'paid' });

    await reconcileBookingStatus('KB-1', 'https://temantumbuh.id');

    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});

describe('confirmPaymentManually (admin marks a booking paid)', () => {
  it('marks paid with the manual method, not mayar, and never calls Mayar', async () => {
    getBookingById.mockResolvedValue(booking());

    expect(await confirmPaymentManually('KB-1')).toBe(true);

    expect(markPaid).toHaveBeenCalledWith('KB-1', 'manual');
    expect(getInvoice).not.toHaveBeenCalled();
  });

  it('creates the calendar event and emails the customer', async () => {
    getBookingById.mockResolvedValue(booking());

    await confirmPaymentManually('KB-1');

    expect(createBookingEvent).toHaveBeenCalled();
    expect(setMeetLink).toHaveBeenCalledWith('KB-1', 'https://meet.google.com/abc');
    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0] as { to: string; html: string };
    expect(sent.to).toBe('a@x.com');
    expect(sent.html).toContain('https://meet.google.com/abc');
  });

  it('returns false for a missing booking', async () => {
    getBookingById.mockResolvedValue(null);

    expect(await confirmPaymentManually('KB-404')).toBe(false);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it('backfills method + paid-at for a booking already flipped to paid without them', async () => {
    // The production case (KB-MU6URVLR): column G said paid, I and K were empty.
    getBookingById.mockResolvedValue(booking({ paymentStatus: 'paid', paymentMethod: '', paidAt: '' }));

    await confirmPaymentManually('KB-1');

    expect(markPaid).toHaveBeenCalledWith('KB-1', 'manual');
  });

  it('does not overwrite a Mayar-recorded payment method', async () => {
    getBookingById.mockResolvedValue(
      booking({ paymentStatus: 'paid', paymentMethod: 'mayar', paidAt: FRESH }),
    );

    await confirmPaymentManually('KB-1');

    expect(markPaid).not.toHaveBeenCalled();
    expect(createBookingEvent).toHaveBeenCalled(); // fulfillment still retried
  });

  it('leaves a hand-pasted Meet link alone by default', async () => {
    getBookingById.mockResolvedValue(booking({ meetLink: 'https://meet.google.com/hand-pasted' }));

    await confirmPaymentManually('KB-1');

    expect(createBookingEvent).not.toHaveBeenCalled();
    expect(setMeetLink).not.toHaveBeenCalled();
  });

  it('re-creates the event over a hand-pasted Meet link when forced', async () => {
    getBookingById.mockResolvedValue(booking({ meetLink: 'https://meet.google.com/hand-pasted' }));

    await confirmPaymentManually('KB-1', { recreateCalendarEvent: true });

    expect(createBookingEvent).toHaveBeenCalled();
    expect(setMeetLink).toHaveBeenLastCalledWith('KB-1', 'https://meet.google.com/abc');
  });

  it('restores the previous Meet link when a forced re-create fails', async () => {
    getBookingById.mockResolvedValue(booking({ meetLink: 'https://meet.google.com/hand-pasted' }));
    createBookingEvent.mockResolvedValue({});

    await confirmPaymentManually('KB-1', { recreateCalendarEvent: true });

    expect(setMeetLink).toHaveBeenLastCalledWith('KB-1', 'https://meet.google.com/hand-pasted');
  });

  it('restores the previous Meet link when the calendar API throws mid-recreate', async () => {
    getBookingById.mockResolvedValue(booking({ meetLink: 'https://meet.google.com/hand-pasted' }));
    createBookingEvent.mockRejectedValue(new Error('calendar down'));

    await confirmPaymentManually('KB-1', { recreateCalendarEvent: true });

    expect(setMeetLink).toHaveBeenLastCalledWith('KB-1', 'https://meet.google.com/hand-pasted');
  });

  it('backs off when a concurrent call already claimed the calendar event', async () => {
    getBookingById
      .mockResolvedValueOnce(booking())
      .mockResolvedValueOnce(booking({ meetLink: `__creating__:${Date.now()}` }));

    await confirmPaymentManually('KB-1', { recreateCalendarEvent: true });

    expect(createBookingEvent).not.toHaveBeenCalled();
  });

  it('still confirms when the calendar and mailer are unavailable', async () => {
    getBookingById.mockResolvedValue(booking());
    createBookingEvent.mockRejectedValue(new Error('calendar down'));
    isMailerConfigured.mockReturnValue(false);

    await expect(confirmPaymentManually('KB-1')).resolves.toBe(true);

    expect(markPaid).toHaveBeenCalledWith('KB-1', 'manual');
  });
});
