'use client';
import React from 'react';
import { Wallet, Sunrise, LineChart, ShieldAlert } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

const ICONS = [Wallet, Sunrise, LineChart, ShieldAlert];

export const TopikProgram: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.topics;
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{
        background: 'linear-gradient(140deg, #153A56 0%, #0F2C42 58%, #123B52 100%)',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 w-[460px] h-[460px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,157,166,0.26), transparent 68%)',
        }}
      />
      <div className="relative mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-mint mb-4">{t.eyebrow}</p>
        <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-white text-balance max-w-2xl">
          {t.title}
        </h2>
        <p className="text-[17px] leading-[1.65] text-white/[0.78] max-w-3xl mt-4 mb-12">{t.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={item.title}
                className="rounded-[24px] bg-navy-card p-7 flex gap-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-teal" />
                  </div>
                  <span className="font-mono text-[13px] font-bold text-mint">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-white mb-2 leading-snug">{item.title}</h3>
                  <p className="text-[14px] text-white/[0.66] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
