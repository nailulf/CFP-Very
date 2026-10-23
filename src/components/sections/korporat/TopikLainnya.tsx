'use client';
import React from 'react';
import { Users, Calculator, Home, Check } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Users, Calculator, Home];

export const TopikLainnya: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.more;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.groups.map((group, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={group.title}
                className="bg-white rounded-[24px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] p-7 flex flex-col gap-4 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-light-blue flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-dark leading-tight">{group.title}</h3>
                    <p className="text-[12px] text-subtle leading-tight mt-0.5">{group.audience}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] text-muted leading-snug">
                      <Check className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
