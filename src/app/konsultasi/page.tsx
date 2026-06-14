import React from 'react';
import { Metadata } from 'next';
import { KonsultasiHero } from '@/components/sections/konsultasi/KonsultasiHero';
import { BagaimanaKamiMembantu } from '@/components/sections/konsultasi/BagaimanaKamiMembantu';
import { LayananKonsultasi } from '@/components/sections/konsultasi/LayananKonsultasi';
import { KonsultasiFAQ } from '@/components/sections/konsultasi/KonsultasiFAQ';

export const metadata: Metadata = {
  title: 'Konsultasi Keuangan Pribadi',
  description:
    'Konsultasi 1-on-1 bersama Perencana Keuangan bersertifikat untuk memetakan kondisi keuanganmu dan menyusun strategi yang sesuai dengan tujuanmu.',
};

export default function KonsultasiPage() {
  return (
    <main>
      <KonsultasiHero />
      <BagaimanaKamiMembantu />
      <LayananKonsultasi />
      <KonsultasiFAQ />
    </main>
  );
}
