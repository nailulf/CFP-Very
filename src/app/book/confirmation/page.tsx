'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutHeader } from '@/components/booking/CheckoutHeader';
import { ConfirmationCard } from '@/components/booking/ConfirmationCard';
import { getServiceById, services } from '@/data/services';

interface BookingInfo {
  serviceName: string;
  bookingDate: string;
  duration: string;
  price: number;
  email: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      // Try URL param first, then sessionStorage
      const id = bookingId || sessionStorage.getItem('bookingId');
      console.log('Confirmation page: bookingId =', id, 'URL =', window.location.href);
      if (id) {
        try {
          const res = await fetch(`/api/payment/status/${bookingId}`);
          const data = await res.json();
          if (data.success) {
            const service = getServiceById(data.booking.service_type) || services[0];
            setBookingInfo({
              serviceName: service.name,
              bookingDate: data.booking.booking_date || 'TBD',
              duration: service.duration,
              price: data.booking.amount,
              email: data.booking.client_email,
            });
            return;
          }
        } catch {
          // Fall through to default
        }
      }

      const stored = sessionStorage.getItem('bookingData');
      if (stored) {
        const data = JSON.parse(stored);
        setBookingInfo({
          serviceName: data.serviceName,
          bookingDate: data.bookingDate || 'Check your email',
          duration: data.duration,
          price: data.price,
          email: '',
        });
      } else {
        const service = services[0];
        setBookingInfo({
          serviceName: service.name,
          bookingDate: 'Check your email',
          duration: service.duration,
          price: service.price,
          email: '',
        });
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (!bookingInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#6D6C6A] font-[Outfit]">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex justify-center items-start px-4">
      <ConfirmationCard
        serviceName={bookingInfo.serviceName}
        bookingDate={bookingInfo.bookingDate}
        duration={bookingInfo.duration}
        price={bookingInfo.price}
        email={bookingInfo.email}
      />
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F0F7FA] flex flex-col">
      <CheckoutHeader activeStep={3} backHref="/" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-[#6D6C6A] font-[Outfit]">Loading...</p></div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
