import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { createInvoice } from '@/lib/invoice-store';

const itemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

const payloadSchema = z.object({
  invoiceNumber: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string(),
  issuer: z.object({
    name: z.string(),
    email: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
    website: z.string().optional().default(''),
  }),
  client: z.object({
    name: z.string(),
    email: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
  }),
  items: z.array(itemSchema),
  subtotal: z.number(),
  discountPercent: z.number(),
  discountAmount: z.number(),
  taxType: z.enum(['PPN', 'PPh']).optional().default('PPN'),
  taxPercent: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  paymentAccountId: z.string().optional().default(''),
  paymentAccountLabel: z.string().optional().default(''),
  paymentAccountNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export async function POST(request: Request) {
  const session = await getInvoiceSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid invoice payload' },
        { status: 400 }
      );
    }

    const stored = await createInvoice({
      payload: parsed.data,
      createdBy: session.email,
    });

    return NextResponse.json({ success: true, id: stored.id });
  } catch (error) {
    console.error('Invoice save error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
