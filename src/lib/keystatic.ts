import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'

export const reader = createReader(process.cwd(), keystaticConfig)

export const CATEGORY_LABELS: Record<string, string> = {
  'manajemen-kekayaan': 'Manajemen Kekayaan',
  'perencanaan-pajak': 'Perencanaan Pajak',
  'investasi': 'Investasi',
  'psikologi': 'Psikologi',
  'pensiun': 'Pensiun',
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}