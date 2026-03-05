import React from 'react';
import { Metadata } from 'next';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: "Layanan | Aditya Very Cleverina",
  description: "Jelajahi layanan perencanaan keuangan kami termasuk konsultasi, template pelacak, dan perencanaan komprehensif.",
};

const servicesList = [
  {
    id: 'consultation',
    title: 'Konsultasi Keuangan',
    price: 'Rp 1.5 Juta',
    period: 'per sesi',
    description: 'Dapatkan saran ahli untuk situasi keuangan spesifik Anda. Sempurna bagi yang memiliki pertanyaan mendesak atau butuh pendapat kedua tentang strategi Anda.',
    features: [
      'Panggilan video 60 menit',
      'Analisis Portfolio',
      'Penilaian Risiko',
      'Langkah-langkah praktis',
      'Rekaman sesi',
    ],
    cta: 'Jadwalkan Konsultasi',
  },
  {
    id: 'templates',
    title: 'Mentoring & Edukasi',
    price: 'Rp 299rb',
    period: 'per modul',
    description: 'Kendalikan keuangan Anda dengan spreadsheet yang mudah digunakan. Lacak pendapatan, pengeluaran, investasi, dan kekayaan bersih di satu tempat.',
    features: [
      'Akses seumur hidup',
      'Kompatibel dengan Google Sheets & Excel',
      'Video panduan instruksional',
      'Perhitungan otomatis',
      'Dashboard visual',
    ],
    cta: 'Lihat Modul',
  },
  {
    id: 'planning',
    title: 'Perencanaan Komprehensif',
    price: 'Custom',
    period: 'sesuai kebutuhan',
    description: 'Pendekatan holistik untuk kehidupan finansial Anda. Kami membangun peta jalan untuk masa pensiun, optimasi pajak, perencanaan warisan, dan lainnya.',
    features: [
      'Audit keuangan lengkap',
      'Peta jalan masa pensiun',
      'Strategi optimasi pajak',
      'Dasar-dasar perencanaan warisan',
      'Check-in triwulanan',
    ],
    cta: 'Minta Penawaran',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-20">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#2C3E50] mb-6">Layanan Kami</h1>
          <p className="text-xl text-gray-600">
            Baik Anda butuh pemeriksaan cepat atau perombakan finansial total, kami punya solusi yang tepat untuk Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map((service) => (
            <div 
              key={service.id} 
              id={service.id}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col"
            >
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">{service.title}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#3498DB]">{service.price}</span>
                <span className="text-gray-500 text-sm">{service.period}</span>
              </div>
              
              <p className="text-gray-600 mb-8 flex-grow">{service.description}</p>
              
              <ul className="space-y-4 mb-8">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button fullWidth size="lg">
                {service.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Booking Section */}
        <div className="mt-24 bg-gray-50 rounded-3xl p-8 lg:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-[#3498DB] shadow-md mb-6">
            <Calendar size={32} />
          </div>
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">Siap untuk memulai?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Jadwalkan panggilan penemuan gratis selama 15 menit untuk melihat layanan mana yang tepat untuk Anda. Tanpa komitmen.
          </p>
          <Button size="lg" className="bg-[#B6E33D] text-[#2C3E50] hover:bg-[#a3cc35]">
            Jadwalkan Panggilan Gratis <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Container>
    </div>
  );
}
