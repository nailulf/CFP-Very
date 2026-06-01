import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aditya Very Cleverina CFP | Personal Finance Coach | Perencana Keuangan",
  description: "Personal finance training, digital products & 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.",
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
    <html lang="en" className="scroll-smooth">
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
