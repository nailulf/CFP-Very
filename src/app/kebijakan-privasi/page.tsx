import Link from 'next/link';

export const metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan Privasi temantumbuh.com — bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.',
};

export default function KebijakanPrivasiPage() {
  const lastUpdated = '1 Juni 2026';
  const siteName = 'Teman Tumbuh';
  const siteUrl = 'https://temantumbuh.com';
  const contactEmail = 'adityacleverina@gmail.com';

  return (
    <div className="min-h-screen bg-[#F0F7FA] pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[1.5px] text-[#4F9DA6] mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
            Legal
          </span>
          <h1 className="text-[40px] font-extrabold text-[#153A56] leading-[1.15] tracking-[-1px] mb-3">
            Kebijakan Privasi
          </h1>
          <p className="text-[15px] text-[#666666]">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 sm:p-10 space-y-8">

          <section>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Selamat datang di {siteName} (&quot;<strong>{siteUrl}</strong>&quot;). Privasi Anda penting bagi kami. Kebijakan Privasi ini menjelaskan informasi apa yang kami kumpulkan, bagaimana kami menggunakannya, dan pilihan yang Anda miliki terkait informasi tersebut saat mengunjungi situs web kami.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">Kami dapat mengumpulkan jenis informasi berikut:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li><strong>Informasi yang Anda berikan secara sukarela</strong> — seperti nama dan alamat email saat mengisi formulir kontak, berlangganan newsletter, atau meminta konsultasi.</li>
              <li><strong>Data penggunaan</strong> — seperti alamat IP, jenis browser, halaman yang dikunjungi, waktu yang dihabiskan di halaman, dan URL perujuk, yang dikumpulkan secara otomatis saat Anda mengunjungi situs kami.</li>
              <li><strong>Cookie dan data pelacakan</strong> — file data kecil yang ditempatkan di perangkat Anda oleh situs kami dan layanan pihak ketiga (lihat Bagian 4).</li>
            </ul>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li>Untuk merespons pertanyaan Anda dan menyediakan layanan yang Anda minta.</li>
              <li>Untuk mengirimkan newsletter atau pembaruan yang telah Anda setujui (Anda dapat berhenti berlangganan kapan saja).</li>
              <li>Untuk meningkatkan dan mengoptimalkan pengalaman situs web.</li>
              <li>Untuk menganalisis traffic situs web dan perilaku pengguna melalui alat analitik.</li>
              <li>Untuk menampilkan iklan yang relevan melalui jaringan periklanan pihak ketiga.</li>
            </ul>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">3. Berbagi Informasi</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami <strong>tidak</strong> menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi dengan penyedia layanan terpercaya yang membantu mengoperasikan situs web kami (misalnya, hosting, analitik, pengiriman email) di bawah perjanjian kerahasiaan yang ketat. Kami juga dapat mengungkapkan informasi jika diwajibkan oleh hukum.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">4. Cookie dan Iklan Pihak Ketiga</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Cookie adalah file teks kecil yang disimpan di perangkat Anda. Anda dapat menginstruksikan browser untuk menolak cookie, meskipun beberapa bagian situs mungkin tidak berfungsi dengan baik tanpanya.
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami menggunakan <strong>Google AdSense</strong> untuk menampilkan iklan di situs web ini. Google, sebagai vendor pihak ketiga, menggunakan cookie (termasuk cookie DoubleClick) untuk menayangkan iklan berdasarkan kunjungan Anda sebelumnya ke situs web ini atau situs web lainnya. Penggunaan cookie periklanan oleh Google memungkinkan Google dan mitranya untuk menayangkan iklan kepada Anda berdasarkan kunjungan Anda ke situs ini dan/atau situs lain di Internet.
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Anda dapat memilih keluar dari iklan yang dipersonalisasi dengan mengunjungi{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                Pengaturan Iklan Google
              </a>
              {' '}atau{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                www.aboutads.info
              </a>
              .
            </p>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami juga menggunakan <strong>Google Analytics</strong> untuk memahami cara pengunjung berinteraksi dengan situs web kami. Google Analytics mengumpulkan data seperti halaman yang dikunjungi, waktu di situs, dan lokasi geografis umum. Data ini bersifat anonim dan tidak mengidentifikasi pengguna secara individual. Untuk informasi lebih lanjut, kunjungi{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors"
              >
                Kebijakan Privasi Google
              </a>
              .
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">5. Penyimpanan Data</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami menyimpan informasi pribadi hanya selama diperlukan untuk memenuhi tujuan yang diuraikan dalam kebijakan ini, kecuali jika periode penyimpanan yang lebih lama diwajibkan oleh hukum.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">6. Hak-Hak Anda</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">Sesuai dengan peraturan yang berlaku, Anda mungkin memiliki hak untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#1A1918] leading-[1.7]">
              <li>Mengakses informasi pribadi yang kami simpan tentang Anda.</li>
              <li>Meminta koreksi data yang tidak akurat.</li>
              <li>Meminta penghapusan data pribadi Anda.</li>
              <li>Menarik persetujuan untuk pemrosesan data kapan saja.</li>
              <li>Mengajukan keluhan kepada otoritas perlindungan data yang relevan.</li>
            </ul>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Untuk menggunakan hak-hak ini, silakan hubungi kami di{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {contactEmail}
              </a>
              .
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">7. Tautan Pihak Ketiga</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Situs web kami mungkin berisi tautan ke situs web pihak ketiga. Kami tidak bertanggung jawab atas praktik privasi situs-situs tersebut dan mendorong Anda untuk meninjau kebijakan privasi mereka secara mandiri.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">8. Privasi Anak-Anak</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Situs web ini tidak ditujukan untuk anak-anak di bawah usia 13 tahun. Kami tidak secara sengaja mengumpulkan informasi pribadi dari anak-anak. Jika Anda yakin kami telah mengumpulkan informasi tersebut secara tidak sengaja, harap hubungi kami segera.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">9. Perubahan Kebijakan Ini</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dengan tanggal &quot;Terakhir diperbarui&quot; yang baru. Kami mendorong Anda untuk meninjau halaman ini secara berkala.
            </p>
          </section>

          <hr className="border-[#E0EBF5]" />

          <section className="space-y-3">
            <h2 className="text-[22px] font-extrabold text-[#153A56]">10. Hubungi Kami</h2>
            <p className="text-[15px] text-[#1A1918] leading-[1.7]">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:
            </p>
            <div className="bg-[#F0F7FA] rounded-xl p-5 text-[15px] text-[#1A1918] leading-[1.8]">
              <strong>{siteName}</strong><br />
              Email:{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {contactEmail}
              </a><br />
              Website:{' '}
              <a href={siteUrl} className="text-[#205781] underline hover:text-[#4F9DA6] transition-colors">
                {siteUrl}
              </a>
            </div>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-8 flex items-center gap-4 text-[14px]">
          <Link href="/" className="text-[#205781] hover:text-[#4F9DA6] transition-colors">
            ← Kembali ke Beranda
          </Link>
          <span className="text-[#E0EBF5]">|</span>
          <Link href="/privacy-policy" className="text-[#205781] hover:text-[#4F9DA6] transition-colors">
            Read in English
          </Link>
        </div>

      </div>
    </div>
  );
}
