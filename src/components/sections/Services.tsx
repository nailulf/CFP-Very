'use client';

import React from 'react';
import { BadgeCheck, Sprout, Users } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DigitalProductsCard } from '@/components/sections/DigitalProductsCard';
import { ServiceInfoCard } from '@/components/sections/ServiceInfoCard';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const Services: React.FC = () => {
  const { lang } = useLang();
  const t = translations[lang].services;

  return (
    <section id="services" className="bg-[#F0F7FA] py-20">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20 flex flex-col gap-12">
        <SectionHeader
          badge={
            <span className="inline-flex items-center gap-2">
              <BadgeCheck size={16} />
              {t.badge}
            </span>
          }
          badgeVariant="light"
          title={
            <span className="text-[#1A1918]">
              {t.title[0]}<br />{t.title[1]}
            </span>
          }
          subtitle={t.subtitle}
        />

        <div className="flex flex-col md:flex-row gap-6">
          <DigitalProductsCard iconBg="#205781" />

          <ServiceInfoCard
            href="https://wa.me/6281806484635?text=Halo%2C+saya+tertarik+dengan+layanan+Personal+Finance+Consultation"
            iconBg="#4F9DA6"
            Icon={Sprout}
            title={<>{t.consultation.title[0]}<br />{t.consultation.title[1]}</>}
            description={t.consultation.description}
            points={t.consultation.points}
          />

          <ServiceInfoCard
            href="https://wa.me/6281806484635?text=Halo%2C+saya+tertarik+dengan+layanan+Group+or+Corporate+Sessions"
            iconBg="#8AD6C1"
            Icon={Users}
            title={<>{t.group.title[0]}<br />{t.group.title[1]}</>}
            description={t.group.description}
            points={t.group.points}
          />
        </div>
      </div>
    </section>
  );
};
