import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/doku';
import { updateBookingStatus, getBookingById } from '@/lib/sheets';
import { createCalendarEvent } from '@/lib/calendar';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const requestId = request.headers.get('Request-Id') || '';
    const requestTimestamp = request.headers.get('Request-Timestamp') || '';
    const signature = request.headers.get('Signature') || '';

    // Verify DOKU webhook signature
    const isValid = verifyWebhookSignature(
      requestId,
      requestTimestamp,
      '/api/payment/webhook',
      rawBody,
      signature
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const invoiceNumber = payload.order?.invoice_number;
    const transactionStatus = payload.transaction?.status;
    const paymentMethod = payload.payment?.payment_method_type;

    if (!invoiceNumber) {
      return NextResponse.json({ message: 'Missing invoice number' }, { status: 400 });
    }

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

    // After successful payment, create Google Calendar event and send invite
    if (paymentStatus === 'paid' && existing) {
      try {
        const bookingDate = existing.booking_date || '';
        // Parse stored booking date/time to get start/end ISO strings
        // booking_date is stored as "YYYY-MM-DD HH:MM AM/PM" or ISO string
        if (bookingDate) {
          // Use the stored start/end times from the sheet if available,
          // otherwise default to a 30-min slot
          const startTime = new Date(bookingDate).toISOString();
          const endTime = new Date(new Date(bookingDate).getTime() + 30 * 60 * 1000).toISOString();

          await createCalendarEvent({
            summary: `Discovery Call - ${existing.client_name}`,
            description: `1-on-1 Discovery Call with ${existing.client_name}\nEmail: ${existing.client_email}\nBooked via CFP Very website`,
            startTime,
            endTime,
            attendeeEmail: existing.client_email,
            attendeeName: existing.client_name,
          });
        }
      } catch (calError) {
        // Log but don't fail the webhook — payment is already confirmed
        console.error('Failed to create calendar event:', calError);
      }
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
