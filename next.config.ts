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
  // Tell Vercel's bundler to include the Keystatic content directory
  // in every serverless function. Without this, process.cwd()+'/content/**'
  // paths are not traced and the reader returns empty results in production.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*', './keystatic.config.tsx'],
  },
}

export default nextConfig