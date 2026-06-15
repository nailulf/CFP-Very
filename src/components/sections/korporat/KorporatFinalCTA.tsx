'use client';
import React from 'react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { KORPORAT_WA } from './waLink';

export const KorporatFinalCTA: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.finalCta;
  return (
    <section className="bg-[#F0F7FA] pb-24">
      <Container>
        <div className="rounded-[24px] bg-gradient-to-b from-[#153A56] to-[#1E5070] px-8 py-14 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-[-0.8px] mb-3 max-w-2xl mx-auto">{t.title}</h2>
          <p className="text-white/75 max-w-2xl mx-auto mb-8">{t.subtitle}</p>
          <a
            href={KORPORAT_WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-[#f79d35] px-7 py-3.5 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]"
          >
            {t.button}
          </a>
        </div>
      </Container>
    </section>
  );
};
