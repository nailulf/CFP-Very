import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Generator | Internal',
  robots: { index: false, follow: false },
};

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="invoice-root">{children}</div>;
}
