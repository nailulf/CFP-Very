// src/lib/konsultasi-payment-confirm.ts
import 'server-only';
import { createInvoice, getInvoice, invoiceUrl, isMayarConfigured } from './mayar';
import {
  claimConfirmationEmail,
  getBookingById,
  listBookings,
  markConfirmationEmailSent,
  markPaid,
  releaseConfirmationEmailClaim,
  setInvoiceId,
  setMeetLink,
  setPaymentLink,
  updateBookingStatus,
  type BookingDetail,
} from './konsultasi-store';
import { isMailerConfigured, sendMail } from './mailer';
import { paymentConfirmedEmail } from './emails/konsultasi';
import { createBookingEvent } from './google-calendar';
import { getAvailabilityConfig } from './settings-store';
import { isPaymentExpired, paymentDeadline, PAYMENT_WINDOW_MS } from './konsultasi-payment-window';

// Statuses a payment confirmation may transition from. `expired` is included
// because a customer who paid at the buzzer wins over our expiry ('paid' beats
// 'expired'); admin-set cancelled/refunded are never overridden by a webhook.
const CONFIRMABLE_STATUSES = new Set(['pending_payment', 'expired', 'menunggu_verifikasi']);

// Placeholder written to column O to claim "creating the calendar event"
// before the slow Calendar API call, so a concurrent trigger for the same
// booking (Mayar's webhook firing alongside the status page's poll, both of
// which react to the same payment) sees the claim and backs off instead of
// both creating a duplicate event. Timestamped so a claim orphaned by a
// crashed/timed-out request doesn't block the booking forever.
const CALENDAR_CLAIM_PREFIX = '__creating__:';
const CALENDAR_CLAIM_STALE_MS = 30_000;

function isActiveClaim(value: string): boolean {
  if (!value.startsWith(CALENDAR_CLAIM_PREFIX)) return false;
  const ts = Number(value.slice(CALENDAR_CLAIM_PREFIX.length));
  return Number.isFinite(ts) && Date.now() - ts <= CALENDAR_CLAIM_STALE_MS;
}

/** A meetLink cell value that's an actual link, not an empty/claim placeholder. */
function isRealMeetLink(value: string): boolean {
  return Boolean(value) && !value.startsWith(CALENDAR_CLAIM_PREFIX);
}

/**
 * Create the Calendar event + Meet invite for a paid booking. Idempotent via
 * column O; best-effort exactly like the old book-route behavior.
 *
 * `force` bypasses the column-O short-circuit so a booking whose Meet link was
 * pasted in by hand can still get a real Calendar event (admin path only — for
 * automatic triggers an existing link always wins). The concurrency claim is
 * still honored, and a failed forced re-create puts the old link back.
 */
async function ensureCalendarEvent(
  b: BookingDetail,
  { force = false }: { force?: boolean } = {},
): Promise<string | null> {
  if (!force && isRealMeetLink(b.meetLink)) return b.meetLink;
  if (!b.date || !b.time) return null;

  // b may be a stale snapshot fetched before slower work (Mayar
  // re-verification, markPaid) — re-check right before acting so a
  // concurrent caller that already finished (or is mid-flight) is seen.
  const fresh = await getBookingById(b.id);
  const freshLink = fresh?.meetLink || '';
  if (!force && isRealMeetLink(freshLink)) return freshLink;
  if (isActiveClaim(freshLink)) return null; // another call is creating it right now
  // Only set under `force`; restored verbatim if the re-create fails.
  const previousLink = isRealMeetLink(freshLink) ? freshLink : '';

  const claimed = await setMeetLink(b.id, `${CALENDAR_CLAIM_PREFIX}${Date.now()}`);
  if (!claimed) return null;

  let event: { meetLink?: string };
  try {
    const config = await getAvailabilityConfig();
    event = await createBookingEvent({
      date: b.date,
      time: b.time,
      durationMinutes: config.slotMinutes,
      summary: `Konsultasi Keuangan — ${b.service.replace(/^Konsultasi Keuangan — /, '')} (${b.name})`,
      description: [
        `Paket: ${b.service}`,
        `Nama: ${b.name}`,
        `Topik: ${b.topic}`,
        `No. Ref: ${b.id}`,
      ].join('\n'),
      clientEmail: b.email,
    });
  } catch (error) {
    // The claim already overwrote column O — put the cell back before
    // rethrowing, or a forced re-create would destroy the previous link.
    await setMeetLink(b.id, previousLink);
    throw error;
  }
  if (event.meetLink) {
    await setMeetLink(b.id, event.meetLink);
    return event.meetLink;
  }
  // Calendar isn't configured, or the API call failed — release the claim so
  // the next poll/webhook retries instead of getting stuck.
  await setMeetLink(b.id, previousLink);
  return previousLink || null;
}

