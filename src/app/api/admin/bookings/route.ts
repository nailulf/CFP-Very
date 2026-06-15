import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listBookings } from '@/lib/konsultasi-store';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, bookings: await listBookings() });
}
