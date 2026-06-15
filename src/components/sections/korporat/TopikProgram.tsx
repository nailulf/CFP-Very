'use client';
import React from 'react';
import { Wallet, Sunrise, LineChart, ShieldAlert } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Wallet, Sunrise, LineChart, ShieldAlert];

export const TopikProgram: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.topics;
  return (
    <section className="bg-[#205781] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#8AD6C1] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-white tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-white/75 max-w-3xl mb-12">{t.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <div key={item.title} className="bg-[#1A3A50] rounded-2xl p-7 flex gap-5">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#205781] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#4F9DA6]" />
                  </div>
                  <span className="font-mono text-[13px] font-bold text-[#8AD6C1]">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-white mb-2 leading-snug">{item.title}</h3>
                  <p className="text-[14px] text-[#9C9B99] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
