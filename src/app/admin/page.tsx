import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, Wallet, CalendarRange, FileText } from 'lucide-react';
import { getInvoiceSession } from '@/lib/invoice-auth';

export const metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

const CARDS = [
  { href: '/admin/bookings', title: 'Booking', desc: 'Lihat & kelola pesanan konsultasi.', Icon: CalendarClock },
  { href: '/admin/packages', title: 'Paket & Harga', desc: 'Ubah harga dan harga promo paket.', Icon: Wallet },
  { href: '/admin/availability', title: 'Jadwal Tersedia', desc: 'Atur hari, jam, dan tanggal libur.', Icon: CalendarRange },
  { href: '/admin/invoice/list', title: 'Invoice', desc: 'Buat dan kelola invoice klien.', Icon: FileText },
];

export default async function AdminHome() {
  const session = await getInvoiceSession();
  if (!session) redirect('/admin/login?next=/admin');

  return (
    <main className="bg-[#F0F7FA] min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1A1918]">Admin Dashboard</h1>
        <p className="text-[#666666] mt-1 mb-10">Masuk sebagai {session.email}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CARDS.map(({ href, title, desc, Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7 hover:border-[#205781] transition-colors"
            >
              <Icon className="text-[#205781]" size={28} />
              <h2 className="text-lg font-bold text-[#1A1918] mt-4">{title}</h2>
              <p className="text-sm text-[#666666] mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
