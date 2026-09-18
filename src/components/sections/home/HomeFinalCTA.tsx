'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const HomeFinalCTA: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.finalCTA;

  return (
    <section
      id="mulai"
      className="py-20 lg:py-28 text-center text-white scroll-mt-[72px]"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 0%, rgba(79,157,166,0.32) 0%, transparent 62%), linear-gradient(170deg, #153A56 0%, #0F2C42 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <h2 className="mx-auto max-w-[20ch] text-[33px] lg:text-[46px] font-extrabold leading-[1.1] tracking-[-1.3px] text-white text-balance">
          {t.headline}
        </h2>

        <p className="mx-auto max-w-[50ch] text-[17px] leading-[1.65] text-white/[0.82] mt-5">
          {t.lede}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-9">
          <Link
            href="/konsultasi/booking"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-amber text-[#3A2405] text-[15px] font-semibold shadow-[0_8px_22px_rgba(247,157,53,0.34)] transition-transform hover:-translate-y-0.5"
          >
            {t.ctaPrimary}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/financial-health-check"
            className="inline-flex items-center justify-center h-[52px] px-7 rounded-full text-white text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.5)] transition-colors hover:bg-white/10"
          >
            {t.ctaSecondary}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 mt-10">
          {t.assurances.map((a) => (
            <span
              key={a}
              className="flex items-baseline gap-2.5 text-[13.5px] font-medium text-white/[0.76]"
            >
              <span
                aria-hidden="true"
                className="w-[5px] h-[5px] rounded-full bg-mint flex-none -translate-y-0.5"
              />
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
