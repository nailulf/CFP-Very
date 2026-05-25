import { Metadata } from 'next';
import HealthCheckForm from './HealthCheckForm';

export const metadata: Metadata = {
  title: 'Cek Kesehatan Keuangan Gratis | TemanTumbuh',
  description:
    'Ukur kesehatan keuanganmu secara instan dengan menjawab 7 bagian pertanyaan singkat. Gratis, anonim, tanpa daftar.',
};

export default function HealthCheckPage() {
  return <HealthCheckForm />;
}
