'use client';

import React from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * Organisations Very has worked with.
 *
 * The label is deliberately "Dipercaya oleh" / "Trusted by" rather than
 * "Klien": Bank Indonesia is a former employer, and calling it a client
 * would be a different — and inaccurate — claim.
 *
 * The two lockups have very different proportions (Pinhome is a ~1:1
 * stacked mark, Bank Indonesia a 3.16:1 horizontal lockup), so they are
 * balanced by eye per logo rather than forced to a single height — equal
 * heights would leave Bank Indonesia's wordmark tiny next to Pinhome's.
 */
const CLIENTS = [
  {
    name: 'Pinhome',
    src: '/images/logo-pinhome.png',
    width: 211,
    height: 206,
    className: 'h-[42px] w-auto',
  },
  {
    name: 'Bank Indonesia',
    src: '/images/logo-bank-indonesia.png',
    width: 2201,
    height: 697,
    className: 'h-[38px] w-auto',
  },
];

export const ClientStrip: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.clients;

  // Symmetric padding: the hero photo bleeds to this section's top edge, so
  // without a matching pt- the logos hug the hero and float above a gap.
  return (
    <section className="bg-page-bg pt-16 pb-16 lg:pt-20 lg:pb-20" aria-label={t.label}>
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[1.6px] text-subtle whitespace-nowrap">
            {t.label}
          </span>

          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 list-none m-0 p-0">
            {CLIENTS.map((c) => (
              <li key={c.name}>
                {/* Greyscale keeps the strip from competing with the hero;
                    colour returns on hover. */}
                <Image
                  src={c.src}
                  alt={c.name}
                  width={c.width}
                  height={c.height}
                  className={`${c.className} object-contain grayscale opacity-70 transition duration-200 hover:grayscale-0 hover:opacity-100`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
