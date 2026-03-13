import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rocket } from 'lucide-react';
import { span } from 'framer-motion/client';

export const Hero: React.FC = () => {
  return (
    <section className="pt-[72px] bg-[#F0F7FA]">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Side */}
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
          

          {/* Image Side */}
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
  );
};
