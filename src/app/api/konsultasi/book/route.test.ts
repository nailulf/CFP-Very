import { describe, it, expect, vi, beforeEach } from 'vitest';

const isSlotAvailable = vi.fn();
vi.mock('@/lib/konsultasi-availability', () => ({
  isSlotAvailable: (...a: unknown[]) => isSlotAvailable(...a),
}));

const appendBooking = vi.fn();
const setInvoiceId = vi.fn();
const setPaymentLink = vi.fn();
vi.mock('@/lib/konsultasi-store', () => ({
  appendBooking: (...a: unknown[]) => appendBooking(...a),
  setInvoiceId: (...a: unknown[]) => setInvoiceId(...a),
  setPaymentLink: (...a: unknown[]) => setPaymentLink(...a),
}));

const getAvailabilityConfig = vi.fn();
const getPackagePricing = vi.fn();
vi.mock('@/lib/settings-store', () => ({
  getAvailabilityConfig: (...a: unknown[]) => getAvailabilityConfig(...a),
  getPackagePricing: (...a: unknown[]) => getPackagePricing(...a),
}));

const createInvoice = vi.fn();
const isMayarConfigured = vi.fn(() => true);
vi.mock('@/lib/mayar', async (importOriginal) => ({
  createInvoice: (...a: unknown[]) => createInvoice(...a),
  isMayarConfigured: () => isMayarConfigured(),
  invoiceUrl: (await importOriginal<typeof import('@/lib/mayar')>()).invoiceUrl,
}));

const sendMail = vi.fn();
const isMailerConfigured = vi.fn(() => true);
vi.mock('@/lib/mailer', () => ({
  sendMail: (...a: unknown[]) => sendMail(...a),
  isMailerConfigured: () => isMailerConfigured(),
}));

import { POST } from './route';

const FORM = {
  packageId: 'starter',
  name: 'Nailul',
  email: 'nailul@example.com',
  phone: '81806484509',
  date: '2099-09-30',
  timeSlot: '18:00',
  topic: 'Dana darurat',
};

function post(body: unknown = FORM) {
  return POST(
    new Request('https://temantumbuh.id/api/konsultasi/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  isSlotAvailable.mockResolvedValue(true);
  getAvailabilityConfig.mockResolvedValue({ slotMinutes: 90 });
  getPackagePricing.mockResolvedValue({ starter: 500000 });
  isMayarConfigured.mockReturnValue(true);
  createInvoice.mockResolvedValue({ id: 'inv-1', link: 'https://x.myr.id/invoices/abc' });
  isMailerConfigured.mockReturnValue(true);
  sendMail.mockResolvedValue(true);
  process.env.NEXT_PUBLIC_BASE_URL = 'https://temantumbuh.id';
});

describe('booking-created email', () => {
  it('emails the customer their payment link after the booking is recorded', async () => {
    const res = await post();
    expect(res.status).toBe(200);

    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0] as { to: string; html: string; subject: string };
    expect(sent.to).toBe('nailul@example.com');
    expect(sent.html).toContain('https://x.myr.id/invoices/abc');
  });

  it('puts the booking reference in the subject', async () => {
    const { bookingId } = await (await post()).json();
    const sent = sendMail.mock.calls[0][0] as { subject: string };
    expect(sent.subject).toContain(bookingId);
  });

  it('still emails, pointing at the status page, when Mayar is down', async () => {
    createInvoice.mockRejectedValue(new Error('mayar down'));

    const res = await post();
    const { bookingId, paymentUrl } = await res.json();

    expect(paymentUrl).toBeNull();
    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0] as { html: string };
    expect(sent.html).toContain(`https://temantumbuh.id/konsultasi/booking/status/${bookingId}`);
  });

  it('never emails a booking that was rejected for an unavailable slot', async () => {
    isSlotAvailable.mockResolvedValue(false);

    expect((await post()).status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('still succeeds when the mail send throws', async () => {
    sendMail.mockRejectedValue(new Error('smtp down'));

    const res = await post();

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(appendBooking).toHaveBeenCalled();
  });

  it('skips the send when the mailer is not configured', async () => {
    isMailerConfigured.mockReturnValue(false);

    expect((await post()).status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
