/** How long an unpaid booking holds its slot (and its Mayar invoice stays payable). */
export const PAYMENT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * When payment must be completed: createdAt + 1h, clamped to the appointment
 * start (WIB). Returns null when createdAt can't be parsed.
 */
export function paymentDeadline(
  createdAtISO: string,
  date: string | null,
  time: string | null,
): Date | null {
  const created = new Date(createdAtISO);
  if (Number.isNaN(created.getTime())) return null;
  let deadline = created.getTime() + PAYMENT_WINDOW_MS;
  if (date && time) {
    const appt = new Date(`${date}T${time}:00+07:00`).getTime();
    if (!Number.isNaN(appt)) deadline = Math.min(deadline, appt);
  }
  return new Date(deadline);
}

/**
 * True when an unpaid booking's payment window has closed. A malformed
 * createdAt fails safe (not expired) so a bad row never silently frees a slot
 * that might still get paid.
 */
export function isPaymentExpired(
  createdAtISO: string,
  date: string | null,
  time: string | null,
  now: Date,
): boolean {
  const deadline = paymentDeadline(createdAtISO, date, time);
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}
