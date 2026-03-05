import Link from 'next/link';
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Container } from '@/components/ui/Container';

// Mock data function - normally would fetch from Supabase
const getPost = (slug: string) => {
  return {
    title: '5 Langkah Menuju Kebebasan Finansial di Usia 30-an',
    content: `
      <p class="mb-6 text-lg">Mencapai kebebasan finansial adalah tujuan bagi banyak orang, tetapi seringkali terasa sulit dicapai. Namun, dengan strategi yang tepat dan disiplin, membangun kekayaan yang signifikan di usia 30-an sangatlah mungkin. Berikut adalah lima langkah praktis untuk memulai.</p>
      
      <h2 class="text-2xl font-bold text-[#2C3E50] mb-4 mt-8">1. Kuasai Arus Kas Anda</h2>
      <p class="mb-6">Langkah pertama menuju kebebasan finansial adalah mengetahui dengan pasti ke mana uang Anda pergi. Lacak pendapatan dan pengeluaran Anda setidaknya selama tiga bulan. Gunakan aplikasi penganggaran atau spreadsheet sederhana. Setelah Anda memiliki kejelasan, cari area di mana Anda dapat mengurangi pengeluaran tanpa mengorbankan kualitas hidup Anda.</p>
      
      <h2 class="text-2xl font-bold text-[#2C3E50] mb-4 mt-8">2. Lunasi Utang Bunga Tinggi</h2>
      <p class="mb-6">Utang kartu kredit dan pinjaman pribadi berbunga tinggi adalah penghancur kekayaan. Prioritaskan untuk melunasi utang-utang ini menggunakan metode avalanche atau snowball. Bunga yang Anda hemat adalah pengembalian investasi yang terjamin.</p>
      
      <h2 class="text-2xl font-bold text-[#2C3E50] mb-4 mt-8">3. Maksimalkan Instrumen Investasi</h2>
      <p class="mb-6">Jika kantor Anda menawarkan program pensiun dengan matching, berkontribusilah setidaknya cukup untuk mendapatkan matching penuh—itu uang gratis. Kemudian, pertimbangkan untuk berkontribusi ke Reksadana atau Obligasi Negara. Instrumen ini menawarkan potensi pertumbuhan yang dapat mempercepat pembangunan kekayaan Anda.</p>
      
      <h2 class="text-2xl font-bold text-[#2C3E50] mb-4 mt-8">4. Bangun Dana Darurat</h2>
      <p class="mb-6">Hidup tidak dapat diprediksi. Bertujuanlah untuk menyimpan 3-6 bulan biaya hidup di rekening tabungan dengan imbal hasil tinggi atau Reksadana Pasar Uang. Dana ini melindungi Anda dari harus mencairkan investasi atau berutang saat keadaan darurat muncul.</p>
      
      <h2 class="text-2xl font-bold text-[#2C3E50] mb-4 mt-8">5. Investasi Secara Konsisten</h2>
      <p class="mb-6">Waktu di pasar mengalahkan memprediksi pasar (Time in the market beats timing the market). Atur transfer otomatis ke akun investasi Anda. Fokus pada reksadana indeks biaya rendah atau ETF yang memberi Anda paparan pasar yang luas. Kekuatan bunga majemuk (compounding interest) adalah sahabat terbaik Anda.</p>
      
      <p class="mt-8 p-6 bg-gray-50 rounded-xl border-l-4 border-[#B6E33D] italic">
        "Kebebasan finansial tersedia bagi mereka yang mempelajarinya dan mengusahakannya." — Robert Kiyosaki
      </p>
    `,
    date: '10 Des 2024',
    author: 'Aditya V.C.',
    category: 'Manajemen Kekayaan',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop'
  };
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // In a real app, await params
  const post = getPost(params.slug);

  return (
    <div className="pt-32 pb-20 bg-white">
      <Container className="max-w-4xl">
        <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-[#2C3E50] mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Kembali ke Blog
        </Link>

        <div className="mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3E50] mt-4 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-8">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="text-gray-400 hover:text-[#3b5998] transition-colors"><Facebook size={20} /></button>
              <button className="text-gray-400 hover:text-[#1da1f2] transition-colors"><Twitter size={20} /></button>
              <button className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={20} /></button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Share2 size={20} /></button>
            </div>
          </div>
        </div>

        <div className="mb-12 rounded-3xl overflow-hidden shadow-lg">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>

        <div 
          className="prose prose-lg max-w-none text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Author Bio Box */}
        <div className="mt-16 bg-gray-50 p-8 rounded-2xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden shrink-0">
             <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
                alt="Aditya V.C." 
                className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2C3E50]">Aditya Very Cleverina</h3>
            <p className="text-gray-600 text-sm mb-2">Perencana Keuangan Tersertifikasi (CFP®)</p>
            <p className="text-gray-500 text-sm">
              Aditya membantu profesional dan pemilik bisnis menavigasi lanskap keuangan yang kompleks untuk mencapai kejelasan dan kepercayaan diri di masa depan mereka.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
