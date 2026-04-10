import { NextResponse } from 'next/server';
import { updateBookingStatus, getBookingById } from '@/lib/sheets';
import { createCalendarEvent } from '@/lib/calendar';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    console.log('Webhook received:', rawBody);

    const payload = JSON.parse(rawBody);
    const invoiceNumber = payload.order?.invoice_number;
    const transactionStatus = payload.transaction?.status;
    const paymentMethod = payload.payment?.payment_method_type;

    if (!invoiceNumber) {
      console.error('Webhook: Missing invoice number', payload);
      return NextResponse.json({ message: 'Missing invoice number' }, { status: 400 });
    }

    console.log('Webhook processing:', { invoiceNumber, transactionStatus, paymentMethod });

    // Check if already processed
    const existing = await getBookingById(invoiceNumber);
    if (existing?.payment_status === 'paid') {
      return NextResponse.json({ message: 'Already processed' });
    }

    // Map DOKU status to our status
    let paymentStatus: string;
    if (transactionStatus === 'SUCCESS') {
      paymentStatus = 'paid';
    } else if (transactionStatus === 'FAILED') {
      paymentStatus = 'failed';
    } else {
      paymentStatus = 'pending_payment';
    }

    await updateBookingStatus(invoiceNumber, {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      paid_at: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
    });

    console.log('Webhook: Sheet updated', { invoiceNumber, paymentStatus });

    // After successful payment, create Google Calendar event and send invite
    if (paymentStatus === 'paid' && existing) {
      try {
        const bookingDate = existing.booking_date || '';
        if (bookingDate) {
          const startTime = new Date(bookingDate).toISOString();
          const endTime = new Date(new Date(bookingDate).getTime() + 30 * 60 * 1000).toISOString();

          await createCalendarEvent({
            summary: `Discovery Call - ${existing.client_name}`,
            description: `1-on-1 Discovery Call with ${existing.client_name}\nEmail: ${existing.client_email}\nPhone: ${existing.client_phone || '-'}\nBooked via Teman Tumbuh website`,
            startTime,
            endTime,
            attendeeEmail: existing.client_email,
            attendeeName: existing.client_name,
          });

          console.log('Webhook: Calendar event created for', existing.client_name);
        }
      } catch (calError) {
        console.error('Failed to create calendar event:', calError);
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
