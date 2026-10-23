'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const KorporatFAQ: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-page-bg py-20 lg:py-28">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-12 lg:mb-14">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-primary uppercase mb-4">{t.eyebrow}</p>
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
        </div>
        <div className="flex flex-col gap-3 max-w-3xl mx-auto">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="bg-white rounded-[24px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`korporat-faq-${i}`}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-[15px] text-dark">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <p id={`korporat-faq-${i}`} className="px-5 pb-5 text-[14px] text-muted leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
