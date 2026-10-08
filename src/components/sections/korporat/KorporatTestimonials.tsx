'use client';
import React from 'react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const KorporatTestimonials: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.testimonials;

  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-[#1A1918] tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-[#666666] max-w-2xl">{t.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {t.items.map((item) => (
            <div
              key={item.role}
              className="flex flex-col gap-[18px] bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7"
            >
              <p className="text-[15.5px] leading-[1.65] italic text-[#1A1918]">{item.quote}</p>

              <div className="flex items-center gap-3 mt-auto pt-2">
                <span className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#E9F1F8] to-[#E4EFEC] text-[#205781] text-[13px] font-extrabold flex-none">
                  {item.initials}
                </span>
                <span>
                  {item.name && <span className="block text-[14px] font-bold text-[#153A56]">{item.name}</span>}
                  <span className="block text-[12.5px] text-[#9C9B99]">{item.role}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
