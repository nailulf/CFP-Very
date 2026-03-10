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
                <span>Your money bestie is here</span>
              </Badge>

              <h1 className="text-[52px] sm:text-[56px] font-extrabold text-[#1A1918] leading-[1.1] tracking-[-1.5px]">
                Stop stressing.<br />
                Start managing<br />
                your money.
              </h1>

              <p className="text-[18px] text-[#6D6C6A] leading-[1.6] max-w-[480px]">
                Personal finance training, digital products &amp; 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="#services">
                  <Button size="lg">
                    Let&apos;s Get Started <Rocket className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#services">
                  <button className="inline-flex items-center justify-center px-6 h-14 rounded-full border-2 border-[#205781] text-[#205781] font-semibold text-base hover:bg-[#E0EFF5] transition-colors">
                    Browse Products
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <span className="text-[13px] font-medium text-[#9C9B99]">Trusted by 500+ clients</span>
                <span className="text-[14px] text-[#D4A64A]">⭐⭐⭐⭐⭐</span>
                <span className="text-[13px] font-medium text-[#9C9B99]">4.9/5 rating</span>
              </div>
            </div>

            {/* Image */}
            <div className="relative flex-shrink-0 w-full max-w-[480px]">
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
              Super Simple
            </SectionBadge>
            <div className="text-3xl lg:text-[40px] font-bold leading-tight tracking-tight text-white">
              How it works<br />(spoiler: it&apos;s easy)
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {[
              { n: '1', bg: '#205781', title: 'Book a free discovery call', desc: 'Tell me about your money situation (no judgment, I promise)' },
              { n: '2', bg: '#4F9DA6', title: 'Get your custom game plan', desc: "I'll create a plan that fits YOUR life, not some cookie-cutter template" },
              { n: '3', bg: '#8AD6C1', title: 'Take control of your money', desc: "Execute with confidence. I'll be right there cheering you on every step of the way!" },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center gap-4 p-8 rounded-[20px] bg-[#1A3A50] flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: step.bg }}>
                  {step.n}
                </div>
                <h3 className="text-[20px] font-semibold text-white leading-[1.3] text-center">{step.title}</h3>
                <p className="text-[14px] text-[#9C9B99] leading-[1.5] text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────── */}
      <section id="about" className="bg-[#F0F7FA] py-20">
        <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center text-center">
            <SectionBadge>
              <HeartIcon size={16} />
              Real People, Real Results
            </SectionBadge>
            <div className="text-3xl lg:text-[40px] font-bold leading-tight tracking-tight text-[#1A1918]">
              They said nice things<br />(I didn&apos;t even bribe them)
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center">
            {[
              { value: '+++', label: 'Happy Clients', color: '#205781' },
              { value: 'Rp 5B+', label: 'Money Organized', color: '#4F9DA6' },
              { value: '4.9⭐', label: 'Average Rating', color: '#8AD6C1' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-10 py-6">
                <span className="text-[36px] font-extrabold tracking-[-1px]" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[14px] font-medium text-[#6D6C6A]">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="flex flex-col md:flex-row gap-6">
            {[
              { quote: "I went from 'Where does my money go?' to actually having a system. Aditya makes finance feel like a conversation with a smart friend.", name: 'Berlian K.', role: 'Working Mom', initials: 'BK' },
              { quote: "The group session was SO fun! I learned more in 2 hours than months of reading finance blogs. Plus, Aditya's energy is contagious.", name: 'Angel.', role: 'Corporate Legal', initials: 'AR' },
              { quote: "The digital planner paid for itself in week one. I finally have a system that works and doesn't make me want to cry. 10/10.", name: 'Bintang R.', role: 'Finance Manager', initials: 'BR' },
            ].map((t) => (
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
            Ready to finally<br />feel in control of your money?
          </h2>

          <p className="text-[18px] text-white leading-[1.6] max-w-[500px]" style={{ opacity: 0.9 }}>
            Let&apos;s build a system that keeps your finances organized.<br />
            First consultation is on the house.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <a href="https://calendly.com/adityacleverina/30min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-[56px] px-8 rounded-full bg-white text-[#1A1918] font-semibold text-[16px] hover:bg-[#F0F7FA] transition-colors">
              Book Free Discovery Call
            </a>
            <button className="inline-flex items-center justify-center h-[52px] px-7 rounded-full border-2 border-white text-white font-medium text-[16px] hover:bg-white/10 transition-colors">
              Browse Products
            </button>
          </div>

          <p className="text-[13px] font-medium text-white" style={{ opacity: 0.7 }}>
            No commitment · No pressure · Just good vibes ☕
          </p>
        </div>
      </section>
    </>
  );
}
