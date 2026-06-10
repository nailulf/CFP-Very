export type Lang = 'id' | 'en';

export const translations = {
  id: {
    navbar: {
      links: [
        { label: 'Layanan', href: '#services' },
        { label: 'Cara Kerja', href: '#how-it-works' },
         { label: 'Blog', href: '/blog' },
        { label: 'Testimoni', href: '#about' },
       
      ],
      cta: 'Hubungi Sekarang',
    },
    hero: {
      badge: 'Bestie keuanganmu udah di sini',
      headline: ['Berhenti khawatir.', 'Mulai kelola', 'keuanganmu.'],
      sub: 'Pelatihan keuangan pribadi, produk digital & sesi 1-on-1 yang beneran masuk akal — tanpa istilah ribet, biar kamu langsung paham.',
      ctaPrimary: 'Mulai Sekarang',
      ctaSecondary: 'Lihat Produk',
      trust: 'Dipercaya 500+ klien',
      rating: 'Rating 4.9/5',
      heroCaption: 'Perencana Keuangan Bersertifikat, Mantan Bankir Sentral',
    },
    services: {
      badge: 'Yang Bisa Saya Lakukan',
      title: ['Tiga cara ambil kendali', 'keuanganmu'],
      subtitle: 'Pilih yang pas. Gabungin. Atau sekalian ambil semua.',
      digital: {
        title: 'Produk Digital & Template',
        description: 'Alat siap pakai buat glow-up keuanganmu. Planner, tracker & panduan yang dibikin biar beneran kepake.',
        points: ['Planner Siap Pakai', 'Tracker Investasi', 'Unduhan Digital Instan'],
        toolsSuffix: 'template & alat',
        freeSuffix: 'unduhan gratis tersedia',
      },
      consultation: {
        title: ['Konsultasi', 'Keuangan Pribadi'],
        description:
          'Dapatkan konsultasi online personal yang mencakup arus kas, neraca keuangan, dana darurat, perencanaan pensiun & lebih banyak lagi — disesuaikan dengan kehidupan nyatamu. Ingin tahu posisimu? Cek kesehatan keuanganmu secara gratis hanya dengan satu klik.',
        points: [
          'Analisis Arus Kas & Anggaran',
          'Perencanaan Dana Pendidikan & Masa Depan',
          'Strategi Utang & Tinjauan Kekayaan Bersih',
          'Perencanaan Dana Darurat & Perlindungan',
          'Perencanaan Pensiun & Berbasis Tujuan',
        ],
      },
      group: {
        title: ['Sesi Kelompok', 'atau Korporat'],
        description:
          'Bawa kebiasaan finansial sehat ke tim Anda lewat sesi korporat yang dirancang khusus — dari seminar sekali jalan hingga program multi-sesi. Materi praktis yang benar-benar bisa langsung dipakai tim Anda, dibawakan oleh Certified Financial Planner.',
        points: [
          'Seminar Kesehatan Keuangan',
          'Program Edukasi Multi-Sesi',
          'Workshop Korporat yang Dirancang Khusus',
          'Pemeriksaan Keuangan Karyawan',
        ],
      },
    },
    howItWorks: {
      badge: 'Sangat Mudah',
      title: ['Cara kerjanya', '(spoiler: sangat mudah)'],
      steps: [
        {
          title: 'Jadwalkan Discovery Call',
          desc: 'Ceritakan situasi keuanganmu (santai, nggak bakal dihakimi kok)',
        },
        {
          title: 'Dapatkan rencana personal',
          desc: 'Saya akan membuat rencana yang sesuai dengan hidupmu, bukan template standar',
        },
        {
          title: 'Ambil kendali keuanganmu',
          desc: 'Jalankan dengan percaya diri. Saya bakal dukung kamu di tiap langkah!',
        },
      ],
    },
    socialProof: {
      badge: 'Orang Nyata, Hasil Nyata',
      title: ['Mereka bilang yang baik-baik', '(padahal mereka nggak saya suap, lho)'],
      stats: [
        { value: '+++', label: 'Klien Bahagia', valueColor: '#205781' },
        { value: 'Rp 5M+', label: 'Dana Tertata', valueColor: '#4F9DA6' },
        { value: '4.9⭐', label: 'Rating Rata-rata', valueColor: '#8AD6C1' },
      ],
      testimonials: [
        {
          quote:
            "Saya berubah dari 'Ke mana uang saya pergi?' menjadi punya sistem yang nyata. Aditya membuat keuangan terasa seperti obrolan dengan teman pintar.",
          name: 'Berlian K.',
          role: 'Ibu Bekerja',
          initials: 'BK',
        },
        {
          quote:
            'Sesi kelompoknya seru banget! Saya belajar lebih banyak dalam 2 jam daripada berbulan-bulan membaca blog keuangan. Plus, energi Aditya sangat menular.',
          name: 'Angel.',
          role: 'Legal Korporat',
          initials: 'AR',
        },
        {
          quote:
            'Planner digitalnya sudah balik modal di minggu pertama. Saya akhirnya punya sistem yang berhasil dan tidak membuat saya menangis. 10/10.',
          name: 'Bintang R.',
          role: 'Manajer Keuangan',
          initials: 'BR',
        },
      ],
    },
    finalCTA: {
      headline: ['Siap akhirnya', 'pegang kendali keuanganmu?'],
      sub: ['Yuk, bangun sistem yang bikin keuanganmu tetap rapi.', 'Jadwalkan Discovery Call untuk memulai.'],
      ctaPrimary: 'Jadwalkan Discovery Call',
      ctaSecondary: 'Lihat Produk',
      footnote: 'Tanpa komitmen · Tanpa tekanan · Santai saja ☕',
    },
    footer: {
      brand: 'Bikin urusan keuangan pribadi jadi menyenangkan, ramah, dan beneran berguna. Kami bantu satu per satu. 💛',
      columns: [
        {
          heading: 'Layanan',
          links: [
            { label: 'Konsultasi Keuangan', href: '/#services' },
            { label: 'Produk Digital', href: '/#services' },
            { label: 'Sesi Pelatihan Kelompok', href: '/#services' },
            { label: 'Financial Health Check', href: '/financial-health-check' },
          ],
        },
        {
          heading: 'Perusahaan',
          links: [
            { label: 'Tentang', href: '#about' },
            { label: 'Cara Kerja', href: '#how-it-works' },
            { label: 'Testimoni', href: '#about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Hubungi Kami', href: 'https://wa.me/6281806484635', external: true },
            { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
          ],
        },
      ],
      copyright: 'Hak cipta dilindungi.',
      tagline: 'Dibuat dengan 🧡 dan terlalu banyak kopi',
    },
  },

  en: {
    navbar: {
      links: [
        { label: 'Services', href: '#services' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '#about' },
      ],
      cta: 'Book a Call',
    },
    hero: {
      badge: 'Your money bestie is here',
      headline: ['Stop stressing.', 'Start managing', 'your money.'],
      sub: 'Personal finance training, digital products & 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.',
      ctaPrimary: "Let's Get Started",
      ctaSecondary: 'Browse Products',
      trust: 'Trusted by 500+ clients',
      rating: '4.9/5 rating',
      heroCaption: 'Certified Financial Planner, Ex-Central Banker',
    },
    services: {
      badge: 'What I Can Do For You',
      title: ['Three ways to take control', 'of your finances'],
      subtitle: 'Pick your vibe. Mix and match. Or go all in.',
      digital: {
        title: 'Digital Products & Templates',
        description: 'Grab-and-go tools for your financial glow-up. Planners, trackers & guides designed to be actually useful.',
        points: ['Ready-to-Use Planners', 'Investment Trackers', 'Instant Digital Download'],
        toolsSuffix: 'templates & tools',
        freeSuffix: 'free downloads available',
      },
      consultation: {
        title: ['Personal Finance', 'Consultation'],
        description:
          'Get personalized online consultations covering cash flow, balance sheets, emergency funds, retirement planning & more — tailored to your real life, not a textbook. Want to see where you stand? Check your financial health for free in just one click.',
        points: [
          'Cash Flow & Budget Analysis',
          'Education & Future Fund Planning',
          'Debt Strategy & Net Worth Review',
          'Emergency Fund & Protection Planning',
          'Retirement & Goal-Based Planning',
        ],
      },
      group: {
        title: ['Group or Corporate', 'Sessions'],
        description:
          'Bring financial wellness to your team with tailored corporate sessions — from one-off seminars to multi-session programs. Practical frameworks your people can actually use, delivered by a Certified Financial Planner.',
        points: [
          'Financial Wellness Seminars',
          'Multi-Session Education Programs',
          'Customized Corporate Workshops',
          'Employee Financial Check-Up',
        ],
      },
    },
    howItWorks: {
      badge: 'Super Simple',
      title: ['How it works', "(spoiler: it's easy)"],
      steps: [
        {
          title: 'Book a discovery call',
          desc: 'Tell me about your money situation (no judgment, I promise)',
        },
        {
          title: 'Get your custom game plan',
          desc: "I'll create a plan that fits YOUR life, not some cookie-cutter template",
        },
        {
          title: 'Take control of your money',
          desc: "Execute with confidence. I'll be right there cheering you on every step of the way!",
        },
      ],
    },
    socialProof: {
      badge: 'Real People, Real Results',
      title: ['They said nice things', "(I didn't even bribe them)"],
      stats: [
        { value: '+++', label: 'Happy Clients', valueColor: '#205781' },
        { value: 'Rp 5B+', label: 'Money Organized', valueColor: '#4F9DA6' },
        { value: '4.9⭐', label: 'Average Rating', valueColor: '#8AD6C1' },
      ],
      testimonials: [
        {
          quote: "I went from 'Where does my money go?' to actually having a system. Aditya makes finance feel like a conversation with a smart friend.",
          name: 'Berlian K.',
          role: 'Working Mom',
          initials: 'BK',
        },
        {
          quote: "The group session was SO fun! I learned more in 2 hours than months of reading finance blogs. Plus, Aditya's energy is contagious.",
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
      ],
    },
    finalCTA: {
      headline: ['Ready to finally', 'feel in control of your money?'],
      sub: ["Let's build a system that keeps your finances organized.", 'Book a discovery call to get started.'],
      ctaPrimary: 'Book a Discovery Call',
      ctaSecondary: 'Browse Products',
      footnote: 'No commitment · No pressure · Just good vibes ☕',
    },
    footer: {
      brand: 'Making personal finance management fun, friendly, and actually useful. One client at a time. 💛',
      columns: [
        {
          heading: 'Services',
          links: [
            { label: 'Finance Consulation', href: '/#services' },
            { label: 'Digital Products', href: '/#services' },
            { label: 'Group Training Sessions', href: '/#services' },
            { label: 'Financial Health Check', href: '/financial-health-check' },
          ],
        },
        {
          heading: 'Company',
          links: [
            { label: 'About', href: '#about' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Testimonials', href: '#about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contact', href: 'https://wa.me/6281806484635', external: true },
            { label: 'Privacy Policy', href: '/privacy-policy' },
          ],
        },
      ],
      copyright: 'All rights reserved.',
      tagline: 'Made with 🧡 and too much coffee',
    },
  },
};
