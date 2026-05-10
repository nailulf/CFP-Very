import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function InvoiceLoginPage() {
  const session = await getInvoiceSession();
  if (session) redirect('/generate-invoice');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1918]">Internal Invoice Tool</h1>
          <p className="text-sm text-[#6D6C6A] mt-2">
            Masuk untuk mengakses generator invoice.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
