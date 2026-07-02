import { NextResponse } from 'next/server';
import { reconcileBookingStatus } from '@/lib/konsultasi-payment-confirm';

export const dynamic = 'force-dynamic';

/**
 * Public booking-status endpoint polled by /konsultasi/booking/status/[bookingId].
 * The bookingId acts as the capability (same model as the proof-upload route);
 * the payload deliberately excludes name/email/phone.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  if (!/^KB-[A-Z0-9]+$/.test(bookingId)) {
    return NextResponse.json({ success: false, message: 'Invalid booking id' }, { status: 400 });
  }
  try {
    const origin = process.env.MAYAR_PUBLIC_ORIGIN || new URL(request.url).origin;
    const result = await reconcileBookingStatus(bookingId, origin);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Konsultasi booking status error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
