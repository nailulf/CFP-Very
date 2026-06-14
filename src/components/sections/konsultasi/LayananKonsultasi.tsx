'use client';
import React from 'react';
import Link from 'next/link';
import { Landmark, PiggyBank, GraduationCap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Landmark, PiggyBank, GraduationCap];

export const LayananKonsultasi: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.services;
  return (
    <section className="bg-[#205781] py-20">
      <Container>
        <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#8AD6C1] uppercase mb-4">{t.eyebrow}</p>
        <h2 className="text-3xl font-extrabold text-white tracking-[-0.8px] mb-3 max-w-2xl">{t.title}</h2>
        <p className="text-white/75 max-w-2xl mb-12">{t.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={it.title} className="bg-[#1A3A50] rounded-2xl p-7">
                <Icon className="w-7 h-7 text-[#4F9DA6] mb-4" />
                <h3 className="text-[18px] font-semibold text-white mb-2">{it.title}</h3>
                <p className="text-[14px] text-[#9C9B99] leading-relaxed">{it.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12">
          <Link href="/konsultasi/booking" className="inline-flex items-center rounded-full bg-[#f79d35] px-7 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">{t.cta}</Link>
        </div>
      </Container>
    </section>
  );
};
