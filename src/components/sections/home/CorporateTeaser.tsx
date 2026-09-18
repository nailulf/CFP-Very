'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * Dark band. Every text element here sets its own colour explicitly —
 * inheriting white from the section is not enough, because the shared
 * heading/body styles would otherwise paint navy text on a navy ground.
 */
export const CorporateTeaser: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.corporate;

  return (
    <section
      id="korporat-teaser"
      className="relative overflow-hidden py-20 lg:py-28 text-white"
      style={{
        background: 'linear-gradient(140deg, #153A56 0%, #0F2C42 58%, #123B52 100%)',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 w-[460px] h-[460px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,157,166,0.26), transparent 68%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[1.6px] text-mint mb-3.5">
          {t.overline}
        </p>

        <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-white text-balance">
          {t.title[0]}
          <br className="hidden sm:block" /> {t.title[1]}
        </h2>

        <p className="text-[17px] leading-[1.65] text-white/[0.78] max-w-[60ch] mt-4.5">{t.lede}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-12 lg:mt-14">
          {t.items.map((item, i) => (
            <div
              key={item.name}
              className={`flex flex-col gap-[11px] pr-0 md:pr-11 ${
                i > 0
                  ? 'md:pl-11 md:shadow-[inset_1px_0_0_rgba(255,255,255,0.13)] mt-10 md:mt-0'
                  : ''
              }`}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[1.5px] text-mint">
                {item.label}
              </span>
              <span className="text-[19px] font-extrabold leading-[1.3] tracking-[-0.35px] text-white">
                {item.name}
              </span>
              <span className="text-[14.5px] leading-[1.6] text-white/[0.66]">{item.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 mt-12 lg:mt-14">
          <Link
            href="/korporat"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-white text-navy text-[15px] font-semibold shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)] transition-transform hover:-translate-y-0.5"
          >
            {t.cta}
            <ArrowRight size={16} />
          </Link>
          <span className="text-[14px] font-medium text-white/60">{t.ctaNote}</span>
        </div>
      </div>
    </section>
  );
};
