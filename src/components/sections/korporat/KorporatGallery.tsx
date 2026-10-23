'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

/**
 * Photo proof of past corporate training sessions, for credibility on the
 * /korporat page.
 *
 * Same auto-rotating carousel mechanism as home/Testimonials.tsx — native
 * scroll + snap so touch, trackpad and keyboard all work without the
 * script, auto-rotation pauses on hover/focus, stops for good once the
 * reader scrolls it themselves, and never starts under
 * prefers-reduced-motion.
 *
 * Photo sources, indexed to match korporat.gallery.items in translations.ts
 * one-for-one. `null` means no real photo yet — that tile falls back to the
 * labeled placeholder instead of a fabricated image. Add more entries here
 * (and a matching real company/session in translations.ts, both languages)
 * as more photos come in.
 */
const GALLERY_PHOTOS: (string | null)[] = [
  '/images/gallery/bi-workshop-2026-1.jpg',
  '/images/gallery/bi-workshop-2026-2.jpg',
];

const GAP = 20;
const ROTATE_MS = 6000;

export const KorporatGallery: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].korporat.gallery;

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

  useEffect(() => {
    if (userTook || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft >= max - 2 ? 0 : el.scrollLeft + step();
      el.scrollTo({ left: next, behavior: 'smooth' });
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [paused, userTook, step]);

  const hold = () => setPaused(true);
  const release = () => setPaused(false);

  // Card width adapts to how many photos actually exist, so a short
  // gallery (today: 2 photos) fills its row evenly instead of leaving an
  // empty 1/3 slot sized for a 3-up row that isn't there yet. Mobile keeps
  // the same 86% peek as every other carousel on the site regardless of
  // count, as a consistent "there's more, swipe" hint.
  const cardWidthClass =
    t.items.length >= 3
      ? 'w-[86%] md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]'
      : t.items.length === 2
        ? 'w-[86%] sm:w-[calc((100%-20px)/2)]'
        : 'w-[86%] sm:w-full';

  return (
    <section className="bg-page-bg py-20 lg:py-28">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-[660px] mx-auto text-center mb-10 lg:mb-12">
          <p className="font-mono text-[11px] font-bold tracking-[1.5px] text-primary uppercase mb-4">{t.eyebrow}</p>
          <h2 className="text-[26px] lg:text-[34px] font-extrabold leading-[1.16] tracking-[-0.9px] text-navy text-balance">
            {t.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-muted mt-4">{t.subtitle}</p>
        </div>

        <div className="flex justify-end gap-2.5 mb-5">
          <button
            type="button"
            aria-label={t.prev}
            aria-controls="korporat-gallery-track"
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
            aria-controls="korporat-gallery-track"
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
          id="korporat-gallery-track"
          ref={trackRef}
          onScroll={sync}
          onMouseEnter={hold}
          onMouseLeave={release}
          onFocusCapture={hold}
          onBlurCapture={release}
          onPointerDown={() => setUserTook(true)}
          onWheel={() => setUserTook(true)}
          tabIndex={0}
          role="region"
          aria-label={t.regionLabel}
          className="flex gap-5 items-stretch overflow-x-auto overscroll-x-contain snap-x snap-mandatory pt-1.5 pb-3 mt-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-[26px]"
        >
          {t.items.map((item, i) => {
            const photo = GALLERY_PHOTOS[i];
            return (
              <figure
                key={i}
                data-card
                className={`snap-start flex flex-col flex-none ${cardWidthClass} rounded-[26px] bg-white shadow-[0_1px_2px_rgba(21,58,86,0.04),0_8px_24px_rgba(21,58,86,0.05)] overflow-hidden transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(21,58,86,0.04),0_18px_44px_rgba(21,58,86,0.09)]`}
              >
                <div className={`relative aspect-square ${photo ? '' : 'bg-gradient-to-br from-tint-blue to-tint-teal'}`}>
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`${item.company} — ${item.session}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 86vw"
                      className="object-cover"
                    />
                  ) : (
                    // Placeholder tile — no fabricated photo.
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-teal">
                      <Camera className="w-10 h-10" strokeWidth={1.5} />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[1.5px]">{t.placeholderNote}</span>
                    </div>
                  )}
                </div>
                <figcaption className="p-5">
                  <span className="block text-[14px] font-bold text-navy">{item.company}</span>
                  <span className="block text-[12.5px] text-subtle mt-0.5">{item.session}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};
