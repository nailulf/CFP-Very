import { reader, CATEGORY_LABELS, formatDate } from '@/lib/keystatic'
import BlogListClient, { type BlogPost } from './BlogListClient'

// Statically generated at build time — content is committed to git,
// so a redeploy is required to publish new posts regardless.
export const dynamic = 'force-static'

export default async function BlogPage() {
  const entries = await reader.collections.blog.all()

  const posts: BlogPost[] = entries
    .filter(entry => entry.entry.published)
    .map(entry => ({
      slug: entry.slug,
      title: entry.entry.title,
      excerpt: entry.entry.excerpt,
      publishedAt: entry.entry.publishedAt ? formatDate(entry.entry.publishedAt) : '',
      author: entry.entry.author,
      category: entry.entry.category,
      categoryLabel: CATEGORY_LABELS[entry.entry.category] ?? entry.entry.category,
      coverImage: entry.entry.coverImage ?? null,
      tags: entry.entry.tags ? [...entry.entry.tags] : [],
    }))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

  return <BlogListClient posts={posts} />
}