'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

// Mock data
const categories = ['Semua', 'Manajemen Kekayaan', 'Perencanaan Pajak', 'Investasi', 'Psikologi', 'Pensiun'];

const allPosts = [
  {
    id: 1,
    title: '5 Langkah Menuju Kebebasan Finansial di Usia 30-an',
    excerpt: 'Temukan strategi kunci untuk membangun kekayaan dan mengamankan masa depan finansial Anda selagi masih muda. Dimulai dengan perubahan pola pikir dan disiplin menabung.',
    date: '10 Des 2024',
    author: 'Aditya V.C.',
    category: 'Manajemen Kekayaan',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop',
    slug: '5-steps-financial-freedom'
  },
  {
    id: 2,
    title: 'Memahami Optimasi Pajak untuk Usaha Kecil',
    excerpt: 'Pelajari cara legal untuk mengurangi kewajiban pajak Anda dan menyimpan lebih banyak uang hasil kerja keras Anda. Kami membahas pengurangan, kredit, dan struktur entitas.',
    date: '28 Nov 2024',
    author: 'Aditya V.C.',
    category: 'Perencanaan Pajak',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop',
    slug: 'tax-optimization-small-business'
  },
  {
    id: 3,
    title: 'Psikologi Uang: Mengubah Pola Pikir',
    excerpt: 'Bagaimana keyakinan Anda tentang uang membentuk realitas finansial Anda dan cara mengubahnya untuk hasil yang lebih baik.',
    date: '15 Nov 2024',
    author: 'Aditya V.C.',
    category: 'Psikologi',
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop',
    slug: 'psychology-of-money'
  },
  {
    id: 4,
    title: 'Perencanaan Pensiun 101: Dari Mana Memulai',
    excerpt: 'Tidak pernah terlalu dini untuk mulai merencanakan masa pensiun. Berikut adalah panduan komprehensif untuk memulai dengan DPLK, Reksadana, dan lainnya.',
    date: '05 Nov 2024',
    author: 'Aditya V.C.',
    category: 'Pensiun',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop',
    slug: 'retirement-planning-101'
  },
  {
    id: 5,
    title: 'Berinvestasi di Pasar yang Fluktuatif',
    excerpt: 'Volatilitas pasar tidak dapat dihindari. Pelajari cara tetap tenang dan membuat keputusan investasi cerdas saat pasar sedang bergejolak.',
    date: '22 Okt 2024',
    author: 'Aditya V.C.',
    category: 'Investasi',
    image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop',
    slug: 'investing-volatile-markets'
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = activeCategory === 'Semua' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#2C3E50] mb-6">Blog Wawasan Finansial</h1>
          <p className="text-xl text-gray-600 mb-10">
            Artikel ahli, panduan, dan tips untuk membantu Anda membuat keputusan keuangan yang lebih cerdas.
          </p>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari artikel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? 'bg-[#2C3E50] text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                    src={post.image} 
                    alt={post.title} 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#2C3E50]">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-gray-500 mb-3">
                  {post.date} • {post.author}
                </div>
                
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#3498DB] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">
                  {post.excerpt}
                </p>
                
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-[#3498DB] font-medium hover:underline mt-auto">
                  Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Artikel tidak ditemukan</h3>
            <p className="text-gray-500">Coba sesuaikan pencarian atau filter kategori Anda.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
