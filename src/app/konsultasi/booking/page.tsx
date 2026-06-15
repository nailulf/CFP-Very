import React from 'react';
import { Metadata } from 'next';
import BookingFlow from './BookingFlow';
import { BOOKING_AVAILABILITY } from '@/lib/booking-availability';
import { getSelectableDates } from './lib/availability';
import { getFreeSlotsByDate } from '@/lib/konsultasi-availability';
import { getPaymentDisplay } from '@/lib/konsultasi-payment';

export const metadata: Metadata = {
  title: 'Booking Konsultasi Keuangan',
  description: 'Jadwalkan sesi konsultasi keuangan 1-on-1 bersama Perencana Keuangan bersertifikat.',
};

export const dynamic = 'force-dynamic'; // dates depend on "today"

export default async function BookingPage() {
  const today = new Date();
  const dates = getSelectableDates(BOOKING_AVAILABILITY, today);
  // Only slots that are still open (not already booked or calendar-busy).
  const slotsByDate = await getFreeSlotsByDate(BOOKING_AVAILABILITY, dates);

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
