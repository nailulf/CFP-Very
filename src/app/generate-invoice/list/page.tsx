import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listInvoices } from '@/lib/invoice-store';
import { InvoiceList } from './InvoiceList';

export const dynamic = 'force-dynamic';

export default async function InvoiceListPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/generate-invoice/login');

  let invoices: Awaited<ReturnType<typeof listInvoices>> = [];
  let loadError: string | null = null;
  try {
    invoices = await listInvoices();
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Gagal memuat invoice.';
  }

  const summaries = invoices.map((i) => ({
    id: i.id,
    savedAt: i.savedAt,
    status: i.status,
    invoiceNumber: i.payload.invoiceNumber,
    issueDate: i.payload.issueDate,
    dueDate: i.payload.dueDate,
    currency: i.payload.currency,
    clientName: i.payload.client.name,
    total: i.payload.total,
  }));

  return (
    <InvoiceList
      userEmail={session.email}
      initialInvoices={summaries}
      loadError={loadError}
    />
  );
}
