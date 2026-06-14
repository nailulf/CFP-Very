'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const KonsultasiFAQ: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-[#1A1918] tracking-[-0.8px] mb-10">{t.title}</h2>
        <div className="flex flex-col gap-3 max-w-3xl">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="bg-white rounded-2xl border border-[#E0EBF5] overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="font-semibold text-[15px] text-[#1A1918]">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#205781] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-[14px] text-[#666666] leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
