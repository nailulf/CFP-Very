import React from 'react';
import { redirect } from 'next/navigation';
import { getInvoiceSession } from '@/lib/invoice-auth';
import { listBookings } from '@/lib/konsultasi-store';
import BookingsTable from './BookingsTable';

export const metadata = { title: 'Booking — Admin' };
export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin/bookings');

  let bookings: Awaited<ReturnType<typeof listBookings>> = [];
  let error: string | null = null;
  try {
    bookings = await listBookings();
  } catch {
    error = 'Gagal memuat data booking.';
  }

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <BookingsTable initial={bookings} initialError={error} />
      </div>
    </main>
  );
}
