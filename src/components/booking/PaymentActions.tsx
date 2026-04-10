'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface PaymentActionsProps {
  serviceName: string;
  amount: number;
  serviceId: string;
  bookingDate?: string;
  bookingTime?: string;
  bookingStart?: string;
  bookingEnd?: string;
}

export function PaymentActions({
  serviceName,
  amount,
  serviceId,
  bookingDate,
  bookingTime,
  bookingStart,
  bookingEnd,
}: PaymentActionsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = name.trim().length >= 2 && email.includes('@') && phone.trim().length >= 10;

  const handlePayment = async () => {
    if (!isFormValid) {
      setError('Please fill in your name and email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          service_id: serviceId,
          service_name: serviceName,
          amount,
          booking_date: bookingDate,
          booking_time: bookingTime,
          booking_start: bookingStart,
          booking_end: bookingEnd,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to create payment');
        return;
      }

      // Redirect to DOKU checkout
      window.location.href = data.paymentUrl;
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[480px]">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-7 py-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#1A1918] font-[Outfit]">Payment Details</h2>
          <p className="text-sm text-[#6D6C6A] font-[Outfit] mt-1">
            Enter your payment information below
          </p>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-[#1A1918] font-[Outfit]">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="h-11 px-4 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1A1918] font-[Outfit] placeholder:text-[#9C9B99] focus:outline-none focus:border-[#205781] focus:ring-1 focus:ring-[#205781] transition-colors"
            />
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-[#1A1918] font-[Outfit]">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-11 px-4 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1A1918] font-[Outfit] placeholder:text-[#9C9B99] focus:outline-none focus:border-[#205781] focus:ring-1 focus:ring-[#205781] transition-colors"
            />
          </div>

          {/* Phone/WhatsApp field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-semibold text-[#1A1918] font-[Outfit]">WhatsApp Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="h-11 px-4 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1A1918] font-[Outfit] placeholder:text-[#9C9B99] focus:outline-none focus:border-[#205781] focus:ring-1 focus:ring-[#205781] transition-colors"
            />
          </div>

          {/* Payment info */}
          <div className="bg-[#F0F7FA] rounded-xl p-4 flex items-start gap-3">
            <Lock size={16} className="text-[#205781] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#205781] font-[Outfit] leading-relaxed">
              You&apos;ll be securely redirected to DOKU to complete your payment.
              All major payment methods are supported: Virtual Account, e-Wallet (GoPay, OVO, DANA, ShopeePay), QRIS, and Credit Card.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 font-[Outfit]">
              {error}
            </div>
          )}

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1 accent-[#205781]" />
            <span className="text-sm text-[#6D6C6A] font-[Outfit]">
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          {/* Pay button */}
          <button
            onClick={handlePayment}
            disabled={loading || !isFormValid}
            className="w-full h-12 rounded-full text-white font-semibold text-[15px] font-[Outfit] flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)',
            }}
          >
            {loading ? 'Redirecting...' : 'Complete Payment'}
          </button>

          <p className="text-center text-xs text-[#9C9B99] font-[Outfit]">
            Your payment info is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
