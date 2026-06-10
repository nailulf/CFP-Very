import { MetadataRoute } from 'next'
import { reader } from '@/lib/keystatic'

const BASE_URL = 'https://www.temantumbuh.com'

// Statically generated at build time alongside the blog pages.
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static, indexable routes.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/financial-health-check`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/kebijakan-privasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Published blog posts — drafts (published === false) are excluded.
  const entries = await reader.collections.blog.all()
  const blogRoutes: MetadataRoute.Sitemap = entries
    .filter(entry => entry.entry.published)
    .map(entry => ({
      url: `${BASE_URL}/blog/${entry.slug}`,
      lastModified: entry.entry.publishedAt ? new Date(entry.entry.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...staticRoutes, ...blogRoutes]
}
