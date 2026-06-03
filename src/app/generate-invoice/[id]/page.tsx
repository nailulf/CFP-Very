import { notFound, redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { PAYMENT_ACCOUNTS } from '@/lib/invoice-payments';
import { getInvoiceById } from '@/lib/invoice-store';
import { InvoiceGenerator, type InitialInvoiceData } from '../InvoiceGenerator';

export const dynamic = 'force-dynamic';

export default async function StoredInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getInvoiceSession();
  if (!session) redirect('/generate-invoice/login');

  const { id } = await params;
  let invoice;
  try {
    invoice = await getInvoiceById(id);
  } catch (err) {
    console.error('[StoredInvoicePage] getInvoiceById threw:', err);
    throw err;
  }
  if (!invoice) notFound();

  const initialData: InitialInvoiceData = {
    invoiceNumber: invoice.payload.invoiceNumber,
    issueDate: invoice.payload.issueDate,
    dueDate: invoice.payload.dueDate,
    currency: invoice.payload.currency,
    issuer: invoice.payload.issuer,
    client: invoice.payload.client,
    items: invoice.payload.items,
    discountPercent: invoice.payload.discountPercent,
    taxType: invoice.payload.taxType,
    taxPercent: invoice.payload.taxPercent,
    paymentAccountId: invoice.payload.paymentAccountId,
    notes: invoice.payload.notes,
  };

  return (
    <InvoiceGenerator
      userEmail={session.email}
      paymentAccounts={PAYMENT_ACCOUNTS}
      initialData={initialData}
      isStored
    />
  );
}
