export type Lang = 'id' | 'en';

export const translations = {
  id: {
    navbar: {
      servicesMenu: {
        label: 'Layanan',
        items: [
          { label: 'Template Keuangan / Produk Digital', href: '/#services' },
          { label: 'Konsultasi Keuangan Pribadi', href: '/konsultasi' },
          { label: 'Corporate Training', href: '/korporat' },
        ],
      },
      links: [
        { label: 'Cara Kerja', href: '#how-it-works' },
        { label: 'Blog', href: '/blog' },
        { label: 'Testimoni', href: '#about' },
      ],
      cta: 'Contact Us',
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
        cta: 'Selengkapnya',
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
          { q: 'Berapa banyak sesi konsultasi yang dijalani?', a: 'Ada 2 sesi: Discovery meeting dan recommendation meeting.' },
          { q: 'Bagaimana timeline konsultasinya?', a: 'Minggu 1 — Discovery Meeting. Minggu 2 — Penyampaian Data Keuangan. Minggu 3 — Recommendation Meeting.' },
          { q: 'Apakah konsultasi bisa bersama pasangan?', a: 'Bisa, sendiri maupun bersama pasangan, selama sesuai durasi dan layanan yang dipilih.' },
          { q: 'Bagaimana cara membeli jasa konsultasi secara online?', a: 'Daftar lewat halaman ini, pilih jadwal yang tersedia, isi datamu, pilih metode pembayaran, lalu kamu akan menerima email konfirmasi jadwal Discovery meeting. Usahakan hadir 5 menit sebelum sesi.' },
          { q: 'Kapan saja jadwal konsultasi tersedia?', a: 'Setiap hari, Senin–Minggu, pukul 09.00–20.00 WIB.' },
          { q: 'Apakah pembayaran bisa dicicil?', a: 'Untuk saat ini pembayaran belum bisa dicicil dan dilakukan penuh di awal.' },
          { q: 'Apakah bisa refund?', a: 'Refund bisa diajukan paling lambat H-2 sebelum jadwal, dengan pengembalian maksimal 50%. Jika konsultasi sudah berlangsung, refund tidak dapat dilakukan.' },
          { q: 'Bagaimana kerahasiaan data dan informasiku?', a: 'Perencana Keuangan (CFP®) kami terikat etika profesi dan prinsip kerahasiaan. Semua informasi yang kamu bagikan kami jaga dan hanya digunakan untuk kepentingan konsultasi.' },
        ],
      },
      booking: {
        steps: { schedule: 'Pilih Jadwal', details: 'Data Diri', confirm: 'Konfirmasi' },
        packages: {
          label: 'Pilih Paket',
          subtitle: 'Pilih paket yang paling sesuai dengan kebutuhanmu.',
          popular: 'Paling Populer',
          items: [
            { id: 'starter', name: 'Paket Starter', audience: 'Untuk fresh graduate atau kamu yang masih single', duration: '1 sesi (90 menit)', features: ['Budgeting & rencana arus kas', 'Rencana dana darurat', 'Strategi investasi dasar', 'Financial check-up dasar'] },
            { id: 'family', name: 'Paket Family', audience: 'Untuk pasangan atau keluarga muda', duration: 'Proses 2–3 minggu', features: ['Cash flow & financial check-up keluarga', 'Perencanaan dana pendidikan anak', 'Dana darurat & strategi asuransi', 'Strategi investasi keluarga'] },
            { id: 'comprehensive', name: 'Paket Comprehensive', audience: 'Untuk kamu yang sudah mapan atau punya situasi keuangan kompleks', duration: 'Proses ± 1 bulan', features: ['Financial plan lengkap (6 pos)', 'Strategi pajak & pensiun', 'Estate planning (rencana waris)', 'Review portofolio investasi menyeluruh'] },
          ],
        },
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
          emailHint: 'Pastikan email benar',
          phoneLabel: 'No. WhatsApp',
          topicLabel: 'Apa yang ingin kamu konsultasikan?',
          topicHint: 'Bagikan masalah anda supaya kami lebih mudah mempersiapkan materi sebelum sesi konsultasi',
          optional: 'Opsional',
          errName: 'Nama wajib diisi',
          errEmail: 'Masukkan alamat email yang valid',
          errPhone: 'No. WhatsApp wajib diisi',
        },
        confirm: {
          title: 'Tinjau Pesananmu',
          summaryPackage: 'Paket',
          summaryDate: 'Tanggal',
          summaryTime: 'Jam',
          summaryName: 'Nama',
          summaryTopic: 'Topik',
          priceTitle: 'Rincian Biaya',
          total: 'Total',
          note: 'Pastikan email anda adalah email yg benar, karena kami akan mengirimkan google meet invite ke email yg tertera.',
          submit: 'Konfirmasi Booking',
        },
        success: {
          title: 'Booking diterima!',
          body: 'Booking-mu sudah kami catat, setelah konfirmas pembayaran Anda akan menerima google meets invite. Pastikan email anda adalah email yg benar.',
          refId: 'Nomor Referensi',
          summaryTitle: 'Ringkasan Booking',
          joinMeet: 'Gabung Google Meet',
          meetNote: 'Undangan Google Calendar beserta link Google Meet sudah dikirim ke emailmu.',
          waIntro: 'Halo, saya sudah booking konsultasi:',
          whatsapp: 'Konfirmasi pembayaran',
          uploadTitle: 'Sudah transfer? Upload bukti pembayaran',
          uploadHint: 'Format JPG, PNG, atau PDF. Maksimal 5 MB.',
          uploadCta: 'Pilih file',
          uploading: 'Mengunggah…',
          uploadDone: 'Bukti pembayaran terkirim',
        },
        next: 'Lanjut',
        back: 'Kembali',
      },
    },
    korporat: {
      meta: {
        title: 'Corporate Training & Employee Financial Wellness',
        description:
          'Program in-house training keuangan untuk karyawan — dibawakan oleh Perencana Keuangan bersertifikasi CFP®, dengan materi yang ringan, relevan, dan bisa langsung dipraktikkan.',
      },
      hero: {
        eyebrow: 'IN-HOUSE TRAINING & EMPLOYEE FINANCIAL WELLNESS',
        title: 'Tingkatkan Kesejahteraan Karyawan lewat Akselerasi Literasi Finansial',
        subtitle:
          'Karyawan yang tenang soal keuangan cenderung lebih fokus, produktif, dan loyal. Lewat program in-house training TemanTumbuh, kami bantu timmu memahami uang dengan cara yang ringan, relevan, dan bisa langsung dipraktikkan.',
        cta: 'Hubungi Kami',
        badges: [
          'Mendorong employee engagement',
          'Trainer bersertifikasi resmi CFP®',
          'Topik disesuaikan kebutuhan',
          'Materi relevan & aplikatif',
        ],
      },
      why: {
        eyebrow: 'MENGAPA PENTING',
        title: 'Mengapa Financial Wellness Penting?',
        subtitle: 'Karyawan yang sehat secara finansial adalah aset yang lebih produktif dan loyal.',
        stats: [
          { value: '78%', label: 'karyawan merasa stres soal keuangan' },
          { value: '3 jam', label: 'per minggu hilang akibat stres finansial di tempat kerja' },
          { value: '2,5×', label: 'lebih loyal — karyawan yang merasa sejahtera secara finansial' },
          { value: '↑40%', label: 'produktivitas meningkat dengan program financial wellness' },
        ],
        note: 'Angka-angka di atas merupakan ringkasan dari berbagai riset corporate financial wellness global (PwC, EY, MetLife). Konteks Indonesia bisa bervariasi, tapi polanya umumnya konsisten.',
      },
      topics: {
        eyebrow: 'TOPIK PROGRAM',
        title: 'Topik Program Training Kami',
        subtitle:
          'Setiap materi kami susun lewat riset mendalam dan dibawakan oleh trainer bersertifikasi CFP®, dengan gaya penyampaian yang ringan dan interaktif — bukan presentasi satu arah.',
        items: [
          { title: 'Manajemen Keuangan Pribadi Karyawan', desc: 'Materi disampaikan dengan bahasa yang mudah dipahami dan langsung bisa diterapkan. Ringan, interaktif, dan engaging, supaya karyawan benar-benar terbawa sampai akhir sesi.' },
          { title: 'Perencanaan Keuangan Menuju Pensiun', desc: 'Mencakup studi kasus dan strategi persiapan pensiun yang kami riset secara mendalam, supaya karyawanmu bisa merencanakan masa pensiun dengan lebih tenang dan terarah.' },
          { title: 'Edukasi Investasi untuk Karyawan', desc: 'Materi investasi kami dirancang inklusif dan ramah pemula. Kami percaya semua orang bisa mulai berinvestasi untuk mencapai tujuan keuangannya, apa pun titik awalnya.' },
          { title: 'Cegah Jeratan Pinjaman Online & Judi Online', desc: 'Topik yang sering dianggap tabu ini kami bahas secara rinci, aktual, dan transparan, dengan penyampaian yang membuka mata sekaligus memberdayakan.' },
        ],
      },
      more: {
        eyebrow: 'TOPIK LAINNYA',
        title: 'Topik Materi Lainnya',
        subtitle: 'Disesuaikan dengan profil karyawan dan objektif HR/L&D.',
        groups: [
          {
            title: 'Financial Wellness',
            audience: 'Untuk semua level karyawan',
            items: [
              'Mengelola gaji dengan bijak',
              'Perencanaan keuangan untuk young professional',
              'Kebebasan finansial untuk generasi milenial',
              'Mengelola uang tanpa stres',
            ],
          },
          {
            title: 'Financial Planning',
            audience: 'Teknikal & praktis',
            items: [
              'Budgeting & manajemen arus kas',
              'Perencanaan dana darurat & asuransi',
              'Investasi untuk pemula',
              'Dasar perencanaan pensiun',
            ],
          },
          {
            title: 'Family Finance',
            audience: 'Untuk working parents & karyawan senior',
            items: [
              'Perencanaan keuangan untuk orang tua bekerja',
              'Persiapan dana pensiun yang mapan',
              'Perencanaan dana pendidikan anak',
              'Gaya hidup finansial yang berkelanjutan',
            ],
          },
        ],
        format: 'Format penyampaian ideal: 40% materi · 30% studi kasus · 30% Q&A — bukan presentasi satu arah.',
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Pertanyaan yang Sering Ditanyakan',
        items: [
          { q: 'Apa itu program in-house training TemanTumbuh?', a: 'Program edukasi finansial yang kami bawakan langsung untuk karyawan di perusahaanmu, baik secara tatap muka maupun online. Materinya kami sesuaikan dengan profil karyawan dan tujuan tim HR/L&D, supaya benar-benar relevan dengan kebutuhan timmu.' },
          { q: 'Apakah materinya bisa disesuaikan dengan kebutuhan perusahaan kami?', a: 'Bisa. Sebelum sesi, kami diskusi dulu bareng tim HR untuk memahami profil karyawan dan objektif yang ingin dicapai. Dari situ, kami susun materi yang paling pas, jadi bukan paket seragam untuk semua perusahaan.' },
          { q: 'Siapa yang akan membawakan trainingnya?', a: 'Sesi dibawakan oleh Perencana Keuangan bersertifikasi CFP®, sehingga materi yang disampaikan kredibel dan teruji, namun tetap dikemas ringan dan mudah dicerna.' },
          { q: 'Berapa lama durasi satu sesi training?', a: 'Durasi fleksibel dan bisa disesuaikan, mulai dari webinar singkat satu sesi hingga rangkaian education series. Kami bantu rekomendasikan format yang paling sesuai dengan kebutuhan dan ketersediaan waktu timmu.' },
          { q: 'Apakah training bisa dilakukan secara online?', a: 'Bisa. Program dapat dijalankan secara online, offline (on-site), maupun hybrid, menyesuaikan kondisi dan preferensi perusahaanmu.' },
          { q: 'Berapa jumlah peserta yang ideal dalam satu sesi?', a: 'Jumlah peserta cukup fleksibel. Kami bisa menyesuaikan pendekatan baik untuk kelompok kecil maupun audiens dalam jumlah besar, sambil menjaga sesi tetap interaktif.' },
          { q: 'Bagaimana cara mengajukan program in-house training?', a: 'Cukup hubungi kami lewat WhatsApp di +62 818-0648-4635, lalu ceritakan kebutuhan timmu. Kami akan bantu menyusun proposal program beserta rekomendasi topik, silabus, dan formatnya.' },
        ],
      },
      finalCta: {
        title: 'Siap tingkatkan financial wellness timmu?',
        subtitle: 'Ceritakan kebutuhan timmu, dan kami bantu susun proposal program beserta rekomendasi topik, silabus, dan formatnya.',
        button: 'Hubungi Kami',
      },
    },
  },

  en: {
    navbar: {
      servicesMenu: {
        label: 'Services',
        items: [
          { label: 'Financial Templates / Digital Products', href: '/#services' },
          { label: 'Personal Financial Consultation', href: '/konsultasi' },
          { label: 'Corporate Training', href: '/korporat' },
        ],
      },
      links: [
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
        cta: 'Learn More',
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
          { q: 'How many consultation sessions are involved?', a: 'There are 2 sessions: an discovery meeting and a recommendation meeting.' },
          { q: 'What is the consultation timeline?', a: 'Week 1 — Discovery Meeting. Week 2 — Submitting Financial Data. Week 3 — Recommendation Meeting.' },
          { q: 'Can the consultation be done together with my partner?', a: 'Yes, alone or together with your partner, as long as it fits the duration and service you choose.' },
          { q: 'How do I purchase the consultation service online?', a: 'Sign up through this page, pick an available time, fill in your details, choose a payment method, then you will receive an email confirming the discovery meeting schedule. Please try to arrive 5 minutes before the session.' },
          { q: 'When are consultation slots available?', a: 'Every day, Monday–Sunday, from 9:00 AM to 8:00 PM WIB.' },
          { q: 'Can the payment be paid in installments?', a: 'For now, payment cannot be made in installments and must be paid in full upfront.' },
          { q: 'Is a refund possible?', a: 'A refund can be requested no later than 2 days before the scheduled session, with a maximum of 50% returned. Once the consultation has taken place, a refund is not possible.' },
          { q: 'How is the confidentiality of my data and information handled?', a: 'Our Financial Planner (CFP®) is bound by professional ethics and confidentiality principles. All information you share is kept secure and used only for the purposes of the consultation.' },
        ],
      },
      booking: {
        steps: { schedule: 'Choose a Time', details: 'Your Details', confirm: 'Confirm' },
        packages: {
          label: 'Choose a Package',
          subtitle: 'Pick the package that best fits your needs.',
          popular: 'Most Popular',
          items: [
            { id: 'starter', name: 'Starter Package', audience: 'For fresh graduates or if you’re still single', duration: '1 session (90 minutes)', features: ['Budgeting & cash flow plan', 'Emergency fund plan', 'Basic investment strategy', 'Basic financial check-up'] },
            { id: 'family', name: 'Family Package', audience: 'For couples or young families', duration: '2–3 week process', features: ['Family cash flow & financial check-up', 'Children’s education fund planning', 'Emergency fund & insurance strategy', 'Family investment strategy'] },
            { id: 'comprehensive', name: 'Comprehensive Package', audience: 'For those who are established or have a complex financial situation', duration: '± 1 month process', features: ['Complete financial plan (6 areas)', 'Tax & retirement strategy', 'Estate planning', 'Full investment portfolio review'] },
          ],
        },
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
          emailHint: 'Make sure your email is correct',
          phoneLabel: 'WhatsApp Number',
          topicLabel: 'What would you like to consult about?',
          topicHint: 'Share your situation so we can better prepare the material before your consultation session.',
          optional: 'Optional',
          errName: 'Name is required',
          errEmail: 'Enter a valid email address',
          errPhone: 'WhatsApp number is required',
        },
        confirm: {
          title: 'Review Your Booking',
          summaryPackage: 'Package',
          summaryDate: 'Date',
          summaryTime: 'Time',
          summaryName: 'Name',
          summaryTopic: 'Topic',
          priceTitle: 'Price Breakdown',
          total: 'Total',
          note: 'No online payment for now. After booking, our team will reach out via WhatsApp to arrange the schedule and payment.',
          submit: 'Confirm Booking',
        },
        success: {
          title: 'Booking received!',
          body: 'Your booking has been recorded. Our team will reach out via WhatsApp to confirm the schedule and arrange the next steps.',
          refId: 'Reference Number',
          summaryTitle: 'Booking Summary',
          joinMeet: 'Join Google Meet',
          meetNote: 'A Google Calendar invite with the Google Meet link has been sent to your email.',
          waIntro: 'Hi, I just booked a consultation:',
          whatsapp: 'Confirm payment',
          uploadTitle: 'Already transferred? Upload your payment proof',
          uploadHint: 'JPG, PNG, or PDF. Max 5 MB.',
          uploadCta: 'Choose file',
          uploading: 'Uploading…',
          uploadDone: 'Payment proof sent',
        },
        next: 'Next',
        back: 'Back',
      },
    },
    korporat: {
      meta: {
        title: 'Corporate Training & Employee Financial Wellness',
        description:
          'In-house financial training for employees — delivered by certified CFP® Financial Planners, with material that is light, relevant, and immediately practical.',
      },
      hero: {
        eyebrow: 'IN-HOUSE TRAINING & EMPLOYEE FINANCIAL WELLNESS',
        title: 'Boost Employee Wellbeing by Accelerating Financial Literacy',
        subtitle:
          'Employees who feel at ease about money tend to be more focused, productive, and loyal. Through TemanTumbuh’s in-house training, we help your team understand money in a way that’s light, relevant, and immediately practical.',
        cta: 'Request a Training Program',
        badges: [
          'Boosts employee engagement',
          'Officially certified CFP® trainers',
          'Topics tailored to your needs',
          'Relevant & practical material',
        ],
      },
      why: {
        eyebrow: 'WHY IT MATTERS',
        title: 'Why Does Financial Wellness Matter?',
        subtitle: 'Financially healthy employees are more productive and loyal assets.',
        stats: [
          { value: '78%', label: 'of employees feel stressed about money' },
          { value: '3 hrs', label: 'lost per week due to financial stress at work' },
          { value: '2.5×', label: 'more loyal — employees who feel financially secure' },
          { value: '↑40%', label: 'productivity boost with a financial wellness program' },
        ],
        note: 'The figures above summarize various global corporate financial wellness studies (PwC, EY, MetLife). The Indonesian context may vary, but the patterns are generally consistent.',
      },
      topics: {
        eyebrow: 'TRAINING TOPICS',
        title: 'Our Training Program Topics',
        subtitle:
          'Every module is built on in-depth research and delivered by certified CFP® trainers, with a light, interactive style — never a one-way presentation.',
        items: [
          { title: 'Employee Personal Finance Management', desc: 'Delivered in plain language that’s easy to grasp and ready to apply. Light, interactive, and engaging, so employees stay with it all the way to the end of the session.' },
          { title: 'Financial Planning Toward Retirement', desc: 'Includes deeply researched case studies and retirement preparation strategies, so your employees can plan for retirement with more peace of mind and direction.' },
          { title: 'Investment Education for Employees', desc: 'Our investment material is designed to be inclusive and beginner-friendly. We believe everyone can start investing to reach their financial goals, whatever their starting point.' },
          { title: 'Avoiding the Online Loan & Online Gambling Trap', desc: 'This often-taboo topic is covered in detail, up to date, and transparently — delivered in a way that’s eye-opening and empowering.' },
        ],
      },
      more: {
        eyebrow: 'MORE TOPICS',
        title: 'Additional Topics',
        subtitle: 'Tailored to your employee profile and HR/L&D objectives.',
        groups: [
          {
            title: 'Financial Wellness',
            audience: 'For employees at every level',
            items: [
              'Managing your salary wisely',
              'Financial planning for young professionals',
              'Financial freedom for the millennial generation',
              'Managing money without stress',
            ],
          },
          {
            title: 'Financial Planning',
            audience: 'Technical & practical',
            items: [
              'Budgeting & cash flow management',
              'Emergency fund & insurance planning',
              'Investing for beginners',
              'Retirement planning basics',
            ],
          },
          {
            title: 'Family Finance',
            audience: 'For working parents & senior employees',
            items: [
              'Financial planning for working parents',
              'Preparing a solid retirement fund',
              'Education fund planning for children',
              'A sustainable financial lifestyle',
            ],
          },
        ],
        format: 'Ideal delivery format: 40% material · 30% case studies · 30% Q&A — not a one-way presentation.',
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Frequently Asked Questions',
        items: [
          { q: 'What is TemanTumbuh’s in-house training program?', a: 'A financial education program we deliver directly to employees at your company, either in person or online. The material is tailored to your employee profile and the goals of your HR/L&D team, so it’s genuinely relevant to your team’s needs.' },
          { q: 'Can the material be tailored to our company’s needs?', a: 'Yes. Before the session, we discuss with your HR team to understand the employee profile and the objectives you want to achieve. From there we build the most fitting material — not a one-size-fits-all package.' },
          { q: 'Who will deliver the training?', a: 'Sessions are led by certified CFP® Financial Planners, so the material is credible and proven, yet still delivered in a way that’s light and easy to digest.' },
          { q: 'How long is one training session?', a: 'Duration is flexible and adjustable — from a short single-session webinar to a full education series. We’ll help recommend the format that best fits your team’s needs and availability.' },
          { q: 'Can the training be held online?', a: 'Yes. The program can run online, offline (on-site), or hybrid, adapting to your company’s situation and preferences.' },
          { q: 'What is the ideal number of participants per session?', a: 'The participant count is quite flexible. We can adapt our approach for small groups or large audiences, while keeping the session interactive.' },
          { q: 'How do we request an in-house training program?', a: 'Simply reach us via WhatsApp at +62 818-0648-4635 and tell us what your team needs. We’ll help craft a program proposal with recommended topics, syllabus, and format.' },
        ],
      },
      finalCta: {
        title: 'Ready to boost your team’s financial wellness?',
        subtitle: 'Tell us what your team needs, and we’ll help craft a program proposal with recommended topics, syllabus, and format.',
        button: 'Request a Program via WhatsApp',
      },
    },
  },
};
