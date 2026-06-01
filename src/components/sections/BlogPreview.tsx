import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { reader, CATEGORY_LABELS, formatDate } from '@/lib/keystatic'

export async function BlogPreview() {
  const entries = await reader.collections.blog.all()

  const posts = entries
    .map(entry => ({
      slug: entry.slug,
      title: entry.entry.title,
      excerpt: entry.entry.excerpt,
      publishedAt: entry.entry.publishedAt ? formatDate(entry.entry.publishedAt) : '',
      author: entry.entry.author,
      categoryLabel: CATEGORY_LABELS[entry.entry.category] ?? entry.entry.category,
      coverImage: entry.entry.coverImage ?? null,
    }))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3)

  if (posts.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <span className="inline-block font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-[#4F9DA6] mb-3">
              Wawasan Finansial
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#153A56] mb-3 tracking-tight">
              Artikel Terbaru
            </h2>
            <p className="text-[#666666]">
              Dapatkan update tren terbaru, tips, dan strategi dari para ahli keuangan kami.
            </p>
          </div>
          <Link href="/blog" className="hidden md:block mt-4">
            <Button variant="outline">Lihat Semua Artikel</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map(post => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 overflow-hidden bg-[#E0EBF5]">
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

              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-[#9BAFC0] font-mono mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    {post.publishedAt}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={13} />
                    {post.author}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#153A56] mb-3 line-clamp-2 group-hover:text-[#205781] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#666666] text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-[#205781] font-semibold text-sm hover:text-[#4F9DA6] transition-colors"
                >
                  Baca Selengkapnya <ArrowRight size={14} className="ml-1" />
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
  )
}