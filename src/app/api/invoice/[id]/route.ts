import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvoiceSession } from '@/lib/invoice-auth';
import {
  deleteInvoice,
  getInvoiceById,
  updateInvoiceStatus,
} from '@/lib/invoice-store';

const statusSchema = z.object({
  status: z.enum(['Unpaid', 'Paid', 'Cancelled']),
});

async function requireSession() {
  const session = await getInvoiceSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  return { ok: true as const, session };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Invoice get error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }
    const ok = await updateInvoiceStatus(id, parsed.data.status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice patch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    const ok = await deleteInvoice(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}
