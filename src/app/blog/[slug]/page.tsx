import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { reader, CATEGORY_LABELS, formatDate } from '@/lib/keystatic'
import { renderMarkdoc } from '@/lib/markdoc-render'

export const revalidate = 0

export async function generateStaticParams() {
  const posts = await reader.collections.blog.all()
  return posts.filter(p => p.entry.published).map(post => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await reader.collections.blog.read(slug)
  if (!post) return {}
  return {
    title: `${post.title} | CFP Very Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await reader.collections.blog.read(slug)
  if (!post) notFound()

  const { node } = await post.content()
  const content = renderMarkdoc(node)
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category

  return (
    <div className="pt-32 pb-20" style={{ background: '#F0F7FA' }}>
      <Container className="max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-[#666666] hover:text-[#205781] mb-10 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Blog
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          {post.coverImage && (
            <div className="h-72 md:h-96 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-[#E0EBF5] text-[#205781] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {categoryLabel}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#153A56] mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between border-b border-[#E0EBF5] pb-8 mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-5 text-sm text-[#9BAFC0] font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} />
                  {post.publishedAt ? formatDate(post.publishedAt) : ''}
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={15} />
                  {post.author}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="text-[#9BAFC0] hover:text-[#666666] transition-colors"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#153A56] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#153A56] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:text-[#3A5A70] [&_p]:leading-relaxed [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:text-[#3A5A70] [&_a]:text-[#205781] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#4F9DA6] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-[#666666] [&_blockquote]:my-6 [&_hr]:border-[#E0EBF5] [&_hr]:my-8 [&_strong]:font-semibold [&_strong]:text-[#153A56] [&_img]:rounded-xl [&_img]:my-6">
              {content}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-[#E0EBF5] p-7 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#E0EBF5] overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
              alt={post.author}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#153A56]">{post.author}</h3>
            <p className="text-[#4F9DA6] text-sm mb-1">Perencana Keuangan Tersertifikasi (CFP®)</p>
            <p className="text-[#666666] text-sm">
              Aditya membantu profesional dan pemilik bisnis menavigasi lanskap keuangan yang kompleks untuk mencapai kejelasan dan kepercayaan diri di masa depan mereka.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}