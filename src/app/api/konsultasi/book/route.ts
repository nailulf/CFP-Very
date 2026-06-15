import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { isSlotAvailable } from '@/lib/konsultasi-availability';
import { appendBooking } from '@/lib/konsultasi-store';
import { createBookingEvent } from '@/lib/google-calendar';
import { KONSULTASI_PACKAGE_IDS, getKonsultasiPackage } from '@/lib/konsultasi-packages';

const schema = z.object({
  packageId: z.enum(KONSULTASI_PACKAGE_IDS),
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

    const { packageId, name, email, phone, date, timeSlot, topic } = parsed.data;

    const pkg = getKonsultasiPackage(packageId);
    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Paket tidak valid.' }, { status: 400 });
    }

    if (!(await isSlotAvailable(BOOKING_AVAILABILITY, date, timeSlot, new Date()))) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const bookingId = makeBookingId(new Date());
    await appendBooking({
      bookingId,
      name,
      email,
      phone: phone ?? '',
      date,
      timeSlot,
      topic,
      service: pkg.service,
      amount: pkg.amount,
    });

    // Best-effort: create the calendar event + Meet link + client invite. The
    // booking is already recorded, so a calendar failure must not fail the request.
    const event = await createBookingEvent({
      date,
      time: timeSlot,
      durationMinutes: BOOKING_AVAILABILITY.slotMinutes,
      summary: `Konsultasi Keuangan — ${pkg.service.replace(/^Konsultasi Keuangan — /, '')} (${name})`,
      description: [
        `Paket: ${pkg.service}`,
        `Nama: ${name}`,
        `Topik: ${topic}`,
        `No. Ref: ${bookingId}`,
      ].join('\n'),
      clientEmail: email,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      meetLink: event.meetLink ?? null,
      eventLink: event.htmlLink ?? null,
    });
  } catch (error) {
    console.error('Konsultasi booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
