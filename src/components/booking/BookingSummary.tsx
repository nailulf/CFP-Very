'use client';

import { ShieldCheck, CalendarX, Video } from 'lucide-react';
import { formatPrice } from '@/data/services';

interface BookingSummaryProps {
  serviceName: string;
  date?: string;
  time?: string;
  duration: string;
  price: number;
  isDateSelected: boolean;
  onContinue: () => void;
}

export function BookingSummary({
  serviceName,
  date,
  time,
  duration,
  price,
  isDateSelected,
  onContinue,
}: BookingSummaryProps) {
  return (
    <div className="flex flex-col gap-5 w-[380px]">
      <div className="bg-white rounded-2xl border border-[#E8E9E6] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-bold text-[#1A1918] font-[Outfit]">Available times</h3>
          {date && (
            <p className="text-sm text-[#4F9DA6] font-[Outfit]">{date}</p>
          )}
        </div>

        <div className="border-t border-[#E8E9E6] pt-4">
          <h4 className="text-[15px] font-bold text-[#1A1918] font-[Outfit] mb-3">Booking summary</h4>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center h-7">
              <span className="text-sm text-[#6D6C6A] font-[Outfit]">Session</span>
              <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">{serviceName}</span>
            </div>
            <div className="flex justify-between items-center h-7">
              <span className="text-sm text-[#6D6C6A] font-[Outfit]">Date</span>
              <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">
                {date || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center h-7">
              <span className="text-sm text-[#6D6C6A] font-[Outfit]">Time</span>
              <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">
                {time ? `${time} (${duration})` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center h-7">
              <span className="text-sm text-[#6D6C6A] font-[Outfit]">Price</span>
              <span className="text-sm font-bold text-[#4F9DA6] font-[Outfit]">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E9E6] pt-4">
          <button
            onClick={onContinue}
            disabled={!isDateSelected}
            className="w-full h-12 rounded-full text-white font-semibold text-[15px] font-[Outfit] flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)',
            }}
          >
            → Continue to Payment
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#4F9DA6]" />
          <span className="text-[11px] font-medium text-[#9C9B99] font-[Outfit]">Secure & Private</span>
        </div>
        <span className="text-[#CBCCC9] text-xs">·</span>
        <div className="flex items-center gap-1.5">
          <CalendarX size={14} className="text-[#4F9DA6]" />
          <span className="text-[11px] font-medium text-[#9C9B99] font-[Outfit]">Free cancellation</span>
        </div>
        <span className="text-[#CBCCC9] text-xs">·</span>
        <div className="flex items-center gap-1.5">
          <Video size={14} className="text-[#4F9DA6]" />
          <span className="text-[11px] font-medium text-[#9C9B99] font-[Outfit]">Zoom link sent</span>
        </div>
      </div>
    </div>
  );
}
