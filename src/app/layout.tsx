import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Plus Jakarta Sans was drawn by Tokotype for the city of Jakarta — the
// house face. Source Serif 4 italic carries the few editorial lines
// (service quotes); IBM Plex Mono sets labels, figures and overlines.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.temantumbuh.com"),
  title: {
    default: "Aditya Very Cleverina CFP | Personal Finance Coach | Perencana Keuangan",
    template: "%s | TemanTumbuh",
  },
  description: "Personal finance training, digital products & 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "TemanTumbuh",
    locale: "id_ID",
    url: "https://www.temantumbuh.com",
    title: "Aditya Very Cleverina CFP | Personal Finance Coach | Perencana Keuangan",
    description: "Personal finance training, digital products & 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "google-adsense-account": "ca-pub-6515526325251643",
  },
  icons: {
    icon: [{ url: '/icon_1.png?v=2', type: 'image/png', sizes: '192x192' }],
    shortcut: [{ url: '/icon_1.png?v=2', type: 'image/png' }],
    apple: [{ url: '/icon_1.png?v=2', type: 'image/png', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${jakarta.variable} ${sourceSerif.variable} ${plexMono.variable} font-sans antialiased`}
      >
        <GoogleAnalytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6515526325251643"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