/**
 * Email the customer that their payment landed, at most once per booking.
 *
 * Best-effort in the same sense as the calendar event: a mail failure must
 * never turn a confirmed payment into a failed request. Send-once is enforced
 * by the column-Q claim, because the Mayar webhook and the status-page poll
 * both react to the same payment.
 */
async function sendPaymentConfirmedEmail(
  b: BookingDetail,
  meetLink: string | null,
  origin: string,
): Promise<void> {
  if (!isMailerConfigured() || !b.email) return;
  if (!(await claimConfirmationEmail(b.id))) return;

  try {
    const content = paymentConfirmedEmail({
      bookingId: b.id,
      name: b.name,
      service: b.service,
      date: b.date,
      time: b.time,
      amount: b.amount,
      meetLink,
      statusUrl: `${origin}/konsultasi/booking/status/${b.id}`,
    });
    const sent = await sendMail({ to: b.email, ...content });
    if (sent) await markConfirmationEmailSent(b.id);
    else await releaseConfirmationEmailClaim(b.id);
  } catch (error) {
    console.error(`sendPaymentConfirmedEmail failed for ${b.id}`, error);
    await releaseConfirmationEmailClaim(b.id);
  }
}

/** Public site origin, for links inside emails sent outside a request context. */
function siteOrigin(fallback?: string): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || fallback || '').replace(/\/+$/, '');
}

/**
 * Mark a booking paid — but only after Mayar itself confirms the invoice is
 * paid (webhooks are unsigned; the API re-fetch is the only trusted source).
 * Idempotent: an already-paid booking only retries its calendar event.
 */
export async function confirmPayment(bookingId: string): Promise<boolean> {
  const b = await getBookingById(bookingId);
  if (!b) return false;
  if (b.paymentStatus === 'paid') {
    const meetLink = await ensureCalendarEvent(b);
    await sendPaymentConfirmedEmail(b, meetLink, siteOrigin());
    return true;
  }
  if (!CONFIRMABLE_STATUSES.has(b.paymentStatus)) return false;
  if (!b.invoiceId) return false;
  const invoice = await getInvoice(b.invoiceId);
  if (invoice.status !== 'paid') return false;
  await markPaid(bookingId, 'mayar');
  const meetLink = await ensureCalendarEvent(b);
  await sendPaymentConfirmedEmail(b, meetLink, siteOrigin());
  return true;
}

/** Column I value marking a payment an admin confirmed by hand, not via Mayar. */
export const MANUAL_PAYMENT_METHOD = 'manual';

/**
 * Admin-side counterpart to confirmPayment: the admin has seen the money
 * (bank transfer, cash, a Mayar payment that never reached us) and is
 * asserting it, so there is no invoice to re-verify. Runs the same
 * fulfillment as a webhook — mark paid, calendar event, confirmation email —
 * so "mark as paid" is not just a column-G write.
 *
 * Returns false only when the booking id is unknown; calendar/mail failures
 * are best-effort and never undo the payment record.
 */
export async function confirmPaymentManually(
  bookingId: string,
  { recreateCalendarEvent = false }: { recreateCalendarEvent?: boolean } = {},
): Promise<boolean> {
  const b = await getBookingById(bookingId);
  if (!b) return false;

  // Skip the write only for a booking that is already fully recorded as paid —
  // that keeps a Mayar method + paid-at intact. A booking flipped to 'paid' by
  // the old column-G-only admin path has an empty method, and gets backfilled.
  if (b.paymentStatus !== 'paid' || !b.paymentMethod) {
    await markPaid(bookingId, MANUAL_PAYMENT_METHOD);
  }

  try {
    const meetLink = await ensureCalendarEvent(b, { force: recreateCalendarEvent });
    await sendPaymentConfirmedEmail(b, meetLink, siteOrigin());
  } catch (error) {
    // The booking is paid in the sheet either way; the status page and a
    // repeat "mark as paid" both retry fulfillment.
    console.error(`confirmPaymentManually: fulfillment failed for ${bookingId}`, error);
  }
  return true;
}

/**
 * Webhook fallback when no bookingId can be extracted from the payload:
 * reconcile the most recent pending bookings against Mayar.
 */
