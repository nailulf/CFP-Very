import { NextResponse } from 'next/server';
import { updateBookingStatus, getBookingById } from '@/lib/sheets';
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

// GET /api/payment/simulate?id=<booking-id>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('id');

  if (!bookingId) {
    return NextResponse.json({ error: 'Pass ?id=<booking-id>' }, { status: 400 });
  }

  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found', bookingId }, { status: 404 });
    }

    console.log('Simulate: Found booking', booking);

    // 1. Create calendar event first to get Meet link
    let meetLink: string | null = null;
    const bookingDate = booking.booking_date || '';
    const parsed = parseBookingDate(bookingDate);

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
        console.log('Simulate: Calendar event created', { meetLink });
      } catch (calError) {
        console.error('Simulate: Calendar error', calError);
      }
    }

    // 2. Update sheet with payment status + meet link
    await updateBookingStatus(bookingId, {
      payment_status: 'paid',
      payment_method: 'SIMULATED',
      paid_at: new Date().toISOString(),
      meet_link: meetLink || undefined,
    });
    console.log('Simulate: Sheet updated');

    // 3. Send email
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
      console.log('Simulate: Email sent to', booking.client_email);
    } catch (emailError) {
      console.error('Simulate: Email error', emailError);
    }

    return NextResponse.json({
      success: true,
      booking: { name: booking.client_name, email: booking.client_email, date: bookingDate, meetLink },
    });
  } catch (error) {
    console.error('Simulate error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
