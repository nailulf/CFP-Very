import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createPaymentOrder } from '@/lib/doku';
import { appendBookingRow } from '@/lib/sheets';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  service_id: z.string(),
  service_name: z.string(),
  amount: z.number().positive(),
  booking_date: z.string().optional(),
  booking_time: z.string().optional(),
  booking_start: z.string().optional(), // ISO string for calendar event
  booking_end: z.string().optional(),   // ISO string for calendar event
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid form data', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, service_id, service_name, amount, booking_date, booking_time, booking_start, booking_end } = result.data;

    const bookingId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Store both human-readable date and ISO start time
    // booking_date = "2026-04-15", booking_time = "10:00 AM", booking_start = ISO string
    const bookingDateDisplay = booking_date && booking_time ? `${booking_date} ${booking_time}` : '';
    const bookingDateValue = bookingDateDisplay || booking_start || '';

    // Save to Google Sheets
    await appendBookingRow({
      id: bookingId,
      client_name: name,
      client_email: email,
      client_phone: phone,
      service_type: service_id,
      amount,
      payment_status: 'pending_payment',
      booking_date: bookingDateValue,
      created_at: now,
    });

    // Create DOKU payment order
    const { paymentUrl } = await createPaymentOrder({
      invoiceNumber: bookingId,
      amount,
      customerName: name,
      customerEmail: email,
      itemName: service_name,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      paymentUrl,
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
