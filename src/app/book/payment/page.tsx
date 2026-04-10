'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutHeader } from '@/components/booking/CheckoutHeader';
import { OrderSummary } from '@/components/booking/OrderSummary';
import { PaymentActions } from '@/components/booking/PaymentActions';
import { services } from '@/data/services';

interface BookingData {
  serviceId: string;
  serviceName: string;
  duration: string;
  price: number;
  bookingDate?: string;
  bookingTime?: string;
  bookingStart?: string;
  bookingEnd?: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const status = searchParams.get('status');

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingData');
    if (stored) {
      setBookingData(JSON.parse(stored));
    } else {
      const service = services[0];
      setBookingData({
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
      });
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#6D6C6A] font-[Outfit]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex justify-center items-start px-4">
        <div className="flex gap-8 py-8 max-w-[1020px] w-full justify-center">
          <OrderSummary
            serviceName={bookingData.serviceName}
            duration={bookingData.duration}
            price={bookingData.price}
            bookingDate={bookingData.bookingDate && bookingData.bookingTime
              ? `${bookingData.bookingDate} at ${bookingData.bookingTime}`
              : undefined
            }
          />
          <PaymentActions
            serviceName={bookingData.serviceName}
            amount={bookingData.price}
            serviceId={bookingData.serviceId}
            bookingDate={bookingData.bookingDate}
            bookingTime={bookingData.bookingTime}
            bookingStart={bookingData.bookingStart}
            bookingEnd={bookingData.bookingEnd}
          />
        </div>
      </main>

      {status === 'cancelled' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-xl px-6 py-3 shadow-lg">
          <p className="text-sm text-amber-700 font-[Outfit]">
            Payment was cancelled. You can try again when you&apos;re ready.
          </p>
        </div>
      )}
    </>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#F0F7FA] flex flex-col">
      <CheckoutHeader activeStep={2} backHref="/book" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-[#6D6C6A] font-[Outfit]">Loading...</p></div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
