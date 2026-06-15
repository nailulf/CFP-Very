import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getPackagePricing, savePackagePricing } from '@/lib/settings-store';
import { pricingSchema, mergePricing } from '@/lib/settings-config';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true, pricing: await getPackagePricing() });
}

export async function PUT(request: Request) {
  const session = await getInvoiceSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = pricingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data harga tidak valid.' }, { status: 400 });
  }
  const value = mergePricing(parsed.data as never);
  await savePackagePricing(value, session.email);
  return NextResponse.json({ success: true, pricing: value });
}
