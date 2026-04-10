'use client';

import { ShieldCheck, HandCoins, CalendarX, FileText } from 'lucide-react';
import { formatPrice } from '@/data/services';

interface OrderSummaryProps {
  serviceName: string;
  duration: string;
  price: number;
  bookingDate?: string;
}

export function OrderSummary({ serviceName, duration, price, bookingDate }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-6 w-[480px]">
      {/* Order Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-7 py-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#1A1918] font-[Outfit]">Order Summary</h2>
          <p className="text-sm text-[#6D6C6A] font-[Outfit] mt-1">Review your consultation package</p>
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          {/* Service info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E0EFF5] flex items-center justify-center">
              <FileText size={20} className="text-[#205781]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1918] font-[Outfit]">{serviceName}</h3>
              <p className="text-sm text-[#6D6C6A] font-[Outfit]">{duration} session with Aditya</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm line-through text-[#9C9B99] font-[Outfit]">
              {formatPrice(price * 2)}
            </span>
            <span className="text-lg font-bold text-[#205781] font-[Outfit]">
              {formatPrice(price)}
            </span>
            <span className="bg-[#FEF3CD] text-[#856404] text-xs font-semibold px-2 py-0.5 rounded-full font-[Outfit]">
              First session free
            </span>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#4F9DA6]" />
              <span>256-bit SSL Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <HandCoins size={16} className="text-[#4F9DA6]" />
              <span>100% Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarX size={16} className="text-[#4F9DA6]" />
              <span>Cancel or reschedule anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-3">
        <p className="text-sm text-[#475569] font-[Outfit] leading-relaxed">
          &quot;The discovery call completely changed how I approach my finances.
          Aditya&apos;s insights were incredibly actionable and clear.&quot;
        </p>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4F9DA6] flex items-center justify-center text-white text-sm font-semibold font-[Outfit]">
            S
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1918] font-[Outfit]">Sarah M.</p>
            <p className="text-xs text-[#6D6C6A] font-[Outfit]">Small Business Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
