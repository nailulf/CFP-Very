import React from 'react';
import { Metadata } from 'next';
import BookingFlow from './BookingFlow';
import { getSelectableDates } from './lib/availability';
import { getFreeSlotsByDate } from '@/lib/konsultasi-availability';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';
import { getAvailabilityConfig, getPackagePricing } from '@/lib/settings-store';

export const metadata: Metadata = {
  title: 'Booking Konsultasi Keuangan',
  description: 'Jadwalkan sesi konsultasi keuangan 1-on-1 bersama Perencana Keuangan bersertifikat.',
};

export const dynamic = 'force-dynamic'; // dates depend on "today" + live settings

export default async function BookingPage() {
  const today = new Date();
  const config = await getAvailabilityConfig();
  const pricing = await getPackagePricing();
  const dates = getSelectableDates(config, today);
  // Only slots that are still open (not already booked or calendar-busy).
  const slotsByDate = await getFreeSlotsByDate(config, dates);

  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <BookingFlow
        enabled={config.enabled}
        dates={dates}
        slotsByDate={slotsByDate}
        payment={getPaymentDisplay()}
        pricing={pricing}
      />
    </main>
  );
}
