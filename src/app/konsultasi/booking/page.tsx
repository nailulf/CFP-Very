import React from 'react';
import { Metadata } from 'next';
import BookingFlow from './BookingFlow';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { getSelectableDates, getSlotsForDate } from './lib/availability';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';

export const metadata: Metadata = {
  title: 'Booking Konsultasi Keuangan',
  description: 'Jadwalkan sesi konsultasi keuangan 1-on-1 bersama Perencana Keuangan bersertifikat.',
};

export const dynamic = 'force-dynamic'; // dates depend on "today"

export default function BookingPage() {
  const today = new Date();
  const dates = getSelectableDates(BOOKING_AVAILABILITY, today);
  const slotsByDate: Record<string, string[]> = {};
  for (const d of dates) slotsByDate[d] = getSlotsForDate(BOOKING_AVAILABILITY, d);

  return (
    <main className="bg-[#F0F7FA] min-h-screen pt-32 pb-20">
      <BookingFlow
        enabled={BOOKING_AVAILABILITY.enabled}
        dates={dates}
        slotsByDate={slotsByDate}
        payment={getPaymentDisplay()}
      />
    </main>
  );
}
