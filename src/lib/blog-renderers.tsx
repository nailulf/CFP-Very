import type { ReactNode } from 'react'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export function YouTubeEmbed({ url, caption }: { url: string; caption?: string }) {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return (
    <figure className="my-8">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={caption ?? 'YouTube video'}
          className="absolute inset-0 w-full h-full rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-[#9BAFC0] mt-3 font-mono">{caption}</figcaption>
      )}
    </figure>
  )
}

const CALLOUT_THEME: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  tip:     { bg: '#E8F5EE', border: '#1B7A3F', icon: '💡', text: '#1B7A3F' },
  info:    { bg: '#DFDFE6', border: '#000066', icon: 'ℹ️', text: '#000066' },
  warning: { bg: '#FFF8E1', border: '#D97706', icon: '⚠️', text: '#D97706' },
  success: { bg: '#E8F5EE', border: '#1B7A3F', icon: '✅', text: '#1B7A3F' },
  danger:  { bg: '#FFF0EB', border: '#8C1C00', icon: '🚨', text: '#8C1C00' },
}

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: string
  title?: string
  children?: ReactNode
}) {
  const t = CALLOUT_THEME[type] ?? CALLOUT_THEME.info
  return (
    <aside
      className="my-6 rounded-xl p-5 border-l-4"
      style={{ background: t.bg, borderLeftColor: t.border }}
    >
      {title && (
        <p className="font-semibold mb-2 text-sm" style={{ color: t.text }}>
          {t.icon} {title}
        </p>
      )}
      <div className="text-sm leading-relaxed" style={{ color: '#3A5A70' }}>
        {children}
      </div>
    </aside>
  )
}

export function QuoteBlock({
  quote,
  attribution,
}: {
  quote: string
  attribution?: string
}) {
  return (
    <blockquote className="my-8 border-l-4 border-[#4F9DA6] pl-6">
      <p className="text-xl italic font-medium text-[#153A56] leading-relaxed">"{quote}"</p>
      {attribution && (
        <cite className="block mt-3 text-sm text-[#9BAFC0] not-italic font-mono">— {attribution}</cite>
      )}
    </blockquote>
  )
}

export function DownloadLink({
  title,
  description,
  url,
  buttonText = 'Download Gratis',
}: {
  title: string
  description?: string
  url: string
  buttonText?: string
}) {
  return (
    <div className="my-6 bg-[#F0F7FA] rounded-2xl border border-[#E0EBF5] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-[#153A56]">{title}</p>
        {description && <p className="text-sm text-[#666666] mt-1">{description}</p>}
      </div>
      <a
        href={url}
        download
        className="shrink-0 inline-flex items-center gap-2 bg-[#205781] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#153A56] transition-colors"
      >
        ⬇ {buttonText}
      </a>
    </div>
  )
}

export function AffiliateBanner({
  title,
  description,
  url,
  buttonText = 'Pelajari Lebih Lanjut',
  badge = 'Partner',
  disclaimer,
}: {
  title: string
  description?: string
  url: string
  buttonText?: string
  badge?: string
  disclaimer?: string
}) {
  return (
    <div className="my-6 bg-[#FFFDE7] rounded-2xl border border-[#f79d35]/30 p-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#f79d35] text-white rounded px-2 py-0.5 mb-2">
            {badge}
          </span>
          <p className="font-semibold text-[#153A56]">{title}</p>
          {description && <p className="text-sm text-[#666666] mt-1">{description}</p>}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 bg-[#f79d35] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {buttonText}
        </a>
      </div>
      {disclaimer && (
        <p className="text-[10px] text-[#9BAFC0] mt-4 italic">{disclaimer}</p>
      )}
    </div>
  )
}

export function ExternalLink({
  label,
  description,
  url,
}: {
  label: string
  description?: string
  url: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-4 flex items-center gap-4 bg-white rounded-xl border border-[#E0EBF5] p-4 hover:border-[#4F9DA6] hover:shadow-sm transition-all group no-underline"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#205781] text-sm group-hover:text-[#4F9DA6] transition-colors truncate">
          {label}
        </p>
        {description && <p className="text-xs text-[#666666] mt-0.5 truncate">{description}</p>}
        <p className="text-[10px] text-[#9BAFC0] mt-0.5 truncate font-mono">{url}</p>
      </div>
      <span className="text-[#9BAFC0] group-hover:text-[#4F9DA6] transition-colors text-lg shrink-0">→</span>
    </a>
  )
}

export function FinancialCTA({
  heading,
  body,
  buttonText = 'Mulai Sekarang →',
  href = '/cek-kesehatan-keuangan',
}: {
  heading: string
  body?: string
  buttonText?: string
  href?: string
}) {
  return (
    <div className="my-8 rounded-2xl overflow-hidden">
      <div
        className="p-8 text-white text-center"
        style={{ background: 'linear-gradient(180deg, #205781, #4F9DA6)' }}
      >
        <p className="text-xl font-extrabold mb-2 tracking-tight">{heading}</p>
        {body && <p className="text-sm opacity-90 mb-6 max-w-sm mx-auto">{body}</p>}
        <a
          href={href}
          className="inline-block bg-[#f79d35] text-white rounded-full px-7 py-3 font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity no-underline"
        >
          {buttonText}
        </a>
      </div>
    </div>
  )
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="my-6 text-xs text-[#9BAFC0] italic bg-[#F0F7FA] rounded-lg px-4 py-3 border border-[#E0EBF5]">
      * {text}
    </p>
  )
}

export const blockComponents = {
  YouTubeEmbed,
  Callout,
  QuoteBlock,
  DownloadLink,
  AffiliateBanner,
  ExternalLink,
  FinancialCTA,
  Disclaimer,
}