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
        cta: 'Financial Health Check',
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
    konsultasi: {
      meta: {
        title: 'Konsultasi Keuangan Pribadi',
        description:
          'Konsultasi 1-on-1 bersama Perencana Keuangan bersertifikat untuk memetakan kondisi keuanganmu dan menyusun strategi yang sesuai dengan tujuanmu.',
      },
      hero: {
        eyebrow: 'KONSULTASI 1-ON-1',
        title: 'Konsultasi Keuangan Pribadi',
        subtitle:
          'Kami mulai dengan memetakan kondisi keuanganmu dan mengukur rasio kesehatan keuanganmu, lalu menyusun strategi yang sesuai dengan tujuan dan keadaanmu.',
        cta: 'Jadwalkan Sesi Konsultasi',
        badges: [
          { title: 'Data rahasia & terlindungi', desc: 'Datamu aman, privasimu terjaga' },
          { title: 'Wujudkan tujuan keuangan', desc: 'Tujuan keuanganmu, satu per satu tercapai' },
          { title: 'Resolusi keuangan tercapai', desc: 'Resolusi keuangan bukan cuma wacana' },
          { title: 'Kondisi keuangan membaik', desc: 'Keuangan yang makin sehat, hati yang makin tenang' },
        ],
      },
      help: {
        eyebrow: 'CARA KAMI MEMBANTU',
        title: 'Bagaimana Kami Mendampingi Kamu',
        subtitle:
          'Kami mulai dengan memetakan kondisi keuanganmu dan mengukur rasio kesehatan keuanganmu. Dari pemahaman itulah kami menyusun strategi yang sesuai dengan tujuan dan keadaan keuanganmu.',
        items: [
          { title: 'Financial Check Up', desc: 'Evaluasi keuangan menyeluruh bersama Perencana Keuangan bersertifikat untuk memahami kondisimu saat ini, mengenali yang perlu dibenahi, dan menentukan langkah awal yang tepat.' },
          { title: 'Menentukan Tujuan Keuangan', desc: 'Kami membantu menata prioritas dan menetapkan tenggat yang realistis untuk setiap tujuan, sehingga langkahmu punya arah yang jelas dan terukur.' },
          { title: 'Menyusun Strategi Capai Tujuan', desc: 'Kami merancang strategi alokasi investasi, proteksi aset, dan manajemen risiko yang disesuaikan dengan kemampuan dan profilmu, bukan pendekatan seragam.' },
          { title: 'Action Plan', desc: 'Kamu menerima laporan lengkap berupa PDF berisi hasil evaluasi, strategi investasi, rencana proteksi aset, dan catatan perbaikan yang bisa langsung diterapkan.' },
        ],
      },
      services: {
        eyebrow: 'LAYANAN KONSULTASI',
        title: 'Lebih dari Sekadar Mengatur Cashflow',
        subtitle:
          'Konsultasi perencanaan keuangan bersama kami memberikan pendampingan menyeluruh untuk mendekatkanmu pada setiap tujuan keuangan, lewat langkah yang terukur dan berkelanjutan.',
        items: [
          { title: 'Konsultasi Pinjaman Kredit Bank & Lembaga', desc: 'Kami menelaah opsi kredit seperti KPR, KKB, dan pinjaman jangka panjang lain, supaya kamu memilih dengan matang, mendapat opsi paling efisien, dan terhindar dari biaya tersembunyi.' },
          { title: 'Dana Pensiun', desc: 'Persiapan dana pensiun sekaligus strategi menuju kebebasan finansial. Cocok untukmu yang ingin keleluasaan pensiun lebih awal dengan rasa aman.' },
          { title: 'Dana Pendidikan', desc: 'Perencanaan kebutuhan pendidikan anak dengan skema proteksi aset dan strategi investasi optimal, agar masa depan pendidikan mereka lebih terjamin.' },
        ],
        cta: 'Jadwalkan Sesi Konsultasimu',
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Pertanyaan yang Sering Ditanyakan',
        items: [
          { q: 'Apa itu perencanaan keuangan?', a: 'Perencanaan keuangan adalah proses menata pengelolaan keuangan secara tepat dan terarah untuk mencapai tujuan hidupmu atau keluargamu. Prosesnya mencakup penyusunan dan penerapan rencana keuangan yang dibuat khusus, karena kondisi dan tujuan setiap orang berbeda.' },
          { q: 'Berapa biaya konsultasi keuangan?', a: 'Biaya disesuaikan dengan tahap hidup dan kompleksitas situasi keuanganmu. Paket Starter Rp500.000 (fresh graduate/single, 1 sesi 90 menit). Paket Family Rp1.000.000 (pasangan/keluarga muda, proses 2–3 minggu). Paket Comprehensive Rp2.000.000 (mapan/kompleks, proses ±1 bulan).' },
          { q: 'Berapa banyak sesi konsultasi yang dijalani?', a: 'Ada 2 sesi: initial meeting dan recommendation meeting.' },
          { q: 'Bagaimana timeline konsultasinya?', a: 'Minggu 1 — Initial Meeting. Minggu 2 — Penyampaian Data Keuangan. Minggu 3 — Recommendation Meeting.' },
          { q: 'Apakah konsultasi bisa bersama pasangan?', a: 'Bisa, sendiri maupun bersama pasangan, selama sesuai durasi dan layanan yang dipilih.' },
          { q: 'Bagaimana cara membeli jasa konsultasi secara online?', a: 'Daftar lewat halaman ini, pilih jadwal yang tersedia, isi datamu, pilih metode pembayaran, lalu kamu akan menerima email konfirmasi jadwal initial meeting. Usahakan hadir 5 menit sebelum sesi.' },
          { q: 'Kapan saja jadwal konsultasi tersedia?', a: 'Setiap hari, Senin–Minggu, pukul 09.00–20.00 WIB.' },
          { q: 'Apakah pembayaran bisa dicicil?', a: 'Untuk saat ini pembayaran belum bisa dicicil dan dilakukan penuh di awal.' },
          { q: 'Apakah bisa refund?', a: 'Refund bisa diajukan paling lambat H-2 sebelum jadwal, dengan pengembalian maksimal 50%. Jika konsultasi sudah berlangsung, refund tidak dapat dilakukan.' },
          { q: 'Bagaimana kerahasiaan data dan informasiku?', a: 'Perencana Keuangan (CFP®) kami terikat etika profesi dan prinsip kerahasiaan. Semua informasi yang kamu bagikan kami jaga dan hanya digunakan untuk kepentingan konsultasi.' },
        ],
      },
      booking: {
        steps: { schedule: 'Pilih Jadwal', details: 'Data Diri', confirm: 'Konfirmasi' },
        closed: {
          title: 'Booking sementara ditutup',
          body: 'Pendaftaran konsultasi sedang kami tutup sementara. Hubungi kami via WhatsApp untuk jadwal berikutnya.',
          cta: 'Hubungi via WhatsApp',
        },
        timeline: {
          title: 'Alur Konsultasi Bersama Kami',
          subtitle:
            'Biar kamu tahu apa yang akan kita jalani bareng — dari awal sampai kamu menerima rekomendasi. Santai, terarah, satu langkah dalam satu waktu.',
          items: [
            { week: 'Minggu 1', title: 'Initial Meeting (60 menit)', desc: 'Kita mulai dengan ngobrol soal gambaran kondisi keuanganmu, tujuan yang ingin dicapai, dan area yang bisa dioptimalkan.' },
            { week: 'Minggu 2', title: 'Penyampaian Data Keuangan', desc: 'Kamu melengkapi data keuangan yang dibutuhkan (via email), sebagai bahan analisis kami secara menyeluruh.' },
            { week: 'Minggu 3', title: 'Recommendation Meeting', desc: 'Setelah analisis selesai, kita bertemu lagi membahas rekomendasi yang kami susun khusus untukmu.' },
          ],
          note: 'Setiap tahap dirancang agar kamu punya cukup waktu memahami setiap langkah, tanpa terburu-buru.',
        },
        schedule: { dateLabel: 'Pilih Tanggal', timeLabel: 'Pilih Jam (WIB)', empty: 'Tidak ada jadwal tersedia.' },
        details: {
          nameLabel: 'Nama Lengkap',
          emailLabel: 'Email',
          phoneLabel: 'No. WhatsApp',
          topicLabel: 'Apa yang ingin kamu konsultasikan?',
          topicHint: 'Ceritakan singkat masalah atau tujuan keuangan yang ingin dibahas.',
        },
        confirm: {
          title: 'Tinjau Pesananmu',
          summaryDate: 'Tanggal',
          summaryTime: 'Jam',
          summaryName: 'Nama',
          summaryTopic: 'Topik',
          submit: 'Konfirmasi & Lihat Pembayaran',
        },
        success: {
          title: 'Booking diterima!',
          body: 'Booking-mu sudah kami catat. Selesaikan pembayaran dalam 24 jam, lalu kirim bukti transfer agar kami kirimkan link Google Meet ke emailmu.',
          refId: 'Nomor Referensi',
          payTitle: 'Instruksi Pembayaran',
          bankTransfer: 'Transfer Bank',
          qris: 'QRIS',
          copy: 'Salin',
          copied: 'Tersalin',
          window: 'Bayar dalam 24 jam. Jika belum dibayar, booking otomatis batal.',
          refund: 'Refund maksimal 50% bisa diajukan paling lambat H-2 sebelum jadwal.',
          whatsapp: 'Kendala pembayaran? Hubungi via WhatsApp',
        },
        next: 'Lanjut',
        back: 'Kembali',
      },
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
        cta: 'Financial Health Check',
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
    konsultasi: {
      meta: {
        title: 'Personal Financial Consultation',
        description:
          '1-on-1 consultation with a certified Financial Planner to map out your finances and build a strategy aligned with your goals.',
      },
      hero: {
        eyebrow: '1-ON-1 CONSULTATION',
        title: 'Personal Financial Consultation',
        subtitle:
          'We start by mapping out your finances and measuring your financial-health ratios, then build a strategy that fits your goals and your situation.',
        cta: 'Schedule a Consultation',
        badges: [
          { title: 'Confidential & protected', desc: 'Your data is safe, your privacy respected' },
          { title: 'Reach your financial goals', desc: 'Your financial goals, achieved one by one' },
          { title: 'Resolutions achieved', desc: 'Financial resolutions, not just talk' },
          { title: 'Healthier finances', desc: 'Healthier money, a calmer mind' },
        ],
      },
      help: {
        eyebrow: 'HOW WE HELP',
        title: 'How We Walk Alongside You',
        subtitle:
          'We start by mapping out your finances and measuring your financial-health ratios. From that understanding, we build a strategy that fits your goals and your financial situation.',
        items: [
          { title: 'Financial Check Up', desc: 'A thorough financial review with a certified Financial Planner to understand where you stand today, spot what needs fixing, and define the right first steps.' },
          { title: 'Setting Financial Goals', desc: 'We help you organize your priorities and set realistic deadlines for each goal, so your steps have a clear, measurable direction.' },
          { title: 'Building a Strategy to Reach Your Goals', desc: 'We design an investment allocation, asset protection, and risk management strategy tailored to your means and profile, not a one-size-fits-all approach.' },
          { title: 'Action Plan', desc: 'You receive a complete PDF report covering the review results, investment strategy, asset protection plan, and improvement notes you can apply right away.' },
        ],
      },
      services: {
        eyebrow: 'CONSULTATION SERVICES',
        title: 'More Than Just Managing Cash Flow',
        subtitle:
          'Financial planning consultation with us provides end-to-end guidance to bring you closer to every financial goal, through measured and sustainable steps.',
        items: [
          { title: 'Bank & Institutional Credit Consultation', desc: 'We review credit options such as mortgages, vehicle loans, and other long-term financing, so you choose wisely, get the most efficient option, and avoid hidden costs.' },
          { title: 'Retirement Fund', desc: 'Preparing your retirement fund alongside a strategy toward financial freedom. Ideal if you want the flexibility to retire early with peace of mind.' },
          { title: 'Education Fund', desc: 'Planning your children’s education needs with asset protection schemes and an optimal investment strategy, so their educational future is more secure.' },
        ],
        cta: 'Schedule Your Consultation',
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Frequently Asked Questions',
        items: [
          { q: 'What is financial planning?', a: 'Financial planning is the process of organizing your finances in a precise and purposeful way to achieve your or your family’s life goals. The process involves building and implementing a tailored financial plan, because everyone’s situation and goals are different.' },
          { q: 'How much does a financial consultation cost?', a: 'The fee is matched to your life stage and the complexity of your financial situation. Starter package Rp500,000 (fresh graduate/single, one 90-minute session). Family package Rp1,000,000 (couples/young families, 2–3 week process). Comprehensive package Rp2,000,000 (established/complex, around 1 month process).' },
          { q: 'How many consultation sessions are involved?', a: 'There are 2 sessions: an initial meeting and a recommendation meeting.' },
          { q: 'What is the consultation timeline?', a: 'Week 1 — Initial Meeting. Week 2 — Submitting Financial Data. Week 3 — Recommendation Meeting.' },
          { q: 'Can the consultation be done together with my partner?', a: 'Yes, alone or together with your partner, as long as it fits the duration and service you choose.' },
          { q: 'How do I purchase the consultation service online?', a: 'Sign up through this page, pick an available time, fill in your details, choose a payment method, then you will receive an email confirming the initial meeting schedule. Please try to arrive 5 minutes before the session.' },
          { q: 'When are consultation slots available?', a: 'Every day, Monday–Sunday, from 9:00 AM to 8:00 PM WIB.' },
          { q: 'Can the payment be paid in installments?', a: 'For now, payment cannot be made in installments and must be paid in full upfront.' },
          { q: 'Is a refund possible?', a: 'A refund can be requested no later than 2 days before the scheduled session, with a maximum of 50% returned. Once the consultation has taken place, a refund is not possible.' },
          { q: 'How is the confidentiality of my data and information handled?', a: 'Our Financial Planner (CFP®) is bound by professional ethics and confidentiality principles. All information you share is kept secure and used only for the purposes of the consultation.' },
        ],
      },
      booking: {
        steps: { schedule: 'Choose a Time', details: 'Your Details', confirm: 'Confirm' },
        closed: {
          title: 'Booking is temporarily closed',
          body: 'Consultation sign-ups are temporarily closed. Contact us via WhatsApp for the next available schedule.',
          cta: 'Contact via WhatsApp',
        },
        timeline: {
          title: 'How the Consultation Works With Us',
          subtitle:
            'So you know what we’ll go through together — from the start until you receive your recommendations. Relaxed, focused, one step at a time.',
          items: [
            { week: 'Week 1', title: 'Initial Meeting (60 minutes)', desc: 'We start by talking through an overview of your financial situation, the goals you want to reach, and the areas that can be optimized.' },
            { week: 'Week 2', title: 'Submitting Financial Data', desc: 'You provide the financial data we need (via email) as material for our thorough analysis.' },
            { week: 'Week 3', title: 'Recommendation Meeting', desc: 'Once the analysis is complete, we meet again to go over the recommendations we’ve prepared specifically for you.' },
          ],
          note: 'Each stage is designed to give you enough time to understand every step, without feeling rushed.',
        },
        schedule: { dateLabel: 'Choose a Date', timeLabel: 'Choose a Time (WIB)', empty: 'No schedules available.' },
        details: {
          nameLabel: 'Full Name',
          emailLabel: 'Email',
          phoneLabel: 'WhatsApp Number',
          topicLabel: 'What would you like to consult about?',
          topicHint: 'Briefly describe the problem or financial goal you want to discuss.',
        },
        confirm: {
          title: 'Review Your Booking',
          summaryDate: 'Date',
          summaryTime: 'Time',
          summaryName: 'Name',
          summaryTopic: 'Topic',
          submit: 'Confirm & View Payment',
        },
        success: {
          title: 'Booking received!',
          body: 'Your booking has been recorded. Complete the payment within 24 hours, then send your transfer proof so we can email you the Google Meet link.',
          refId: 'Reference Number',
          payTitle: 'Payment Instructions',
          bankTransfer: 'Bank Transfer',
          qris: 'QRIS',
          copy: 'Copy',
          copied: 'Copied',
          window: 'Pay within 24 hours. If unpaid, the booking is automatically canceled.',
          refund: 'A refund of up to 50% can be requested no later than 2 days before the scheduled session.',
          whatsapp: 'Payment trouble? Contact via WhatsApp',
        },
        next: 'Next',
        back: 'Back',
      },
    },
  },
};
