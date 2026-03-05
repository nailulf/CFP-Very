import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface ServiceCardProps {
  iconBg: string;
  iconEmoji: string;
  title: string;
  description: string;
  points: string[];
  dark?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ iconBg, iconEmoji, title, description, points, dark = false }) => {
  return (
    <div
      className={`flex flex-col gap-5 p-8 rounded-[20px] flex-1 ${
        dark
          ? 'bg-[#1A1918]'
          : 'bg-white border border-[#E5E4E1]'
      }`}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {iconEmoji}
      </div>
      <h3
        className={`text-[22px] font-bold leading-[1.2] tracking-[-0.3px] ${dark ? 'text-white' : 'text-[#1A1918]'}`}
      >
        {title}
      </h3>
      <p className={`text-[15px] leading-[1.6] ${dark ? 'text-[#B8B9B6]' : 'text-[#6D6C6A]'}`}>
        {description}
      </p>
      <ul className="flex flex-col gap-2 mt-auto">
        {points.map((point) => (
          <li key={point} className={`flex items-center gap-2 text-[14px] ${dark ? 'text-[#B8B9B6]' : 'text-[#6D6C6A]'}`}>
            <span className="text-[#8AD6C1] font-bold">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

const services: ServiceCardProps[] = [
  {
    iconBg: '#4F9DA6',
    iconEmoji: '📊',
    title: 'Personal Finance\nTraining',
    description: 'Learn to budget, save & manage your money like a pro — with frameworks that actually stick. No spreadsheet nightmares, promise.',
    points: ['Budgeting & Saving Frameworks', 'Financial Habit Building', 'Money Mindset Reset'],
  },
  {
    iconBg: '#205781',
    iconEmoji: '📦',
    title: 'Digital Products\n& Templates',
    description: 'Grab-and-go tools for your financial glow-up. Planners, trackers & guides designed to be actually useful.',
    points: ['Ready-to-Use Planners', 'Investment Trackers', 'Instant Digital Download'],
    dark: true,
  },
  {
    iconBg: '#8AD6C1',
    iconEmoji: '👥',
    title: 'Individual or\nGroup Sessions',
    description: 'Real talk, real plans. Whether solo or with your squad — we\'ll map out your financial habits together.',
    points: ['1-on-1 Private Sessions', 'Fun Group Workshops', 'Custom Game Plan'],
  },
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="bg-[#F0F7FA] py-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
        <SectionHeader
          badge="💰 What I Can Do For You"
          title={
            <span className="text-[#1A1918]">
              Three ways to take control<br />of your finances
            </span>
          }
          subtitle="Pick your vibe. Mix and match. Or go all in."
        />

        <div className="flex flex-col md:flex-row gap-6">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};
