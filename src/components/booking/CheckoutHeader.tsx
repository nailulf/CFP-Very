'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface CheckoutHeaderProps {
  activeStep: 1 | 2 | 3;
  backHref?: string;
}

const steps = ['Select Date', 'Payment', 'Confirmation'];

export function CheckoutHeader({ activeStep, backHref = '/' }: CheckoutHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white px-20 h-16 border-b border-[#E8E9E6]">
      <Link
        href={backHref}
        className="flex items-center gap-2 rounded-full border border-[#CBCCC9] px-4 py-2 text-sm font-medium text-[#205781] hover:bg-[#F0F7FA] transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <span className="font-bold text-lg text-[#1A1918] tracking-tight font-[Outfit]">
        Aditya Very Cleverina
      </span>

      <div className="flex items-center gap-2">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === activeStep;
          const isPast = stepNum < activeStep;

          return (
            <span key={step} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={14} className="text-[#CBCCC9]" />}
              {isActive ? (
                <span className="rounded-full bg-[#205781] px-3 py-1 text-[13px] font-semibold text-white font-[Outfit]">
                  {step}
                </span>
              ) : (
                <span
                  className={`text-[13px] font-medium font-[Outfit] ${
                    isPast ? 'text-[#4F9DA6] font-medium' : 'text-[#9C9B99]'
                  }`}
                >
                  {step}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </header>
  );
}
