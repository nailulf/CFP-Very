'use client';

import React, { useState } from 'react';
import { Package, Download, FileSpreadsheet } from 'lucide-react';

interface DigitalProductsCardProps {
  iconBg?: string;
}

export const DigitalProductsCard: React.FC<DigitalProductsCardProps> = ({ iconBg = '#205781' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const setHoverOn = () => setIsHovered(true);
  const setHoverOff = () => setIsHovered(false);

  return (
    <div
      className="flex-1 relative z-0 flex flex-col gap-5 p-8 rounded-[20px] bg-[#1A1918] border border-[#E5E4E1] cursor-pointer"
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? '0 24px 48px rgba(0, 0, 0, 0.28)' : '0 0 0 rgba(0, 0, 0, 0)',
        transition: 'transform 300ms ease-out, box-shadow 300ms ease-out',
        zIndex: isHovered ? 20 : 0,
      }}
      onPointerEnter={setHoverOn}
      onPointerLeave={setHoverOff}
      onPointerDown={setHoverOn}
      onPointerUp={setHoverOff}
      onTouchStart={setHoverOn}
      onTouchEnd={setHoverOff}
      onTouchCancel={setHoverOff}
      onFocus={setHoverOn}
      onBlur={setHoverOff}
      tabIndex={0}
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
        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
          <div className="bg-white/10 p-3 rounded-lg text-[#8AD6C1] flex-shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm mb-1">THR Budget 2026 Template</p>
            <p className="text-xs text-[#9C9B99] mb-2">
              Plan your THR allocation with automated calculations for savings &amp; spending.
            </p>
            <a
              href="/downloads/THR-Budget-2026.xlsx"
              download
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8AD6C1] hover:underline"
            >
              <Download size={13} />
              Download Excel Template
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
