import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aditya Very Cleverina | Personal Finance Coach",
  description: "Personal finance training, digital products & 1-on-1 sessions that actually make sense — no boring jargon, just real clarity.",
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
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
