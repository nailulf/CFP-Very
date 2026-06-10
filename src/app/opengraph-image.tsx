import { ImageResponse } from 'next/og'

// Default social-share card, inherited by every route that doesn't define
// its own opengraph image (e.g. blog posts without a coverImage).
export const alt = 'TemanTumbuh — Perencana Keuangan & Personal Finance Coach'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundImage:
            'linear-gradient(135deg, #153A56 0%, #205781 55%, #4F9DA6 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top row — brand + overline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              backgroundColor: '#f79d35',
              color: '#153A56',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              padding: '10px 22px',
              borderRadius: 999,
            }}
          >
            PERENCANA KEUANGAN
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            TemanTumbuh
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: '#E0EBF5',
              marginTop: 18,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Edukasi & pendampingan keuangan yang masuk akal — tanpa jargon, cuma
            kejelasan.
          </div>
        </div>

        {/* Bottom row — domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: '#f79d35',
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF' }}>
            temantumbuh.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
