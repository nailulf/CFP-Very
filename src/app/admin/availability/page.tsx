import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { getAvailabilityConfig } from '@/lib/settings-store';
import AvailabilityForm from './AvailabilityForm';

export const metadata = { title: 'Jadwal Tersedia — Admin' };
export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/availability');

  const availability = await getAvailabilityConfig();
  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <AvailabilityForm initial={availability} />
      </div>
    </main>
  );
}
