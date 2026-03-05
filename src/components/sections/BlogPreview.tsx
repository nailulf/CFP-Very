import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

// Mock data - would normally come from API/Supabase
const blogPosts = [
  {
    id: 1,
    title: '5 Langkah Menuju Kebebasan Finansial di Usia 30-an',
    excerpt: 'Temukan strategi kunci untuk membangun kekayaan dan mengamankan masa depan finansial Anda selagi masih muda.',
    date: '10 Des 2024',
    author: 'Aditya V.C.',
    category: 'Manajemen Kekayaan',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Memahami Optimasi Pajak untuk Usaha Kecil',
    excerpt: 'Pelajari cara legal untuk mengurangi kewajiban pajak Anda dan menyimpan lebih banyak uang hasil kerja keras Anda.',
    date: '28 Nov 2024',
    author: 'Aditya V.C.',
    category: 'Perencanaan Pajak',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Psikologi Uang: Mengubah Pola Pikir',
    excerpt: 'Bagaimana keyakinan Anda tentang uang membentuk realitas finansial Anda dan cara mengubahnya untuk hasil yang lebih baik.',
    date: '15 Nov 2024',
    author: 'Aditya V.C.',
    category: 'Psikologi',
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop'
  }
];

export const BlogPreview = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2C3E50] mb-4">Wawasan Finansial Terbaru</h2>
            <p className="text-gray-600">
              Dapatkan update tren terbaru, tips, dan strategi dari para ahli keuangan kami.
            </p>
          </div>
          <Link href="/blog" className="hidden md:block">
            <Button variant="outline">Lihat Semua Artikel</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                 <img 
                    src={post.image} 
                    alt={post.title} 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#2C3E50]">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3 line-clamp-2 group-hover:text-[#3498DB] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Link href={`/blog/${post.id}`} className="inline-flex items-center text-[#3498DB] font-medium hover:underline">
                  Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/blog">
            <Button variant="outline" fullWidth>Lihat Semua Artikel</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
