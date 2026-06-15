'use client';
import React from 'react';
import { Users, Calculator, Home, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Users, Calculator, Home];

export const TopikLainnya: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.more;
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-[#1A1918] tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-[#666666] max-w-2xl">{t.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {t.groups.map((group, i) => {
            const Icon = ICONS[i];
            return (
              <div key={group.title} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E0EBF5] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#205781]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1A1918] leading-tight">{group.title}</h3>
                    <p className="text-[12px] text-[#9C9B99] leading-tight mt-0.5">{group.audience}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] text-[#666666] leading-snug">
                      <Check className="w-4 h-4 text-[#4F9DA6] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
