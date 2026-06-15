import React from 'react';
import { Metadata } from 'next';
import { KorporatHero } from '@/components/sections/korporat/KorporatHero';
import { MengapaFinancialWellness } from '@/components/sections/korporat/MengapaFinancialWellness';
import { TopikProgram } from '@/components/sections/korporat/TopikProgram';
import { TopikLainnya } from '@/components/sections/korporat/TopikLainnya';
import { KorporatFAQ } from '@/components/sections/korporat/KorporatFAQ';
import { KorporatFinalCTA } from '@/components/sections/korporat/KorporatFinalCTA';

export const metadata: Metadata = {
  title: 'Corporate Training & Employee Financial Wellness',
  description:
    'Program in-house training keuangan untuk karyawan — dibawakan oleh Perencana Keuangan bersertifikasi CFP®, dengan materi yang ringan, relevan, dan bisa langsung dipraktikkan.',
};

export default function KorporatPage() {
  return (
    <main>
      <KorporatHero />
      <MengapaFinancialWellness />
      <TopikProgram />
      <TopikLainnya />
      <KorporatFAQ />
      <KorporatFinalCTA />
    </main>
  );
}
