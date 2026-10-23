'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { KORPORAT_WA } from './waLink';

export const KorporatFinalCTA: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.finalCta;
  return (
    <section className="bg-page-bg pb-24">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div
          className="relative overflow-hidden rounded-[24px] px-8 py-14 text-center"
          style={{
            background: 'linear-gradient(170deg, #153A56 0%, #0F2C42 100%)',
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 w-[360px] h-[360px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(79,157,166,0.26), transparent 68%)',
            }}
          />
          <div className="relative">
            <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-white text-balance max-w-2xl mx-auto mb-3">
              {t.title}
            </h2>
            <p className="text-white/75 max-w-2xl mx-auto mb-8">{t.subtitle}</p>
            <a
              href={KORPORAT_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-amber text-[#3A2405] text-[15px] font-semibold shadow-[0_8px_22px_rgba(247,157,53,0.34)] transition-transform hover:-translate-y-0.5"
            >
              {t.button}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
