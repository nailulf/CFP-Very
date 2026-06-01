import { config, collection, fields } from '@keystatic/core'
import { blogBlocks } from './src/lib/blog-blocks'

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'CFP Very — Blog CMS',
    },
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Title', description: 'Judul artikel blog' },
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Ringkasan singkat artikel (ditampilkan di listing)',
          multiline: true,
          validation: { isRequired: true },
        }),
        publishedAt: fields.date({
          label: 'Published Date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'Aditya V.C.',
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Manajemen Kekayaan', value: 'manajemen-kekayaan' },
            { label: 'Perencanaan Pajak', value: 'perencanaan-pajak' },
            { label: 'Investasi', value: 'investasi' },
            { label: 'Psikologi', value: 'psikologi' },
            { label: 'Pensiun', value: 'pensiun' },
          ],
          defaultValue: 'manajemen-kekayaan',
        }),
        published: fields.checkbox({
          label: 'Published',
          description: 'Centang untuk mempublikasikan artikel. Hapus centang untuk menyimpan sebagai draft.',
          defaultValue: false,
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/blog',
              publicPath: '/images/blog',
            },
          },
          components: blogBlocks,
        }),
      },
    }),
  },
})