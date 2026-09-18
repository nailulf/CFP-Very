'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * NOTE: id="services" is load-bearing. The navbar and footer link to
 * `/#services` in both languages (see translations.ts) — renaming this
 * anchor breaks navigation site-wide.
 */
const HREFS = ['/financial-health-check', '/konsultasi', '/konsultasi'];

const ART = [
  'from-tint-blue to-tint-blue-2',
  'from-tint-teal to-tint-teal-2',
  'from-tint-slate to-tint-slate-2',
];

export const HomeServices: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.services;

  return (
    <section id="services" className="bg-white py-20 lg:py-28 scroll-mt-[72px]">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-12 lg:mb-14">
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.lede}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item, i) => (
            <article
              key={item.name}
              className="flex flex-col rounded-[26px] bg-white overflow-hidden shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
            >
              {/* Wash header. The overlay fades it into the card body so the
                  two zones read as one surface rather than stacked blocks. */}
              <div
                className={`relative flex items-end min-h-[148px] px-7 pt-8 pb-10 bg-gradient-to-br ${ART[i]}`}
              >
                <p className="relative z-[2] font-serif italic text-[21px] leading-[1.4] text-navy opacity-[0.86]">
                  {item.quote}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-14 bg-gradient-to-b from-transparent to-white"
                />
              </div>

              <div className="flex flex-col flex-1 gap-[11px] px-7 pt-1 pb-[30px]">
                <h3 className="text-[19.5px] font-extrabold leading-[1.3] tracking-[-0.45px] text-navy">
                  {item.name}
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{item.desc}</p>

                <div className="mt-auto pt-5">
                  <Link
                    href={HREFS[i]}
                    className="inline-flex items-center justify-center gap-2 h-[42px] px-5 rounded-full text-navy text-[14px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(21,58,86,0.22)] transition-colors hover:bg-navy hover:text-white"
                  >
                    {item.cta}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-12 lg:mt-14">
          <Link
            href="/konsultasi/booking"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-navy text-white text-[15px] font-semibold shadow-[0_8px_22px_rgba(21,58,86,0.24)] transition-transform hover:-translate-y-0.5"
          >
            {t.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
