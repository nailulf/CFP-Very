import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
      <body className={`${outfit.variable} font-sans antialiased`}>
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
