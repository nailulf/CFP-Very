import { NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/lib/sheets';
import { checkPaymentStatus } from '@/lib/doku';
import { createCalendarEvent } from '@/lib/calendar';
import { sendBookingConfirmation } from '@/lib/email';
import { getServiceById, services, formatPrice } from '@/data/services';

function parseBookingDate(bookingDate: string): { start: Date; end: Date } | null {
  try {
    const match = bookingDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const [, datePart, hourStr, minuteStr, ampm] = match;
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      const dateStr = `${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;
      const start = new Date(dateStr);
      if (!isNaN(start.getTime())) {
        return { start, end: new Date(start.getTime() + 30 * 60 * 1000) };
      }
    }
    return null;
  } catch {
    return null;
  }
}

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

    // If already paid, return immediately
    if (booking.payment_status === 'paid') {
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
    }

    // Check payment status from DOKU
    try {
      const dokuStatus = await checkPaymentStatus(id);
      console.log('DOKU status for', id, ':', dokuStatus);

      const statusUpper = (dokuStatus.status || '').toUpperCase();
      const isPaid = statusUpper === 'SUCCESS' || statusUpper === 'PAID' || statusUpper === 'SETTLED';

      if (isPaid && booking.payment_status !== 'paid') {
        console.log('Payment confirmed by DOKU, processing...');

        // 1. Create calendar event with Meet link
        let meetLink: string | null = null;
        const bookingDate = booking.booking_date || '';
        console.log('Booking date from sheet:', JSON.stringify(bookingDate));
        const parsed = parseBookingDate(bookingDate);
        console.log('Parsed booking date:', parsed);

        if (parsed) {
          try {
            const calResult = await createCalendarEvent({
              summary: `Discovery Call - ${booking.client_name}`,
              description: `1-on-1 Discovery Call with ${booking.client_name}\nEmail: ${booking.client_email}\nPhone: ${booking.client_phone || '-'}\nBooked via Teman Tumbuh website`,
              startTime: parsed.start.toISOString(),
              endTime: parsed.end.toISOString(),
              attendeeEmail: booking.client_email,
              attendeeName: booking.client_name,
            });
            meetLink = calResult.meetLink;
            console.log('Calendar event created', { meetLink });
          } catch (calError) {
            console.error('Calendar error:', calError);
          }
        } else {
          console.error('Could not parse booking date:', JSON.stringify(bookingDate));
        }

        // 2. Update sheet
        await updateBookingStatus(id, {
          payment_status: 'paid',
          payment_method: dokuStatus.paymentMethod,
          paid_at: new Date().toISOString(),
          meet_link: meetLink || undefined,
        });
        console.log('Sheet updated to paid');

        // 3. Send confirmation email
        try {
          const service = getServiceById(booking.service_type) || services[0];
          const dateTimeParts = bookingDate.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
          const displayDate = dateTimeParts ? dateTimeParts[1] : bookingDate;
          const displayTime = dateTimeParts ? dateTimeParts[2] : '';

          await sendBookingConfirmation({
            clientName: booking.client_name,
            clientEmail: booking.client_email,
            serviceName: service.name,
            bookingDate: displayDate,
            bookingTime: displayTime,
            duration: service.duration,
            price: formatPrice(booking.amount),
            startTime: parsed?.start || new Date(),
            endTime: parsed?.end || new Date(),
            meetLink,
          });
          console.log('Email sent to', booking.client_email);
        } catch (emailError) {
          console.error('Email error:', emailError);
        }

        return NextResponse.json({
          success: true,
          booking: {
            id: booking.id,
            payment_status: 'paid',
            service_type: booking.service_type,
            amount: booking.amount,
            booking_date: booking.booking_date,
            client_name: booking.client_name,
            client_email: booking.client_email,
          },
        });
      }
    } catch (dokuError) {
      console.error('DOKU status check failed:', dokuError);
      // Fall through — return current sheet status
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
