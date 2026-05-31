'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Rocket,
  Lightbulb,
  HeartIcon,
  RocketIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Services } from '@/components/sections/Services';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

// ── Shared sub-components ──────────────────────────────────────────────────

function SectionBadge({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${dark ? 'bg-[#1A3A50] text-[#8AD6C1]' : 'bg-[#E0EFF5] text-[#8AD6C1]'}`}>
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const { lang } = useLang();
  const t = translations[lang];

  const hero = t.hero;
  const hiw = t.howItWorks;
  const sp = t.socialProof;
  const cta = t.finalCTA;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-[72px] bg-[#F0F7FA]">
        <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text */}
            <div className="flex flex-col gap-6 flex-1">
              <Badge>
                <span>✨</span>
                <span>{hero.badge}</span>
              </Badge>

              <h1 className="text-[52px] sm:text-[56px] font-extrabold text-[#1A1918] leading-[1.1] tracking-[-1.5px]">
                {hero.headline[0]}<br />
                {hero.headline[1]}<br />
                {hero.headline[2]}
              </h1>

              <p className="text-[18px] text-[#6D6C6A] leading-[1.6] max-w-[480px]">
                {hero.sub}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="#services">
                  <Button size="lg">
                    {hero.ctaPrimary} <Rocket className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#services">
                  <button className="inline-flex items-center justify-center px-6 h-14 rounded-full border-2 border-[#205781] text-[#205781] font-semibold text-base hover:bg-[#E0EFF5] transition-colors">
                    {hero.ctaSecondary}
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <span className="text-[13px] font-medium text-[#9C9B99]">{hero.trust}</span>
                <span className="text-[14px] text-[#D4A64A]">⭐⭐⭐⭐⭐</span>
                <span className="text-[13px] font-medium text-[#9C9B99]">{hero.rating}</span>
              </div>
            </div>

            {/* Image */}
            <div className="relative flex-shrink-0 w-full max-w-[480px]">
               <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg transform translate-x-[-20%] z-10">
                <h3 className="text-lg font-bold text-[#1A1918]">Aditya Very Cleverina, CFP®</h3>
                <p className="text-sm text-[#6D6C6A]">{hero.heroCaption}</p>
              </div>
              <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-[#E0EFF5]">
                <Image
                  src="/images/hero.png"
                  alt="Aditya Very Cleverina"
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Services />

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#153A56] py-20">
        <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center text-center">
            <SectionBadge dark>
              <Lightbulb size={16} />
              {hiw.badge}
            </SectionBadge>
            <div className="text-3xl lg:text-[40px] font-bold leading-tight tracking-tight text-white">
              {hiw.title[0]}<br />{hiw.title[1]}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {hiw.steps.map((step, i) => {
              const bg = ['#205781', '#4F9DA6', '#8AD6C1'][i];
              return (
                <div key={i} className="flex flex-col items-center gap-4 p-8 rounded-[20px] bg-[#1A3A50] flex-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: bg }}>
                    {i + 1}
                  </div>
                  <h3 className="text-[20px] font-semibold text-white leading-[1.3] text-center">{step.title}</h3>
                  <p className="text-[14px] text-[#9C9B99] leading-[1.5] text-center">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────── */}
      <section id="about" className="bg-[#F0F7FA] py-20">
        <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center text-center">
            <SectionBadge>
              <HeartIcon size={16} />
              {sp.badge}
            </SectionBadge>
            <div className="text-3xl lg:text-[40px] font-bold leading-tight tracking-tight text-[#1A1918]">
              {sp.title[0]}<br />{sp.title[1]}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center">
            {sp.stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-10 py-6">
                <span className="text-[36px] font-extrabold tracking-[-1px]" style={{ color: s.valueColor }}>{s.value}</span>
                <span className="text-[14px] font-medium text-[#6D6C6A]">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="flex flex-col md:flex-row gap-6">
            {sp.testimonials.map((t) => (
              <div key={t.name} className="flex flex-col gap-4 p-7 rounded-[20px] bg-white border border-[#E5E4E1] flex-1">
                <p className="text-[15px] text-[#1A1918] leading-[1.6]">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-[#E0EFF5] flex items-center justify-center text-[#205781] font-bold text-sm flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1A1918]">{t.name}</p>
                    <p className="text-[13px] text-[#9C9B99]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section
        className="py-24 px-5 sm:px-10 lg:px-20"
        style={{ background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)' }}
      >
        <div className="mx-auto w-full max-w-screen-xl flex flex-col items-center gap-6 text-center">
          <RocketIcon className="text-white" size="4em" />

          <h2 className="text-[44px] font-extrabold text-white leading-[1.1] tracking-[-1.2px] max-w-[640px]">
            {cta.headline[0]}<br />{cta.headline[1]}
          </h2>

          <p className="text-[18px] text-white leading-[1.6] max-w-[500px]" style={{ opacity: 0.9 }}>
            {cta.sub[0]}<br />{cta.sub[1]}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <a href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-[56px] px-8 rounded-full bg-white text-[#1A1918] font-semibold text-[16px] hover:bg-[#F0F7FA] transition-colors">
              {cta.ctaPrimary}
            </a>
            <button className="inline-flex items-center justify-center h-[52px] px-7 rounded-full border-2 border-white text-white font-medium text-[16px] hover:bg-white/10 transition-colors">
              {cta.ctaSecondary}
            </button>
          </div>

          <p className="text-[13px] font-medium text-white" style={{ opacity: 0.7 }}>
            {cta.footnote}
          </p>
        </div>
      </section>
    </>
  );
}
