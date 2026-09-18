import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { updateBookingStatus } from '@/lib/konsultasi-store';
import { confirmPaymentManually } from '@/lib/konsultasi-payment-confirm';

export const ADMIN_BOOKING_STATUSES = ['pending_payment', 'paid', 'cancelled', 'refunded', 'expired'] as const;

const schema = z.object({
  status: z.enum(ADMIN_BOOKING_STATUSES),
  // Opt-in: force a new Calendar event even though column O already holds a
  // link. Needed because a hand-pasted Meet link otherwise blocks automatic
  // event creation forever. Off by default so the common case can't produce
  // duplicate invites.
  recreateCalendarEvent: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Status tidak valid.' }, { status: 400 });
  }

  // 'paid' is a fulfillment event, not a status edit: it must record the
  // payment method + paid-at, create the Calendar event, and send the
  // payment-confirmed email — the same work a Mayar webhook would do.
  const ok =
    parsed.data.status === 'paid'
      ? await confirmPaymentManually(id, {
          recreateCalendarEvent: parsed.data.recreateCalendarEvent === true,
        })
      : await updateBookingStatus(id, parsed.data.status);
  if (!ok) return NextResponse.json({ success: false, message: 'Booking tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
