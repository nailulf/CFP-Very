'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LanguageProvider } from '@/lib/lang-context';

const HIDDEN_PREFIXES = ['/generate-invoice', '/keystatic'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const hide = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <LanguageProvider>
      {hide ? (
        <main className="min-h-screen">{children}</main>
      ) : (
        <>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </>
      )}
    </LanguageProvider>
  );
}
