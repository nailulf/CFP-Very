import { RocketIcon } from 'lucide-react';
import React from 'react';

export const FinalCTA: React.FC = () => {
  return (
    <section
      className="py-24 px-5 sm:px-10 lg:px-20"
      style={{
        background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-screen-xl flex flex-col items-center gap-6 text-center">
        <RocketIcon className='text-white' size="4em"/>
        
        <h2 className="text-[44px] font-extrabold text-white leading-[1.1] tracking-[-1.2px] max-w-[640px]">
          Ready to finally<br />feel in control of your money?
        </h2>

        <p
          className="text-[18px] text-white leading-[1.6] max-w-[500px]"
          style={{ opacity: 0.9 }}
        >
          Let&apos;s build a system that keeps your finances organized.<br />
          First consultation is on the house.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button className="inline-flex items-center justify-center h-[56px] px-8 rounded-full bg-white text-[#1A1918] font-semibold text-[16px] hover:bg-[#F0F7FA] transition-colors">
            Book Free Discovery Call
          </button>
          <button className="inline-flex items-center justify-center h-[52px] px-7 rounded-full border-2 border-white text-white font-medium text-[16px] hover:bg-white/10 transition-colors">
            Browse Products
          </button>
        </div>

        <p className="text-[13px] font-medium text-white" style={{ opacity: 0.7 }}>
          No commitment · No pressure · Just good vibes ☕
        </p>
      </div>
    </section>
  );
};
