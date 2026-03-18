export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  category: 'Planner' | 'Tracker' | 'Calculator' | 'Guide' | 'Template';
  fileType: 'Excel' | 'PDF' | 'Google Sheets';
  downloadUrl: string;
  isFree: boolean;
  price?: string;
  originalPrice?: string;
}

export const digitalProducts: DigitalProduct[] = [
  {
    id: 'thr-budget-2026',
    title: 'THR Budget 2026 Template',
    description: 'Plan your THR allocation with automated calculations for savings & spending.',
    category: 'Template',
    fileType: 'Excel',
    downloadUrl: '/downloads/THR-Budget-2026.xlsx',
    isFree: true,
  },
  {
    id: 'simulasi-KPR',
    title: 'Simulasi KPR',
    description: 'Mau beli rumah tapi bingung cicilan per bulannya berapa? Template ini bantu kamu simulasi KPR secara otomatis. Tinggal masukkan harga rumah, DP, tenor, dan suku bunga — langsung keluar hitungan cicilan bulanan, total bunga, dan total pembayaran. Bisa bandingkan sampai 3 skenario sekaligus! Lengkap dengan perbandingan properti, budget tracker biaya notaris & pajak, jadwal cicilan 12 bulan pertama, estimasi biaya pindahan, plus tips dan checklist dokumen KPR.',
    category: 'Planner',
    fileType: 'Excel',
    downloadUrl: 'https://clicky.id/en/redirect/promo-page?product=69b3b0c38629f04f6b098165',
    isFree: false,
    price: 'IDR 25000',
    originalPrice: 'IDR 100000',
  },
  {
    id: 'dana-pensiun',
    title: 'Dana Pensiun',
    description: 'Template lengkap buat orang tua yang ingin merencanakan biaya pensiun anak secara terstruktur. Dashboard otomatis menampilkan total estimasi vs pengeluaran aktual. Ada fitur School Comparison yang otomatis cek sekolah mana yang sesuai budget. Payment Tracker dengan status warna otomatis, plus simulasi menabung per bulan. Cocok untuk persiapan dana pensiun dari SD, SMP, SMA hingga Universitas.',
    category: 'Planner',
    fileType: 'Excel',
    downloadUrl: 'https://clicky.id/en/redirect/promo-page?product=69b3b8568629f04f6b09ac39',
    isFree: false,
    price: 'IDR 25000',
    originalPrice: 'IDR 100000',
  },
  {
    id: 'dana-pendidikan',
    title: 'Dana Pendidikan',
    description: 'Template lengkap buat orang tua yang ingin merencanakan biaya sekolah anak secara terstruktur. Dashboard otomatis menampilkan total estimasi vs pengeluaran aktual. Ada fitur School Comparison yang otomatis cek sekolah mana yang sesuai budget. Payment Tracker dengan status warna otomatis, plus simulasi menabung per bulan. Cocok untuk persiapan dana pendidikan dari SD, SMP, SMA hingga Universitas.',
    category: 'Planner',
    fileType: 'Excel',
    downloadUrl: 'https://clicky.id/en/redirect/promo-page?product=69b3b9498629f04f6b09b1d1',
    isFree: false,
    price: 'IDR 25000',
    originalPrice: 'IDR 100000',
  },
  {
    id: 'budget-pernikahan',
    title: 'Simulasi Budget Pernikahan',
    description: 'Simulasi budget pernikahan dengan berbagai opsi pengeluaran dan pemasukan.',
    category: 'Planner',
    fileType: 'Excel',
    downloadUrl: 'https://clicky.id/en/redirect/promo-page?product=69b3ba558629f04f6b09bbb7',
    isFree: false,
    price: 'IDR 19000',
    originalPrice: 'IDR 75000',
  },
];
