import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'outline-white' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[#205781] text-white hover:bg-[#1a4567] focus-visible:ring-[#205781]',
      outline: 'border-2 border-[#205781] text-[#205781] hover:bg-[#E0EFF5] focus-visible:ring-[#205781]',
      'outline-white': 'border-2 border-white text-white hover:bg-white/10 focus-visible:ring-white',
      ghost: 'text-[#205781] hover:bg-[#E0EFF5] focus-visible:ring-[#205781]',
    };

    const sizes = {
      sm: 'h-9 px-5 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          base,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
