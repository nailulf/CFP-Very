'use client';
import React from 'react';
import { Heart, Award, SlidersHorizontal, Lightbulb, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { KORPORAT_WA } from './waLink';

const ICONS = [Heart, Award, SlidersHorizontal, Lightbulb];

export const KorporatHero: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.hero;
  return (
    <section className="bg-page-bg pt-32 lg:pt-36 pb-16 lg:pb-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-primary uppercase mb-4">{t.eyebrow}</p>
          <h1 className="text-[33px] sm:text-[40px] lg:text-[46px] font-extrabold leading-[1.1] tracking-[-1.3px] text-navy mb-5">
            {t.title}
          </h1>
          <p className="text-[17px] leading-[1.65] text-muted max-w-[60ch] mb-8">{t.subtitle}</p>
          <a
            href={KORPORAT_WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-navy text-white text-[15px] font-semibold shadow-[0_8px_22px_rgba(21,58,86,0.24)] transition-transform hover:-translate-y-0.5"
          >
            {t.cta}
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {t.badges.map((badge, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={badge}
                className="bg-white rounded-[24px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] p-5 flex items-start gap-3 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
              >
                <Icon className="w-6 h-6 text-teal shrink-0" />
                <p className="font-semibold text-[15px] text-dark leading-snug">{badge}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
