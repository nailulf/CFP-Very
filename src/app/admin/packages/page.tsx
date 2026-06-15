import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getPackagePricing } from '@/lib/settings-store';
import { KONSULTASI_PACKAGES } from '@/lib/konsultasi-packages';
import PackagesForm from './PackagesForm';

export const metadata = { title: 'Paket & Harga — Admin' };
export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/packages');

  const pricing = await getPackagePricing();
  const packages = KONSULTASI_PACKAGES.map((p) => ({ id: p.id, service: p.service }));

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <PackagesForm packages={packages} initialPricing={pricing} />
      </div>
    </main>
  );
}
