'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutHeader } from '@/components/booking/CheckoutHeader';
import { PaymentStatus } from '@/components/booking/PaymentStatus';

function PendingContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || '';

  return (
    <main className="flex-1 flex justify-center items-start px-4">
      <PaymentStatus
        bookingId={bookingId}
        redirectTo={`/book/confirmation?id=${bookingId}`}
      />
    </main>
  );
}

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#F0F7FA] flex flex-col">
      <CheckoutHeader activeStep={2} backHref="/book/payment" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-[#6D6C6A] font-[Outfit]">Loading...</p></div>}>
        <PendingContent />
      </Suspense>
    </div>
  );
}
