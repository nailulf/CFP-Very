'use client';
import React from 'react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const MengapaFinancialWellness: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.why;
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-[#1A1918] tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-[#666666] max-w-2xl">{t.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {t.stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7">
              <p className="text-[44px] font-extrabold leading-none tracking-[-1px] text-[#f79d35] mb-3">{stat.value}</p>
              <p className="text-[14px] text-[#666666] leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[#9C9B99] leading-relaxed mt-8 max-w-3xl">{t.note}</p>
      </Container>
    </section>
  );
};
