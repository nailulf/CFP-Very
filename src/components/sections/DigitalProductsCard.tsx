'use client';

import React, { useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { DigitalProductsModal } from '@/components/sections/DigitalProductsModal';
import { digitalProducts } from '@/data/digitalProducts';

interface DigitalProductsCardProps {
  iconBg?: string;
}

export const DigitalProductsCard: React.FC<DigitalProductsCardProps> = ({ iconBg = '#205781' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setHoverOn = () => setIsHovered(true);
  const setHoverOff = () => setIsHovered(false);

  const freeCount = digitalProducts.filter((p) => p.isFree).length;

  return (
    <>
      <div
        className="flex-1 relative z-0 flex flex-col gap-5 p-8 rounded-[20px] bg-[#1A1918] border border-[#E5E4E1] cursor-pointer"
        style={{
          transform: isHovered ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
          boxShadow: isHovered ? '0 24px 48px rgba(0, 0, 0, 0.28)' : '0 0 0 rgba(0, 0, 0, 0)',
          transition: 'transform 300ms ease-out, box-shadow 300ms ease-out',
          zIndex: isHovered ? 20 : 0,
        }}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(true); }}
        onPointerEnter={setHoverOn}
        onPointerLeave={setHoverOff}
        onTouchStart={setHoverOn}
        onTouchEnd={setHoverOff}
        onTouchCancel={setHoverOff}
        onFocus={setHoverOn}
        onBlur={setHoverOff}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
          <Package className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-[22px] font-bold leading-[1.2] tracking-[-0.3px] text-white">
          Digital Products<br />&amp; Templates
        </h3>
        <p className="text-[15px] leading-[1.6] text-[#B8B9B6]">
          Grab-and-go tools for your financial glow-up. Planners, trackers &amp; guides designed to be actually useful.
        </p>
        <ul className="flex flex-col gap-2">
          {['Ready-to-Use Planners', 'Investment Trackers', 'Instant Digital Download'].map((point) => (
            <li key={point} className="flex items-center gap-2 text-[14px] text-[#B8B9B6]">
              <span className="text-[#8AD6C1] font-bold">✓</span>
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{digitalProducts.length} templates &amp; tools</p>
              <p className="text-xs text-[#9C9B99] mt-0.5">{freeCount} free downloads available</p>
            </div>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#8AD6C1]/10 text-[#8AD6C1]"
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 300ms ease-out',
              }}
            >
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <DigitalProductsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
