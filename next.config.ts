import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Include Keystatic content files in every serverless-function bundle so
  // the reader can access them at runtime (belt-and-suspenders alongside
  // static generation — covers ISR and any dynamic fallback routes).
  outputFileTracingIncludes: {
    '/blog': ['./content/**/*'],
    '/blog/[slug]': ['./content/**/*'],
  },
}

export default nextConfig
