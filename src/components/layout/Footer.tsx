'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const Footer: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].footer;

  return (
    <footer className="bg-[#153A56] pt-12 pb-8 px-5 sm:px-10 lg:px-20">
      <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-[320px]">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/icon_1.png"
                alt="Aditya Very Cleverina logo"
                width={192}
                height={192}
                className="w-10 h-10 rounded-md object-cover"
              />
              <span className="text-[20px] font-bold text-white tracking-[-0.5px]">
                Aditya Very Cleverina
              </span>
            </Link>
            <p className="text-[14px] text-[#9C9B99] leading-[1.5]">
              {t.brand}
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16">
            {t.columns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <h4 className="text-[14px] font-semibold text-white">{col.heading}</h4>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[14px] text-[#9C9B99] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1A4A65]" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[12px] text-[#6D6C6A]">
            <Image
              src="/icon_1.png"
              alt="Aditya Very Cleverina icon"
              width={192}
              height={192}
              className="w-6 h-6 rounded object-cover"
            />
            &copy; {new Date().getFullYear()} Aditya Very Cleverina. {t.copyright}
          </span>
          <span className="text-[12px] text-[#6D6C6A]">
            {t.tagline}
          </span>
        </div>
      </div>
    </footer>
  );
};
