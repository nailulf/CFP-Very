import React from 'react';
import { BadgeCheck, Sprout, Users } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DigitalProductsCard } from '@/components/sections/DigitalProductsCard';
import { ServiceInfoCard } from '@/components/sections/ServiceInfoCard';

export const Services: React.FC = () => {
  return (
    <section id="services" className="bg-[#F0F7FA] py-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
        <SectionHeader
          badge={
            <span className="inline-flex items-center gap-2">
              <BadgeCheck size={16} />
              What I Can Do For You
            </span>
          }
          badgeVariant="light"
          title={
            <span className="text-[#1A1918]">
              Three ways to take control<br />of your finances
            </span>
          }
          subtitle="Pick your vibe. Mix and match. Or go all in."
        />

        <div className="flex flex-col md:flex-row gap-6">
          <DigitalProductsCard iconBg="#205781" />
          
          <ServiceInfoCard
            iconBg="#4F9DA6"
            Icon={Sprout}
            title={
              <>
                Personal Finance<br />Training
              </>
            }
            description="Learn to budget, save & manage your money like a pro — with frameworks that actually stick. No spreadsheet nightmares, promise."
            points={['Budgeting & Saving Frameworks', 'Financial Habit Building', 'Money Mindset Reset']}
          />

          <ServiceInfoCard
            iconBg="#8AD6C1"
            Icon={Users}
            title={
              <>
                Individual or<br />Group Sessions
              </>
            }
            description="Real talk, real plans. Whether solo or with your squad — we&apos;ll map out your financial habits together."
            points={['1-on-1 Private Sessions', 'Fun Group Workshops', 'Custom Game Plan']}
          />
        </div>
      </div>
    </section>
  );
};
