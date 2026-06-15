'use client';
import React from 'react';
import { Heart, Award, SlidersHorizontal, Lightbulb } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { KORPORAT_WA } from './waLink';

const ICONS = [Heart, Award, SlidersHorizontal, Lightbulb];

export const KorporatHero: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.hero;
  return (
    <section className="bg-[#F0F7FA] pt-32 pb-16">
      <Container>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#205781] uppercase mb-4">{t.eyebrow}</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1A1918] tracking-[-1px] leading-[1.1] mb-5">{t.title}</h1>
          <p className="text-lg text-[#666666] leading-relaxed mb-8">{t.subtitle}</p>
          <a
            href={KORPORAT_WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-[#f79d35] px-7 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]"
          >
            {t.cta}
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {t.badges.map((badge, i) => {
            const Icon = ICONS[i];
            return (
              <div key={badge} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 flex items-start gap-3">
                <Icon className="w-6 h-6 text-[#4F9DA6] shrink-0" />
                <p className="font-semibold text-[15px] text-[#1A1918] leading-snug">{badge}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
