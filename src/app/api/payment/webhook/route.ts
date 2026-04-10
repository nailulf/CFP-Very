import { NextResponse } from 'next/server';
import { updateBookingStatus, getBookingById } from '@/lib/sheets';
import { createCalendarEvent } from '@/lib/calendar';
import { sendBookingConfirmation } from '@/lib/email';
import { getServiceById, services, formatPrice } from '@/data/services';

function parseBookingDate(bookingDate: string): { start: Date; end: Date } | null {
  // bookingDate format: "2026-04-15 10:00 AM" or ISO string
  try {
    // Try ISO string first
    const direct = new Date(bookingDate);
    if (!isNaN(direct.getTime()) && bookingDate.includes('T')) {
      return {
        start: direct,
        end: new Date(direct.getTime() + 30 * 60 * 1000),
      };
    }

    // Parse "YYYY-MM-DD HH:MM AM/PM" format
    const match = bookingDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const [, datePart, hourStr, minuteStr, ampm] = match;
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);

      if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;

      // Create date in WIB (UTC+7)
      const dateStr = `${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;
      const start = new Date(dateStr);

      if (!isNaN(start.getTime())) {
        return {
          start,
          end: new Date(start.getTime() + 30 * 60 * 1000),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    console.log('Webhook received:', rawBody);

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error('Webhook: Invalid JSON body');
      return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
    }

    // DOKU sends invoice_number in different places depending on the notification type
    const invoiceNumber = payload.order?.invoice_number
      || payload.invoice_number
      || payload.response?.order?.invoice_number;

    // DOKU sends status in different formats
    const transactionStatus = payload.transaction?.status
      || payload.status
      || payload.response?.transaction?.status;

    const paymentMethod = payload.payment?.payment_method_type
      || payload.channel?.id
      || payload.response?.payment?.payment_method_type
      || '';

    console.log('Webhook parsed:', { invoiceNumber, transactionStatus, paymentMethod, fullPayload: payload });

    if (!invoiceNumber) {
      console.error('Webhook: Missing invoice number', payload);
      return NextResponse.json({ message: 'Missing invoice number' }, { status: 400 });
    }

    // Check if already processed
    const existing = await getBookingById(invoiceNumber);
    console.log('Webhook: Existing booking:', existing);

    if (existing?.payment_status === 'paid') {
      console.log('Webhook: Already processed, skipping');
      return NextResponse.json({ message: 'Already processed' });
    }

    // Map DOKU status to our status
    let paymentStatus: string;
    const statusUpper = (transactionStatus || '').toUpperCase();
    if (statusUpper === 'SUCCESS' || statusUpper === 'PAID' || statusUpper === 'SETTLED') {
      paymentStatus = 'paid';
    } else if (statusUpper === 'FAILED' || statusUpper === 'EXPIRED' || statusUpper === 'DENIED') {
      paymentStatus = 'failed';
    } else {
      paymentStatus = 'pending_payment';
    }

    try {
      await updateBookingStatus(invoiceNumber, {
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
      });
      console.log('Webhook: Sheet updated', { invoiceNumber, paymentStatus });
    } catch (sheetError) {
      console.error('Webhook: Failed to update sheet', sheetError);
      // Continue anyway — don't block email/calendar
    }

    // After successful payment, create Google Calendar event and send invite
    if (paymentStatus === 'paid') {
      // Re-fetch booking to get the latest data (including any updates)
      const booking = existing || await getBookingById(invoiceNumber);

      if (!booking) {
        console.error('Webhook: Booking not found after update:', invoiceNumber);
        return NextResponse.json({ message: 'OK' });
      }

      console.log('Webhook: Processing paid booking', {
        name: booking.client_name,
        email: booking.client_email,
        date: booking.booking_date,
      });

      const bookingDate = booking.booking_date || '';
      console.log('Webhook: Attempting calendar event for date:', bookingDate);

      if (bookingDate) {
        const parsed = parseBookingDate(bookingDate);
        let meetLink: string | null = null;

        // 1. Create Google Calendar event with Google Meet link
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
            console.log('Webhook: Calendar event created', { eventId: calResult.eventId, meetLink });

            // Save Meet link to spreadsheet
            if (meetLink) {
              try {
                await updateBookingStatus(invoiceNumber, { meet_link: meetLink });
                console.log('Webhook: Meet link saved to sheet');
              } catch (e) {
                console.error('Webhook: Failed to save meet link', e);
              }
            }
          } catch (calError) {
            console.error('Failed to create calendar event:', calError);
          }
        } else {
          console.error('Webhook: Could not parse booking date:', bookingDate);
        }

        // 2. Send confirmation email with .ics + Meet link
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

          console.log('Webhook: Confirmation email sent to', booking.client_email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DOKU may also send GET requests (browser redirects) — handle gracefully
export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is active. Use POST.' });
}
