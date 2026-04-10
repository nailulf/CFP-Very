'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PaymentStatusProps {
  bookingId: string;
  redirectTo: string;
}

export function PaymentStatus({ bookingId, redirectTo }: PaymentStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>('checking');

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/status/${bookingId}`);
      const data = await res.json();

      if (data.success && data.booking.payment_status === 'paid') {
        setStatus('paid');
        router.push(redirectTo);
      } else if (data.booking?.payment_status === 'failed') {
        setStatus('failed');
      }
    } catch {
      // Silently retry
    }
  }, [bookingId, redirectTo, router]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">✕</span>
        </div>
        <h2 className="text-xl font-bold text-[#1A1918] font-[Outfit]">Payment Failed</h2>
        <p className="text-sm text-[#6D6C6A] font-[Outfit]">
          Your payment could not be processed. Please try again.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-full bg-[#205781] px-6 py-3 text-white font-semibold text-sm font-[Outfit]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <Loader2 size={40} className="text-[#205781] animate-spin" />
      <h2 className="text-xl font-bold text-[#1A1918] font-[Outfit]">Processing Payment...</h2>
      <p className="text-sm text-[#6D6C6A] font-[Outfit] text-center max-w-md">
        We&apos;re waiting for your payment confirmation. This may take a few moments
        for bank transfers and virtual accounts.
      </p>
    </div>
  );
}
