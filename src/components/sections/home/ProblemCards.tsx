'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * Self-identification grid, "accent rail" treatment: white cards lifted off a
 * tinted ground, each with a 4px brand-gradient rail.
 *
 * The section ground is page-bg, not white — white cards on a white section
 * would have only their shadow to separate them, which is too weak to read.
 * HomeServices flips to white in exchange, so the band rhythm still alternates.
 */
export const ProblemCards: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.problem;

  return (
    <section className="bg-page-bg py-20 lg:py-28">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-12 lg:mb-14">
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.lede}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {t.items.map((item) => (
            <article
              key={item.state}
              className="relative overflow-hidden rounded-[24px] bg-white pl-7 pr-6 py-[28px] flex flex-col gap-[11px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
            >
              {/* The section's only colour, spent on six thin strokes.
                  overflow-hidden clips the rail to the card's radius. */}
              <span
                aria-hidden="true"
                className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-primary to-teal"
              />
              <span className="text-[17.5px] font-extrabold leading-[1.35] tracking-[-0.4px] text-navy">
                {item.state}
              </span>
              <span className="text-[14.5px] leading-[1.6] text-[#5C6B75]">{item.consequence}</span>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-[17px] font-semibold text-navy">{t.close}</p>

        <div className="flex justify-center mt-12 lg:mt-14">
          <Link
            href="/#services"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full text-navy text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(21,58,86,0.22)] transition-colors hover:bg-navy hover:text-white"
          >
            {t.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
