'use client';
import React from 'react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const MengapaFinancialWellness: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.why;
  return (
    <section className="bg-page-bg py-20 lg:py-28">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-12 lg:mb-14">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-primary uppercase mb-4">{t.eyebrow}</p>
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-[24px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] p-7 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
            >
              <p className="text-[44px] font-extrabold leading-none tracking-[-1px] text-amber mb-3">{stat.value}</p>
              <p className="text-[14px] text-muted leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-subtle leading-relaxed mt-8 max-w-3xl mx-auto text-center">{t.note}</p>
      </div>
    </section>
  );
};
