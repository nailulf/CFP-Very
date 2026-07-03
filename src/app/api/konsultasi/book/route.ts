import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSlotAvailable } from '@/lib/konsultasi-availability';
import { appendBooking, setInvoiceId } from '@/lib/konsultasi-store';
import { KONSULTASI_PACKAGE_IDS, getKonsultasiPackage } from '@/lib/konsultasi-packages';
import { getAvailabilityConfig, getPackagePricing } from '@/lib/settings-store';
import { resolveAmount } from '@/lib/settings-config';
import { createInvoice, invoiceUrl, isMayarConfigured } from '@/lib/mayar';
import { paymentDeadline, PAYMENT_WINDOW_MS } from '@/lib/konsultasi-payment-window';

const schema = z.object({
  packageId: z.enum(KONSULTASI_PACKAGE_IDS),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  // Fully optional, free-text.
  topic: z.string().max(2000).optional().default(''),
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

    const config = await getAvailabilityConfig();
    if (!(await isSlotAvailable(config, date, timeSlot, new Date()))) {
      return NextResponse.json(
        { success: false, message: 'Jadwal yang dipilih sudah tidak tersedia.' },
        { status: 400 },
      );
    }

    const pricing = await getPackagePricing();
    const amount = resolveAmount(pricing[packageId]);

    const now = new Date();
    const bookingId = makeBookingId(now);
    await appendBooking({
      bookingId,
      name,
      email,
      phone: phone ?? '',
      date,
      timeSlot,
      topic,
      service: pkg.service,
      amount,
    });

    // Payment: create the Mayar hosted-checkout invoice. Best-effort — the
    // booking row is already recorded and the status page self-heals a missing
    // invoice, so a Mayar outage must not fail the request. The Calendar event
    // + Meet invite are created after payment (konsultasi-payment-confirm).
    let paymentUrl: string | null = null;
    if (isMayarConfigured()) {
      try {
        const origin = process.env.MAYAR_PUBLIC_ORIGIN || new URL(request.url).origin;
        const expiredAt =
          paymentDeadline(now.toISOString(), date, timeSlot) ??
          new Date(now.getTime() + PAYMENT_WINDOW_MS);
        const invoice = await createInvoice({
          bookingId,
          name,
          email,
          mobile: phone ?? '',
          serviceLabel: pkg.service,
          amount,
          expiredAt,
          statusUrl: `${origin}/konsultasi/booking/status/${bookingId}`,
        });
        await setInvoiceId(bookingId, invoice.id);
        paymentUrl = invoiceUrl(invoice);
      } catch (error) {
        console.error('Mayar invoice creation failed (status page will self-heal):', error);
      }
    }

    return NextResponse.json({ success: true, bookingId, paymentUrl });
  } catch (error) {
    console.error('Konsultasi booking error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
