import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Badge } from '@/components/ui/Badge';

interface SectionHeaderProps {
  badge?: React.ReactNode;
  badgeVariant?: 'light' | 'dark';
  title: React.ReactNode;
  titleClassName?: string;
  subtitle?: React.ReactNode;
  subtitleClassName?: string;
  align?: 'center' | 'left';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = 'light',
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  align = 'center',
}) => {
  return (
    <div className={twMerge('flex flex-col gap-3', align === 'center' ? 'items-center text-center' : 'items-start')}>
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      <div className={twMerge('text-3xl lg:text-[40px] font-bold leading-tight tracking-tight', titleClassName)}>
        {title}
      </div>
      {subtitle && (
        <p className={twMerge('text-[#6D6C6A] text-base', subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
