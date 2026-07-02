import { NextResponse } from 'next/server';
import { confirmPayment, reconcileAllPending } from '@/lib/konsultasi-payment-confirm';

export const dynamic = 'force-dynamic';

/**
 * Mayar webhook receiver (event: payment.received). Mayar webhooks carry no
 * signature, so this handler treats the payload as a hint only: the shared
 * token gates the route, and payment truth always comes from re-fetching the
 * invoice inside confirmPayment().
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const expected = process.env.MAYAR_WEBHOOK_TOKEN;
  if (!expected || token !== expected) {
    // 404 (not 401) so URL probing can't distinguish this from a missing route.
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    event?: string;
    data?: { extraData?: { bookingId?: unknown } };
  } | null;

  // Ack everything that isn't a payment (payment.reminder, membership.*, …).
  if (body?.event !== 'payment.received') return NextResponse.json({ success: true });

  const bookingId = body.data?.extraData?.bookingId;
  try {
    if (typeof bookingId === 'string' && /^KB-[A-Z0-9]+$/.test(bookingId)) {
      await confirmPayment(bookingId);
    } else {
      // Payload shape drifted — reconcile recent pending bookings instead.
      await reconcileAllPending();
    }
  } catch (error) {
    // Always 200: Mayar's retry behavior is undocumented; status-page polling
    // is the safety net for anything missed here.
    console.error('Mayar webhook processing error (acked):', error);
  }
  return NextResponse.json({ success: true });
}
