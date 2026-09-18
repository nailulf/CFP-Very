'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Instagram, Users } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/** Icons pair with hero.stats by index — keep this in step with translations.ts. */
const STAT_ICONS = [Users, Building2, Instagram];

/**
 * The portrait is re-exported on a cream backdrop (#FCF4E9 at the top) that
 * all but matches the band's #FBF6EE, so the empty area above the subject
 * reads as continuous background rather than as a photo edge. It is still
 * masked at the foot, where the shot darkens to #EADED2 and the band has
 * turned cool.
 */
export const HomeHero: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.hero;

  return (
    <section
      id="top"
      className="pt-[72px] overflow-hidden"
      style={{
        background: 'linear-gradient(168deg, #FBF6EE 0%, #FBF6EE 46%, #F0F7FA 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 pt-10 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.86fr] gap-10 lg:gap-10 items-end">
          {/* Copy */}
          <div className="flex flex-col items-start gap-6 pb-10 lg:pb-24">
            {/* <p className="font-mono text-[11px] font-bold uppercase tracking-[1.8px] text-primary leading-[1.7]">
              {t.kicker[0]}
              <br />
              {t.kicker[1]}
            </p> */}

            <h1 className="text-[33px] sm:text-[40px] lg:text-[46px] font-extrabold leading-[1.1] tracking-[-1.3px] text-navy">
              {t.headline[0]}
              <br />
              {t.headline[1]}
              <br />
              {t.headline[2]}
            </h1>

            <p className="text-[17px] leading-[1.65] text-muted max-w-[60ch]">{t.lede}</p>

            {/* Proof figures. Icons carry the meaning so the labels can stay
                short; hairline dividers keep it one object, not three cards. */}
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-4 list-none m-0 p-0">
              {t.stats.map((stat, i) => {
                const Icon = STAT_ICONS[i];
                return (
                  <li
                    key={stat.label}
                    // Dividers only from lg up, where all three sit on one
                    // line. Below that they wrap, and a border-l on a wrapped
                    // item renders as a stray rule at the start of the row.
                    className={`flex items-center gap-2.5${
                      i > 0 ? ' lg:pl-7 lg:border-l lg:border-l-[#CBDCEA]' : ''
                    }`}
                  >
                    {/* ~32px against a 43px value+label stack: tall enough to
                        anchor the block, short enough not to outweigh the
                        numeral. Lucide glyphs fill their box, so matching the
                        stack height exactly reads as oversized. */}
                    <Icon
                      size={32}
                      strokeWidth={1.8}
                      className="text-primary flex-none"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-[20px] font-extrabold leading-none tracking-[-0.5px] text-navy tabular-nums">
                        {stat.value}
                      </span>
                      <span className="block text-[12.5px] font-medium text-muted mt-1">
                        {stat.label}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap gap-3.5">
              <Link
                href="/konsultasi"
                className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full bg-navy text-white text-[15px] font-semibold shadow-[0_8px_22px_rgba(21,58,86,0.24)] transition-transform hover:-translate-y-0.5"
              >
                {t.ctaPrimary}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center h-[52px] px-7 rounded-full text-navy text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(21,58,86,0.22)] transition-colors hover:bg-navy hover:text-white"
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* Photograph */}
          <div className="relative self-end">
            <span
              aria-hidden="true"
              className="absolute left-1/2 bottom-0 w-[118%] aspect-square -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 58%, #F3E5DC 0%, rgba(243,229,220,0.5) 46%, rgba(243,229,220,0) 70%)',
              }}
            />

            {/* The source is 1684x2528 and the subject only starts 31% down,
                so ~780px of it is empty backdrop that stretched the whole
                section. The 0.86 box crops that off the top via object-bottom,
                keeping roughly 65px of headroom above her.

                Masks live here, not on the <img>, so they feather the cropped
                box: the photo's cream (#F9F2E5) is ~9 points warmer in blue
                than the band's #FBF6EE — close, but enough to draw a visible
                rectangle if any edge lands hard. */}
            <div
              className="relative w-full aspect-[0.86]"
              style={{
                WebkitMaskImage:
                  'linear-gradient(180deg, transparent 0%, #000 6%, #000 84%, transparent 99%), linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
                maskImage:
                  'linear-gradient(180deg, transparent 0%, #000 6%, #000 84%, transparent 99%), linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            >
              <Image
                src="/images/hero-portrait.jpg"
                alt={t.credential.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-bottom"
              />
            </div>

            <div className="relative lg:absolute lg:right-[-8px] lg:bottom-[118px] z-[3] -mt-10 lg:mt-0 max-w-none lg:max-w-[250px] rounded-[18px] bg-white/92 backdrop-blur-[10px] px-[19px] py-[15px] shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]">
              <p className="text-[15.5px] font-extrabold tracking-[-0.3px] text-navy">
                {t.credential.name}
              </p>
              <p className="text-[12.5px] font-medium text-muted mt-[3px]">{t.credential.role}</p>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.9px] text-teal mt-1.5">
                {t.credential.meta}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
