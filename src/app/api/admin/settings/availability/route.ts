import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getAvailabilityConfig, saveAvailabilityConfig } from '@/lib/settings-store';
import { availabilitySchema, mergeAvailability } from '@/lib/settings-config';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, availability: await getAvailabilityConfig() });
}

export async function PUT(request: Request) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Konfigurasi tidak valid.' }, { status: 400 });
  }
  const value = mergeAvailability(parsed.data);
  await saveAvailabilityConfig(value, session.email);
  return NextResponse.json({ success: true, availability: value });
}
