import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Lightbulb } from 'lucide-react';

interface StepCardProps {
  number: string;
  numberBg: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, numberBg, title, description }) => {
  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-[20px] bg-[#1A3A50] flex-1">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{ backgroundColor: numberBg }}
      >
        {number}
      </div>
      <h3 className="text-[20px] font-semibold text-white leading-[1.3] text-center">
        {title}
      </h3>
      <p className="text-[14px] text-[#9C9B99] leading-[1.5] text-center">
        {description}
      </p>
    </div>
  );
};

const steps: StepCardProps[] = [
  {
    number: '1',
    numberBg: '#205781',
    title: 'Book a\ndiscovery call',
    description: 'Tell me about your money situation (no judgment, I promise)',
  },
  {
    number: '2',
    numberBg: '#4F9DA6',
    title: 'Get your custom\ngame plan',
    description: "I'll create a plan that fits YOUR life, not some cookie-cutter template",
  },
  {
    number: '3',
    numberBg: '#8AD6C1',
    title: 'Take control of\nyour money',
    description: "Execute with confidence. I'll be right there cheering you on every step of the way!",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-[#153A56] py-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
        <SectionHeader
          badge={
            <span className="inline-flex items-center gap-2">
              <Lightbulb size={16} />
              Super Simple
            </span>
          }
          badgeVariant="dark"
          title={
            <span className="text-white">
              How it works<br />(spoiler: it&apos;s easy)
            </span>
          }
        />

        <div className="flex flex-col md:flex-row gap-8">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};
