'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * NOTE: id="testimoni" is load-bearing — the navbar and footer link to
 * `/#testimoni` in both languages.
 *
 * Auto-rotating carousel over native scroll + snap, the same mechanism as
 * ProductCarousel, so touch, trackpad and keyboard work without the script.
 *
 * Auto-rotation is the part that needs care — a carousel that moves while
 * someone is mid-sentence is worse than no carousel. It stops on hover, on
 * keyboard focus, while the tab is hidden, permanently once the reader
 * scrolls it themselves, and never starts at all under prefers-reduced-motion.
 */
const GAP = 20;
const ROTATE_MS = 6000;

export const Testimonials: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].home.testimonials;

  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [paused, setPaused] = useState(false);
  const [userTook, setUserTook] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  const step = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>('[data-card]');
    return card ? card.getBoundingClientRect().width + GAP : el.clientWidth * 0.8;
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
    },
    [step],
  );

  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  // Auto-rotation. Every guard below is a reason not to move the content
  // under someone who is reading it.
  useEffect(() => {
    if (userTook || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return; // everything already fits; nothing to rotate
      const next = el.scrollLeft >= max - 2 ? 0 : el.scrollLeft + step();
      el.scrollTo({ left: next, behavior: 'smooth' });
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [paused, userTook, step]);

  const hold = () => setPaused(true);
  const release = () => setPaused(false);

  return (
    <section id="testimoni" className="bg-page-bg py-20 lg:py-28 scroll-mt-[72px]">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-10 lg:mb-12">
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.lede}</p>
        </div>

        <div className="flex justify-end gap-2.5 mb-5">
          <button
            type="button"
            aria-label={t.prev}
            aria-controls="tm-track"
            disabled={atStart}
            onClick={() => {
              setUserTook(true);
              go(-1);
            }}
            className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-white text-navy shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition disabled:opacity-30 disabled:cursor-default enabled:hover:-translate-y-0.5"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={t.next}
            aria-controls="tm-track"
            disabled={atEnd}
            onClick={() => {
              setUserTook(true);
              go(1);
            }}
            className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-white text-navy shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition disabled:opacity-30 disabled:cursor-default enabled:hover:-translate-y-0.5"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          id="tm-track"
          ref={trackRef}
          onScroll={sync}
          // mouse-, not pointer-events: pointerenter fires on touch too and
          // frequently gets no matching pointerleave, which would latch
          // rotation off for good on a phone. Touch is already handled by
          // onPointerDown below, which stops rotation deliberately.
          onMouseEnter={hold}
          onMouseLeave={release}
          onFocusCapture={hold}
          onBlurCapture={release}
          onPointerDown={() => setUserTook(true)}
          onWheel={() => setUserTook(true)}
          tabIndex={0}
          role="region"
          aria-label={t.regionLabel}
          className="flex gap-5 items-stretch overflow-x-auto overscroll-x-contain snap-x snap-mandatory pt-1.5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-[26px]"
        >
          {t.items.map((item) => (
            <article
              key={item.name}
              data-card
              // Equal widths and stretched height: quotes vary a lot in length,
              // and ragged card heights were the untidiness in the old grid.
              className="snap-start flex flex-col gap-[18px] flex-none w-[86%] md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] rounded-[26px] bg-white px-7 py-[30px] shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]"
            >
              <p className="text-[15.5px] leading-[1.65] italic text-dark">{item.quote}</p>

              <div className="flex items-center gap-3 mt-auto">
                <span className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-gradient-to-br from-tint-blue to-tint-teal text-primary text-[13px] font-extrabold flex-none">
                  {item.initials}
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-navy">{item.name}</span>
                  <span className="block text-[12.5px] text-subtle">{item.role}</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-[18px] shadow-[inset_0_1px_0_#F0F7FA]">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.9px] text-teal">
                  {item.tag}
                </span>
                <span className="text-amber text-[13px] tracking-[1px]" aria-hidden="true">
                  ★★★★★
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