export async function reconcileAllPending(limit = 20): Promise<void> {
  const bookings = await listBookings(); // newest first
  const pending = bookings.filter((b) => b.paymentStatus === 'pending_payment').slice(0, limit);
  for (const b of pending) {
    try {
      await confirmPayment(b.id);
    } catch (error) {
      console.error(`reconcileAllPending: ${b.id} failed`, error);
    }
  }
}

export type BookingStatusResult = {
  status: string;
  paymentUrl: string | null;
  meetLink: string | null;
  service: string;
  date: string | null;
  time: string | null;
  amount: string;
};

/**
 * Source of truth for the public status page: handles expiry, invoice
 * self-healing (Mayar was down at booking time), and payment reconciliation
 * (missed webhook) in one pass. Intentionally returns no name/email/phone —
 * booking ids are guessable timestamps, so the payload stays low-PII.
 */
export async function reconcileBookingStatus(
  bookingId: string,
  origin: string,
): Promise<BookingStatusResult | null> {
  const b = await getBookingById(bookingId);
  if (!b) return null;

  const result = (status: string, paymentUrl: string | null = null): BookingStatusResult => ({
    status,
    paymentUrl,
    meetLink: isRealMeetLink(b.meetLink) ? b.meetLink : null,
    service: b.service,
    date: b.date,
    time: b.time,
    amount: b.amount,
  });

  if (b.paymentStatus === 'paid') {
    // Retry the calendar event while column O is still empty.
    const meetLink = await ensureCalendarEvent(b);
    await sendPaymentConfirmedEmail(b, meetLink, siteOrigin(origin));
    return { ...result('paid'), meetLink };
  }
  if (b.paymentStatus !== 'pending_payment') return result(b.paymentStatus);

  // Expiry: 1-hour window, clamped to the appointment start.
  if (isPaymentExpired(b.createdAt, b.date, b.time, new Date())) {
    if (b.invoiceId) {
      // Last-chance check — a payment at 59:59 beats our expiry.
      try {
        if (await confirmPayment(bookingId)) {
          const fresh = await getBookingById(bookingId);
          const freshLink = fresh?.meetLink || '';
          return { ...result('paid'), meetLink: isRealMeetLink(freshLink) ? freshLink : null };
        }
      } catch (error) {
        console.error(`reconcileBookingStatus: last-chance check failed for ${bookingId}`, error);
      }
    }
    await updateBookingStatus(bookingId, 'expired');
    return result('expired');
  }

  // Self-heal: Mayar was down when the booking was created — no invoice yet.
  if (!b.invoiceId) {
    if (!isMayarConfigured()) return result('pending_payment');
    const amount = Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.error(
        `reconcileBookingStatus: refusing to self-heal invoice for ${bookingId} — bad amount "${b.amount}"`,
      );
      return result('pending_payment');
    }
    try {
      const invoice = await createInvoice({
        bookingId,
        name: b.name,
        email: b.email,
        mobile: b.phone,
        serviceLabel: b.service,
        amount,
        expiredAt:
          paymentDeadline(b.createdAt, b.date, b.time) ?? new Date(Date.now() + PAYMENT_WINDOW_MS),
        statusUrl: `${origin}/konsultasi/booking/status/${bookingId}`,
      });
      await setInvoiceId(bookingId, invoice.id);
      const selfHealedUrl = invoiceUrl(invoice);
      if (selfHealedUrl) await setPaymentLink(bookingId, selfHealedUrl);
      return result('pending_payment', selfHealedUrl);
    } catch (error) {
      console.error(`reconcileBookingStatus: self-heal invoice failed for ${bookingId}`, error);
      return result('pending_payment');
    }
  }

  // Reconcile against Mayar (covers a missed webhook).
  try {
    const invoice = await getInvoice(b.invoiceId);
    if (invoice.status === 'paid') {
      await markPaid(bookingId, 'mayar');
      const meetLink = await ensureCalendarEvent(b);
      await sendPaymentConfirmedEmail(b, meetLink, siteOrigin(origin));
      return { ...result('paid'), meetLink };
    }
    if (invoice.status === 'closed') {
      await updateBookingStatus(bookingId, 'expired');
      return result('expired');
    }
    return result('pending_payment', invoiceUrl(invoice));
  } catch (error) {
    // Mayar down — stay pending; the page polls again shortly.
    console.error(`reconcileBookingStatus: reconcile failed for ${bookingId}`, error);
    return result('pending_payment');
  }
}
