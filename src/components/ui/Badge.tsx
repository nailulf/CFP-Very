import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'light' }) => {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold',
        variant === 'light'
          ? 'bg-[#8AD6C1] text-[#1A1918]'
          : 'bg-[#1A3A50] text-[#8AD6C1]',
        className
      )}
    >
      {children}
    </span>
  );
};
