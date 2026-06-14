'use client';
import React from 'react';
import { ClipboardCheck, Flag, Route, FileText } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [ClipboardCheck, Flag, Route, FileText];

export const BagaimanaKamiMembantu: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.help;
  return (
    <section className="bg-[#F0F7FA] py-20">
      <Container>
        <SectionHeader badgeVariant="light" title={<span className="text-[#1A1918]">{t.title}</span>} subtitle={t.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {t.items.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={it.title} className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7">
                <div className="w-12 h-12 rounded-2xl bg-[#E0EBF5] flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-[#205781]" /></div>
                <h3 className="text-[18px] font-semibold text-[#1A1918] mb-2">{it.title}</h3>
                <p className="text-[14px] text-[#666666] leading-relaxed">{it.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
