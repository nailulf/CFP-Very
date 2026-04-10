import { NextResponse } from 'next/server';
import { getBookingById } from '@/lib/sheets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        payment_status: booking.payment_status,
        service_type: booking.service_type,
        amount: booking.amount,
        booking_date: booking.booking_date,
        client_name: booking.client_name,
        client_email: booking.client_email,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    );
  }
}
