import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeartIcon } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  valueColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, valueColor }) => (
  <div className="flex flex-col items-center gap-1 px-10 py-6">
    <span className="text-[36px] font-extrabold tracking-[-1px]" style={{ color: valueColor }}>
      {value}
    </span>
    <span className="text-[14px] font-medium text-[#6D6C6A]">{label}</span>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, initials }) => (
  <div className="flex flex-col gap-4 p-7 rounded-[20px] bg-white border border-[#E5E4E1] flex-1">
    <p className="text-[15px] text-[#1A1918] leading-[1.6]">&ldquo;{quote}&rdquo;</p>
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-9 h-9 rounded-full bg-[#E0EFF5] flex items-center justify-center text-[#205781] font-bold text-sm flex-shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[#1A1918]">{name}</p>
        <p className="text-[13px] text-[#9C9B99]">{role}</p>
      </div>
    </div>
  </div>
);

const stats: StatCardProps[] = [
  { value: '+++', label: 'Happy Clients', valueColor: '#205781' },
  { value: 'Rp 5B+', label: 'Money Organized', valueColor: '#4F9DA6' },
  { value: '4.9⭐', label: 'Average Rating', valueColor: '#8AD6C1' },
];

const testimonials: TestimonialCardProps[] = [
  {
    quote: "I went from 'Where does my money go?' to actually having a system. Aditya makes finance feel like a conversation with a smart friend.",
    name: 'Berlian K.',
    role: 'Working Mom',
    initials: 'BK',
  },
  {
    quote: 'The group session was SO fun! I learned more in 2 hours than months of reading finance blogs. Plus, Aditya\'s energy is contagious.',
    name: 'Angel.',
    role: 'Corporate Legal',
    initials: 'AR',
  },
  {
    quote: "The digital planner paid for itself in week one. I finally have a system that works and doesn't make me want to cry. 10/10.",
    name: 'Bintang R.',
    role: 'Finance Manager',
    initials: 'BR',
  },
];

export const SocialProof: React.FC = () => {
  return (
    <section id="about" className="bg-[#F0F7FA] py-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
        <SectionHeader
          badge={<span className="inline-flex items-center gap-2">
            <HeartIcon size={16} />
            Real People, Real Results
          </span>}
          badgeVariant="light"
          title={
            <span className="text-[#1A1918]">
              They said nice things<br />(I didn&apos;t even bribe them)
            </span>
          }
        />

        {/* Stats */}
        <div className="flex flex-wrap justify-center">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Testimonials */}
        <div className="flex flex-col md:flex-row gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
};
