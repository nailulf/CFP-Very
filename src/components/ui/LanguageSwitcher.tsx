'use client';

import React from 'react';
import { useLang } from '@/lib/lang-context';
import type { Lang } from '@/lib/lang-context';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLang();

  return (
    <div className="inline-flex rounded-full border border-[#E0EBF5] p-0.5 bg-white/60">
      {(['id', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide transition-colors ${
            lang === l
              ? 'bg-[#205781] text-white'
              : 'text-[#6D6C6A] hover:text-[#1A1918]'
          }`}
          aria-label={`Switch to ${l.toUpperCase()}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
