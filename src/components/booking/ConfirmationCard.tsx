'use client';

import Link from 'next/link';
import { Check, FileText, Calendar, Clock, Video, CreditCard, CalendarPlus, House, Mail } from 'lucide-react';
import { formatPrice } from '@/data/services';

interface ConfirmationCardProps {
  serviceName: string;
  bookingDate: string;
  duration: string;
  price: number;
  email: string;
}

export function ConfirmationCard({
  serviceName,
  bookingDate,
  duration,
  price,
  email,
}: ConfirmationCardProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[600px] mx-auto py-[60px]">
      {/* Success circle */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #4F9DA6 0%, #205781 100%)' }}
      >
        <Check size={40} className="text-white" />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-[32px] font-extrabold text-[#1A1918] font-[Outfit] tracking-tight text-center">
          Booking Confirmed!
        </h1>
        <p className="text-base text-[#6D6C6A] font-[Outfit] leading-relaxed text-center">
          Your discovery call with Aditya has been scheduled.
          <br />
          Check your email for the meeting details and Zoom link.
        </p>
      </div>

      {/* Details Card */}
      <div className="w-full bg-white rounded-2xl border border-[#E8E9E6] shadow-sm p-7 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[#1A1918] font-[Outfit]">Booking Details</h2>
        <div className="h-px bg-[#E8E9E6]" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
              <FileText size={14} className="text-[#4F9DA6]" />
              Session
            </div>
            <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">{serviceName}</span>
          </div>

          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
              <Calendar size={14} className="text-[#4F9DA6]" />
              Date & Time
            </div>
            <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">{bookingDate}</span>
          </div>

          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
              <Clock size={14} className="text-[#4F9DA6]" />
              Duration
            </div>
            <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">{duration}</span>
          </div>

          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
              <Video size={14} className="text-[#4F9DA6]" />
              Location
            </div>
            <span className="text-sm font-semibold text-[#1A1918] font-[Outfit]">Zoom (link in your email)</span>
          </div>

          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-2 text-sm text-[#6D6C6A] font-[Outfit]">
              <CreditCard size={14} className="text-[#4F9DA6]" />
              Price
            </div>
            <span className="text-sm font-bold text-[#4F9DA6] font-[Outfit]">{formatPrice(price)}</span>
          </div>
        </div>

        <div className="h-px bg-[#E8E9E6]" />

        {/* Email note */}
        <div className="flex items-center gap-2.5 bg-[#E0EFF5] rounded-xl px-4 py-3">
          <Mail size={18} className="text-[#205781]" />
          <p className="text-[13px] font-medium text-[#205781] font-[Outfit] leading-snug">
            A confirmation email with calendar invite has been sent to your inbox.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button className="flex items-center gap-2 rounded-full border-2 border-[#205781] px-7 py-3.5 text-[15px] font-semibold text-[#205781] font-[Outfit] hover:bg-[#E0EFF5] transition-colors">
          <CalendarPlus size={18} />
          Add to Calendar
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white font-[Outfit] transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)' }}
        >
          <House size={18} />
          Back to Home
        </Link>
      </div>

      {/* Footer */}
      <p className="text-[13px] font-medium text-[#9C9B99] font-[Outfit] text-center">
        Questions? Reach out to hello@adityacleverina.com
      </p>
    </div>
  );
}
