import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { PAYMENT_ACCOUNTS } from '@/lib/invoice-payments';
import { InvoiceGenerator } from './InvoiceGenerator';

export const dynamic = 'force-dynamic';

export default async function GenerateInvoicePage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/generate-invoice/login');

  return (
    <InvoiceGenerator
      userEmail={session.email}
      paymentAccounts={PAYMENT_ACCOUNTS}
    />
  );
}
