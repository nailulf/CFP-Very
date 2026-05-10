import { NextResponse } from 'next/server';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listInvoices } from '@/lib/invoice-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getInvoiceSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  try {
    const invoices = await listInvoices();
    return NextResponse.json({
      success: true,
      invoices: invoices.map((i) => ({
        id: i.id,
        savedAt: i.savedAt,
        status: i.status,
        invoiceNumber: i.payload.invoiceNumber,
        issueDate: i.payload.issueDate,
        dueDate: i.payload.dueDate,
        currency: i.payload.currency,
        clientName: i.payload.client.name,
        total: i.payload.total,
      })),
    });
  } catch (error) {
    console.error('Invoice list error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}
