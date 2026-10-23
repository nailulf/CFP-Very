'use client';
import React from 'react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const KorporatTestimonials: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.testimonials;

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.items.map((item) => (
            <div
              key={item.role}
              className="flex flex-col gap-[18px] bg-white rounded-[26px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] px-7 py-[30px] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
            >
              <p className="text-[15.5px] leading-[1.65] italic text-dark">{item.quote}</p>

              <div className="flex items-center gap-3 mt-auto pt-2">
                <span className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-gradient-to-br from-tint-blue to-tint-teal text-primary text-[13px] font-extrabold flex-none">
                  {item.initials}
                </span>
                <span>
                  {item.name && <span className="block text-[14px] font-bold text-navy">{item.name}</span>}
                  <span className="block text-[12.5px] text-subtle">{item.role}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
