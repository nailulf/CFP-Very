import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { isValidSlot } from '@/app/konsultasi/booking/lib/availability';
import { appendBooking } from '@/lib/konsultasi-store';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  topic: z.string().min(10),
});

function makeBookingId(now: Date): string {
  return `KB-${now.getTime().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid form data' }, { status: 400 });
    }

    const { name, email, phone, date, timeSlot, topic } = parsed.data;

    if (!isValidSlot(BOOKING_AVAILABILITY, date, timeSlot, new Date())) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const bookingId = makeBookingId(new Date());
    await appendBooking({ bookingId, name, email, phone: phone ?? '', date, timeSlot, topic });

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Konsultasi booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
