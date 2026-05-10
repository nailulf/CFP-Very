'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const HIDDEN_PREFIXES = ['/generate-invoice'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const hide = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (hide) return <main className="min-h-screen">{children}</main>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
