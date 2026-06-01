'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const CATEGORIES = ['Semua', 'Manajemen Kekayaan', 'Perencanaan Pajak', 'Investasi', 'Psikologi', 'Pensiun']

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  author: string
  category: string
  categoryLabel: string
  coverImage: string | null
}

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = posts.filter(post => {
    const matchesCategory = activeCategory === 'Semua' || post.categoryLabel === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch = post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="pt-32 pb-20 min-h-screen" style={{ background: '#F0F7FA' }}>
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-[#4F9DA6] mb-4">
            Wawasan Finansial
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#153A56] mb-6 leading-tight tracking-tight">
            Blog Finansial
          </h1>
          <p className="text-lg text-[#666666] mb-10">
            Artikel ahli, panduan, dan tips untuk membantu Anda membuat keputusan keuangan yang lebih cerdas.
          </p>
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BAFC0]" size={18} />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full border border-[#CBDCEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F9DA6] text-[#153A56] text-sm"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#205781] text-white shadow-md'
                  : 'bg-white text-[#205781] border border-[#E0EBF5] hover:bg-[#E0EBF5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden group flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <div className="relative h-52 overflow-hidden bg-[#E0EBF5]">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#205781] to-[#4F9DA6]" />
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#205781]">
                    {post.categoryLabel}
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-grow">
                  <div className="text-xs text-[#9BAFC0] mb-3 font-mono">
                    {post.publishedAt} · {post.author}
                  </div>
                  <h3 className="text-lg font-semibold text-[#153A56] mb-3 group-hover:text-[#205781] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[#666666] text-sm mb-6 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-[#205781] font-semibold text-sm hover:text-[#4F9DA6] transition-colors mt-auto"
                  >
                    Baca Selengkapnya <ArrowRight size={15} className="ml-1.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-[#9BAFC0] mb-2">Artikel tidak ditemukan</h3>
            <p className="text-[#666666]">
              {posts.length === 0
                ? 'Belum ada artikel. Tambahkan artikel melalui admin.'
                : 'Coba sesuaikan pencarian atau filter kategori Anda.'}
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}