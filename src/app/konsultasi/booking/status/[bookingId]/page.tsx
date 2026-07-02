import React from 'react';
import { Metadata } from 'next';
import StatusClient from './StatusClient';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';

export const metadata: Metadata = {
  title: 'Status Booking Konsultasi',
  description: 'Cek status pembayaran dan jadwal sesi konsultasi keuanganmu.',
};

export const dynamic = 'force-dynamic';

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <StatusClient bookingId={bookingId} payment={getPaymentDisplay()} />
    </main>
  );
}
