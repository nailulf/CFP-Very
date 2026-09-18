'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DigitalProductsModal } from '@/components/sections/DigitalProductsModal';
import { digitalProducts } from '@/data/digitalProducts';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/** "IDR 25000" -> "Rp 25.000". The data stores prices as plain strings. */
function formatPrice(raw?: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return raw;
  return `Rp ${Number(digits).toLocaleString('id-ID')}`;
}

/** Card tints and sheet accents cycle through the brand blues and teal. */
const ART = [
  { wash: 'from-tint-blue to-tint-blue-2', sheet: '#205781' },
  { wash: 'from-tint-teal to-tint-teal-2', sheet: '#4F9DA6' },
  { wash: 'from-tint-slate to-tint-slate-2', sheet: '#153A56' },
];

const GAP = 20;

/** Placeholder product shot — replace with a real template screenshot. */
const SheetPreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    aria-hidden="true"
    className="relative z-[2] w-full max-w-[196px] rounded-[9px] bg-white p-2.5 flex flex-col gap-1.5 shadow-[0_10px_26px_rgba(21,58,86,0.16)]"
  >
    <div className="flex gap-1">
      <i className="h-2 rounded-sm flex-[2]" style={{ background: accent, opacity: 0.9 }} />
      <i className="h-2 rounded-sm flex-1" style={{ background: accent, opacity: 0.5 }} />
      <i className="h-2 rounded-sm flex-1" style={{ background: accent, opacity: 0.5 }} />
    </div>
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex gap-1">
        {[0, 1, 2].map((col) => (
          <span
            key={col}
            className="h-[5px] rounded-sm flex-1"
            style={
              col === row % 3
                ? { background: accent, opacity: 0.32 }
                : { background: '#E6EBF1' }
            }
          />
        ))}
      </div>
    ))}
    <div className="flex items-end gap-[3px] h-[30px] mt-[3px]">
      {[38, 66, 48, 88, 58].map((h, i) => (
        <i
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${h}%`, background: accent, opacity: 0.55 }}
        />
      ))}
    </div>
  </div>
);

export const ProductCarousel: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.products;

  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.getBoundingClientRect().width + GAP : el.clientWidth * 0.8;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-12 lg:mb-14">
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.lede}</p>
        </div>

        {/* Arrows only nudge native scroll, so touch, trackpad and keyboard
            all keep working even if this script never runs. */}
        <div className="flex justify-end gap-2.5 mb-5">
          <button
            type="button"
            aria-label={t.prev}
            aria-controls="dp-track"
            disabled={atStart}
            onClick={() => go(-1)}
            className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-page-bg text-navy shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition disabled:opacity-30 disabled:cursor-default enabled:hover:-translate-y-0.5"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={t.next}
            aria-controls="dp-track"
            disabled={atEnd}
            onClick={() => go(1)}
            className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-page-bg text-navy shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition disabled:opacity-30 disabled:cursor-default enabled:hover:-translate-y-0.5"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          id="dp-track"
          ref={trackRef}
          onScroll={sync}
          tabIndex={0}
          role="region"
          aria-label={t.regionLabel}
          className="flex gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pt-1.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-[26px]"
        >
          {digitalProducts.map((p, i) => {
            const art = ART[i % ART.length];
            const price = formatPrice(p.price);
            const was = formatPrice(p.originalPrice);

            return (
              <article
                key={p.id}
                data-card
                className="snap-start flex flex-col flex-none w-[86%] md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] rounded-[26px] bg-white overflow-hidden shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
              >
                <div
                  className={`relative flex items-center justify-center min-h-[168px] px-6 pt-6 pb-[30px] bg-gradient-to-br ${art.wash}`}
                >
                  <SheetPreview accent={art.sheet} />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px h-11 bg-gradient-to-b from-transparent to-white"
                  />
                </div>

                <div className="flex flex-col flex-1 gap-2.5 px-6 pt-1 pb-7">
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[1.3px] text-teal">
                    {p.category} · {p.fileType}
                  </span>
                  <span className="text-[18px] font-extrabold leading-[1.3] tracking-[-0.35px] text-navy">
                    {p.title}
                  </span>
                  <p className="text-[14px] leading-[1.6] text-muted line-clamp-3">
                    {p.description}
                  </p>

                  <div className="mt-auto pt-4.5 flex flex-wrap items-center justify-between gap-3">
                    {p.isFree ? (
                      <span className="font-mono text-[10px] font-bold tracking-[1.2px] rounded-full bg-success-bg text-success px-2.5 py-1">
                        {t.free}
                      </span>
                    ) : (
                      <span className="flex items-baseline gap-2">
                        <span className="font-mono text-[15px] font-semibold text-navy tabular-nums">
                          {price}
                        </span>
                        {was && (
                          <span className="font-mono text-[11.5px] font-medium text-subtle line-through tabular-nums">
                            {was}
                          </span>
                        )}
                      </span>
                    )}

                    <a
                      href={p.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-[42px] px-5 rounded-full text-navy text-[14px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(21,58,86,0.22)] transition-colors hover:bg-navy hover:text-white"
                    >
                      {p.isFree ? t.download : t.view}
                      <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex justify-center mt-12 lg:mt-14">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-full text-navy text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_rgba(21,58,86,0.22)] transition-colors hover:bg-navy hover:text-white"
          >
            {t.cta}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <DigitalProductsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};
