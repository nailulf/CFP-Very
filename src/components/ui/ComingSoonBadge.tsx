import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ComingSoonBadgeProps {
  className?: string;
}

export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({ className }) => {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF6B2] text-[#9F580A] uppercase tracking-wide',
        className
      )}
    >
      Coming Soon
    </span>
  );
};
