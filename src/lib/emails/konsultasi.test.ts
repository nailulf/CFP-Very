// src/lib/emails/konsultasi.test.ts
import { describe, it, expect } from 'vitest';
import { bookingCreatedEmail, paymentConfirmedEmail } from './konsultasi';

const BASE = {
  bookingId: 'KB-MU6URVLR',
  name: 'Nailul',
  service: 'Konsultasi Keuangan — Paket Starter',
  date: '2026-09-30',
  time: '18:00',
  amount: '500000',
  statusUrl: 'https://temantumbuh.id/konsultasi/booking/status/KB-MU6URVLR',
};

describe('bookingCreatedEmail', () => {
  const input = {
    ...BASE,
    paymentUrl: 'https://temantumbuh-9848.myr.id/invoices/o36qf7vpca',
    deadline: new Date('2026-09-18T12:06:06.570Z'),
  };

  it('puts the booking reference in the subject so replies are traceable', () => {
    expect(bookingCreatedEmail(input).subject).toContain('KB-MU6URVLR');
  });

  it('links the Mayar payment URL as the primary call to action', () => {
    const { html, text } = bookingCreatedEmail(input);
    expect(html).toContain('href="https://temantumbuh-9848.myr.id/invoices/o36qf7vpca"');
    expect(text).toContain('https://temantumbuh-9848.myr.id/invoices/o36qf7vpca');
  });

  it('falls back to the status page when Mayar produced no payment link', () => {
    const { html, text } = bookingCreatedEmail({ ...input, paymentUrl: null });
    expect(html).toContain(`href="${BASE.statusUrl}"`);
    expect(text).toContain(BASE.statusUrl);
    expect(html).not.toContain('href=""');
    expect(html).not.toMatch(/null|undefined/);
  });

  it('renders the session slot in Indonesian WIB wording', () => {
    const { text } = bookingCreatedEmail(input);
    expect(text).toContain('30 September 2026');
    expect(text).toContain('18:00 WIB');
  });

  it('formats the amount as Indonesian rupiah', () => {
    expect(bookingCreatedEmail(input).text).toContain('Rp 500.000');
  });

  it('states the payment deadline in WIB', () => {
    // 2026-09-18T12:06Z is 19:06 WIB.
    expect(bookingCreatedEmail(input).text).toContain('19:06 WIB');
  });

  it('escapes HTML in customer-supplied values', () => {
    const { html } = bookingCreatedEmail({ ...input, name: '<script>alert(1)</script>Bob & Co' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('Bob &amp; Co');
  });
});

describe('paymentConfirmedEmail', () => {
  const input = { ...BASE, meetLink: 'https://meet.google.com/qjb-ffhc-zhk' };

  it('puts the booking reference in the subject', () => {
    expect(paymentConfirmedEmail(input).subject).toContain('KB-MU6URVLR');
  });

  it('gives the customer the Google Meet link', () => {
    const { html, text } = paymentConfirmedEmail(input);
    expect(html).toContain('href="https://meet.google.com/qjb-ffhc-zhk"');
    expect(text).toContain('https://meet.google.com/qjb-ffhc-zhk');
  });

  it('never renders a broken link when the calendar has not produced one yet', () => {
    const { html, text } = paymentConfirmedEmail({ ...input, meetLink: null });
    expect(html).not.toContain('href=""');
    expect(html).not.toMatch(/null|undefined/);
    expect(text).toMatch(/menyusul/i);
  });

  it('still points the customer at their status page as an anchor', () => {
    expect(paymentConfirmedEmail({ ...input, meetLink: null }).html).toContain(
      `href="${BASE.statusUrl}"`,
    );
  });

  it('renders the session slot in Indonesian WIB wording', () => {
    expect(paymentConfirmedEmail(input).text).toContain('30 September 2026');
    expect(paymentConfirmedEmail(input).text).toContain('18:00 WIB');
  });

  it('tolerates a booking row with an unparseable date without emitting placeholders', () => {
    const { html } = paymentConfirmedEmail({ ...input, date: null, time: null });
    expect(html).not.toMatch(/null|undefined|NaN|Invalid Date/);
  });
});
