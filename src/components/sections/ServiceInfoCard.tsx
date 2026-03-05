import React from 'react';
import { ComingSoonBadge } from '@/components/ui/ComingSoonBadge';

interface ServiceInfoCardProps {
  iconBg: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description: string;
  points: string[];
}

export const ServiceInfoCard: React.FC<ServiceInfoCardProps> = ({ iconBg, Icon, title, description, points }) => {
  return (
    <div className="flex-1 relative flex flex-col gap-5 p-8 rounded-[20px] bg-white border border-[#E5E4E1] cursor-pointer transform-gpu transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:scale-105">
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <ComingSoonBadge />
      </div>
      <h3 className="text-[22px] font-bold leading-[1.2] tracking-[-0.3px] text-[#1A1918]">
        {title}
      </h3>
      <p className="text-[15px] leading-[1.6] text-[#6D6C6A]">{description}</p>
      <ul className="flex flex-col gap-2 mt-auto">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-[14px] text-[#6D6C6A]">
            <span className="text-[#8AD6C1] font-bold">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};
