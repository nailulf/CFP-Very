import React from 'react'
import { fields } from '@keystatic/core'
import { block, wrapper } from '@keystatic/core/content-components'
import { Play, MessageCircle, Download, Tag, Zap, Quote, Link, AlertCircle } from 'lucide-react'

export const blogBlocks = {
  YouTubeEmbed: block({
    label: 'YouTube Video',
    description: 'Embed a YouTube video by URL',
    icon: <Play size={16} />,
    schema: {
      url: fields.url({ label: 'YouTube URL', validation: { isRequired: true } }),
      caption: fields.text({ label: 'Caption (optional)' }),
    },
    ContentView({ value }) {
      return (
        <div style={{ padding: '10px 14px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>▶️</span>
          <span style={{ fontSize: '13px', color: '#444' }}>{value.url || 'Set YouTube URL…'}</span>
        </div>
      )
    },
  }),

  Callout: wrapper({
    label: 'Callout',
    description: 'Highlighted info, tip, warning, or alert box',
    icon: <MessageCircle size={16} />,
    schema: {
      type: fields.select({
        label: 'Type',
        options: [
          { label: '💡 Tip', value: 'tip' },
          { label: 'ℹ️ Info', value: 'info' },
          { label: '⚠️ Warning', value: 'warning' },
          { label: '✅ Success', value: 'success' },
          { label: '🚨 Danger', value: 'danger' },
        ],
        defaultValue: 'info',
      }),
      title: fields.text({ label: 'Title (optional)' }),
    },
    ContentView({ value, children }) {
      const bgMap: Record<string, string> = {
        tip: '#e8f5e9', info: '#e3f2fd', warning: '#fff8e1', success: '#e8f5e9', danger: '#fce4ec',
      }
      return (
        <div style={{ padding: '12px', background: bgMap[value.type] ?? '#e3f2fd', borderRadius: '8px' }}>
          {value.title && <strong style={{ display: 'block', marginBottom: '4px' }}>{value.title}</strong>}
          {children}
        </div>
      )
    },
  }),

  QuoteBlock: block({
    label: 'Pull Quote',
    description: 'A large stylised pull quote',
    icon: <Quote size={16} />,
    schema: {
      quote: fields.text({ label: 'Quote text', multiline: true, validation: { isRequired: true } }),
      attribution: fields.text({ label: 'Attribution / source (optional)' }),
    },
    ContentView({ value }) {
      return (
        <blockquote style={{ borderLeft: '4px solid #4F9DA6', paddingLeft: '14px', margin: '0', fontStyle: 'italic', color: '#444' }}>
          <p style={{ margin: '0 0 4px' }}>{value.quote || '…'}</p>
          {value.attribution && <cite style={{ fontSize: '12px', color: '#888' }}>— {value.attribution}</cite>}
        </blockquote>
      )
    },
  }),

  DownloadLink: block({
    label: 'Download Button',
    description: 'A download CTA card for files, PDFs, or resources',
    icon: <Download size={16} />,
    schema: {
      title: fields.text({ label: 'Title', validation: { isRequired: true } }),
      description: fields.text({ label: 'Description (optional)', multiline: true }),
      url: fields.url({ label: 'File / Resource URL', validation: { isRequired: true } }),
      buttonText: fields.text({ label: 'Button label', defaultValue: 'Download Gratis' }),
    },
    ContentView({ value }) {
      return (
        <div style={{ padding: '10px 14px', background: '#f0f7fa', borderRadius: '8px', border: '1px solid #e0ebf5' }}>
          <strong style={{ fontSize: '13px' }}>⬇️ {value.title || 'Untitled download'}</strong>
          {value.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>{value.description}</p>}
        </div>
      )
    },
  }),

  AffiliateBanner: block({
    label: 'Affiliate / Ad Banner',
    description: 'Sponsored content or affiliate link card with disclosure',
    icon: <Tag size={16} />,
    schema: {
      title: fields.text({ label: 'Title', validation: { isRequired: true } }),
      description: fields.text({ label: 'Description', multiline: true }),
      url: fields.url({ label: 'Link URL', validation: { isRequired: true } }),
      buttonText: fields.text({ label: 'Button label', defaultValue: 'Pelajari Lebih Lanjut' }),
      badge: fields.text({ label: 'Badge label (e.g. "Partner", "Sponsored")', defaultValue: 'Partner' }),
      disclaimer: fields.text({ label: 'Disclosure text', defaultValue: 'Konten ini mengandung tautan afiliasi.' }),
    },
    ContentView({ value }) {
      return (
        <div style={{ padding: '10px 14px', background: '#fffde7', borderRadius: '8px', border: '1px dashed #f9a825' }}>
          <span style={{ fontSize: '10px', background: '#f9a825', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{value.badge}</span>
          <strong style={{ display: 'block', marginTop: '6px', fontSize: '13px' }}>🔗 {value.title || 'Untitled banner'}</strong>
          {value.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>{value.description}</p>}
        </div>
      )
    },
  }),

  ExternalLink: block({
    label: 'Link Card',
    description: 'A prominent clickable link card (tools, articles, sources)',
    icon: <Link size={16} />,
    schema: {
      label: fields.text({ label: 'Label', validation: { isRequired: true } }),
      description: fields.text({ label: 'Description (optional)', multiline: true }),
      url: fields.url({ label: 'URL', validation: { isRequired: true } }),
    },
    ContentView({ value }) {
      return (
        <div style={{ padding: '10px 14px', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <strong style={{ fontSize: '13px' }}>🔗 {value.label || 'Untitled link'}</strong>
          {value.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>{value.description}</p>}
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>{value.url}</p>
        </div>
      )
    },
  }),

  FinancialCTA: block({
    label: 'Financial CTA',
    description: 'Call-to-action card linking to a financial tool or service',
    icon: <Zap size={16} />,
    schema: {
      heading: fields.text({ label: 'Heading', defaultValue: 'Cek Kesehatan Keuangan Kamu' }),
      body: fields.text({ label: 'Body text', multiline: true, defaultValue: 'Gratis. Tanpa login. Hasil instan.' }),
      buttonText: fields.text({ label: 'Button label', defaultValue: 'Mulai Sekarang →' }),
      href: fields.text({ label: 'Destination URL', defaultValue: '/cek-kesehatan-keuangan' }),
    },
    ContentView({ value }) {
      return (
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #205781, #4F9DA6)', borderRadius: '10px', color: '#fff' }}>
          <strong style={{ display: 'block', fontSize: '13px' }}>⚡ {value.heading}</strong>
          {value.body && <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.9 }}>{value.body}</p>}
        </div>
      )
    },
  }),

  Disclaimer: block({
    label: 'Disclaimer',
    description: 'Legal or educational disclaimer note',
    icon: <AlertCircle size={16} />,
    schema: {
      text: fields.text({
        label: 'Disclaimer text',
        multiline: true,
        defaultValue: 'Konten ini bersifat edukasi umum dan bukan saran keuangan personal. Kondisi tiap orang berbeda, sesuaikan dengan situasi dan prioritas masing-masing.',
      }),
    },
    ContentView({ value }) {
      return (
        <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px', margin: '0' }}>
          ⚠️ {value.text}
        </p>
      )
    },
  }),
}