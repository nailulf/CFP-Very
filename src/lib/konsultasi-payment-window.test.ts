import { describe, it, expect } from 'vitest';
import { PAYMENT_WINDOW_MS, paymentDeadline, isPaymentExpired } from './konsultasi-payment-window';

describe('paymentDeadline', () => {
  it('is createdAt + 1h when the appointment is far away', () => {
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', '2026-07-10', '10:00');
    expect(d?.toISOString()).toBe('2026-07-02T04:00:00.000Z');
  });

  it('clamps to the appointment start (WIB) when that is sooner', () => {
    // Appointment 2026-07-02 10:30 WIB = 03:30 UTC; created 03:00 UTC.
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', '2026-07-02', '10:30');
    expect(d?.toISOString()).toBe('2026-07-02T03:30:00.000Z');
  });

  it('ignores the clamp when date/time are missing', () => {
    const d = paymentDeadline('2026-07-02T03:00:00.000Z', null, null);
    expect(d?.toISOString()).toBe('2026-07-02T04:00:00.000Z');
  });

  it('returns null for an unparsable createdAt', () => {
    expect(paymentDeadline('not-a-date', '2026-07-10', '10:00')).toBeNull();
  });

  it('exports a 1-hour window', () => {
    expect(PAYMENT_WINDOW_MS).toBe(60 * 60 * 1000);
  });
});

describe('isPaymentExpired', () => {
  const created = '2026-07-02T03:00:00.000Z';

  it('is false inside the window', () => {
    expect(isPaymentExpired(created, '2026-07-10', '10:00', new Date('2026-07-02T03:59:00Z'))).toBe(false);
  });

  it('is true after the window', () => {
    expect(isPaymentExpired(created, '2026-07-10', '10:00', new Date('2026-07-02T04:00:01Z'))).toBe(true);
  });

  it('is true once the appointment has started even within 1h of creation', () => {
    expect(isPaymentExpired(created, '2026-07-02', '10:30', new Date('2026-07-02T03:31:00Z'))).toBe(true);
  });

  it('fails safe (not expired) when createdAt is malformed', () => {
    expect(isPaymentExpired('', '2026-07-10', '10:00', new Date('2027-01-01T00:00:00Z'))).toBe(false);
  });
});
