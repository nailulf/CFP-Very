'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface Cta {
  label: string;
  href: string;
  external?: boolean;
}

interface ServiceInfoCardProps {
  iconBg: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description: string;
  points: string[];
  cta?: Cta;
  /** When set, clicking anywhere on the card (outside the CTA) navigates here. */
  cardHref?: string;
}

export const ServiceInfoCard: React.FC<ServiceInfoCardProps> = ({ iconBg, Icon, title, description, points, cta, cardHref }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardClass = `flex-1 relative flex flex-col gap-5 p-8 rounded-[20px] bg-white border border-[#E5E4E1]${cardHref ? ' cursor-pointer' : ''}`;
  const cardNav = cardHref
    ? {
        role: 'link' as const,
        tabIndex: 0,
        onClick: () => router.push(cardHref),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(cardHref);
          }
        },
      }
    : {};
  const cardStyle: React.CSSProperties = {
    transform: isHovered ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
    boxShadow: isHovered ? '0 24px 48px rgba(0, 0, 0, 0.28)' : '0 0 0 rgba(0, 0, 0, 0)',
    transition: 'transform 300ms ease-out, box-shadow 300ms ease-out',
    zIndex: isHovered ? 20 : 0,
  };

  const hoverProps = {
    onPointerEnter: () => setIsHovered(true),
    onPointerLeave: () => setIsHovered(false),
    onTouchStart: () => setIsHovered(true),
    onTouchEnd: () => setIsHovered(false),
    onTouchCancel: () => setIsHovered(false),
    onFocus: () => setIsHovered(true),
    onBlur: () => setIsHovered(false),
  };

  const DESCRIPTION_MAX_CHARS = 150;
  const isLongDescription = description.length > DESCRIPTION_MAX_CHARS;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const shouldTruncateDescription = isLongDescription && !isDescriptionExpanded;
  const shownDescription = shouldTruncateDescription ? `${description.slice(0, DESCRIPTION_MAX_CHARS)}…` : description;

  return (
    <div className={cardClass} style={cardStyle} {...hoverProps} {...cardNav}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="flex-1 min-w-0 text-[22px] font-bold leading-[1.2] tracking-[-0.3px] text-[#1A1918]">
          {title}
        </h3>
      </div>
      <p className="text-[15px] leading-[1.6] text-[#6D6C6A]">
        {shownDescription}
        {isLongDescription && (
          <>
            {' '}
            <button
              type="button"
              className="text-[13px] font-semibold text-[#205781] hover:underline"
              onClick={(e) => { e.stopPropagation(); setIsDescriptionExpanded((v) => !v); }}
            >
              {isDescriptionExpanded ? 'Read less' : 'Read more'}
            </button>
          </>
        )}
      </p>
      <ul className={`flex flex-col gap-2 ${!cta ? 'mt-auto' : ''}`}>
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-[14px] text-[#6D6C6A]">
            <span className="text-[#8AD6C1] font-bold">✓</span>
            {point}
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-auto pt-4 border-t border-[#E5E4E1]">
          <a
            href={cta.href}
            target={cta.external ? '_blank' : '_self'}
            rel={cta.external ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[14px] font-semibold text-[#205781]">{cta.label}</p>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#205781]/10 text-[#205781]"
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 300ms ease-out',
              }}
            >
              <ArrowRight size={16} />
            </div>
          </a>
        </div>
      )}
    </div>
  );
};
