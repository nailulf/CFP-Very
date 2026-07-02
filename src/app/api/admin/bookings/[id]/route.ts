import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { updateBookingStatus } from '@/lib/konsultasi-store';

export const ADMIN_BOOKING_STATUSES = ['pending_payment', 'paid', 'cancelled', 'refunded', 'expired'] as const;

const schema = z.object({ status: z.enum(ADMIN_BOOKING_STATUSES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Status tidak valid.' }, { status: 400 });
  }
  const ok = await updateBookingStatus(id, parsed.data.status);
  if (!ok) return NextResponse.json({ success: false, message: 'Booking tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
