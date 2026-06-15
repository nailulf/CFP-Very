'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import type { Booking } from '@/lib/konsultasi-store';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Lunas' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Dikembalikan' },
] as const;

const STATUS_STYLE: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
};

const fmtIDR = (raw: string) => {
  const n = Number(raw);
  return Number.isFinite(n) && raw !== '' ? `Rp${n.toLocaleString('id-ID')}` : raw;
};

export default function BookingsTable({
  initial,
  initialError,
}: {
  initial: Booking[];
  initialError: string | null;
}) {
  const [rows, setRows] = useState<Booking[]>(initial);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal memuat.');
        return;
      }
      setRows(data.bookings);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setRefreshing(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    const prev = rows;
    setPendingId(id);
    setRows((r) => r.map((b) => (b.id === id ? { ...b, paymentStatus: status } : b)));
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRows(prev);
        setError(data.message || 'Gagal memperbarui status.');
      }
    } catch {
      setRows(prev);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#205781]">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <button onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 text-sm font-semibold text-[#205781]">
          {refreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Muat ulang
        </button>
      </div>
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Booking</h1>

      {error && <p className="mb-4 text-sm text-[#8C1C00] bg-[#FFF0EB] border border-[#f5c4b4] rounded-lg px-3 py-2">{error}</p>}

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0EBF5] p-10 text-center text-[#666666]">Belum ada booking.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0EBF5] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#666666] border-b border-[#E0EBF5]">
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Paket</th>
                <th className="px-4 py-3 font-semibold">Jadwal</th>
                <th className="px-4 py-3 font-semibold">Topik</th>
                <th className="px-4 py-3 font-semibold">Nilai</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-[#F0F7FA] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1A1918]">{b.name}</div>
                    <div className="text-[#9C9B99]">{b.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#1A1918]">{b.service}</td>
                  <td className="px-4 py-3 text-[#1A1918]">{b.date ? `${b.date} ${b.time ?? ''}` : b.bookingDate}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate text-[#666666]" title={b.topic}>{b.topic}</td>
                  <td className="px-4 py-3 text-[#1A1918]">{fmtIDR(b.amount)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={STATUS_OPTIONS.some((o) => o.value === b.paymentStatus) ? b.paymentStatus : 'pending_payment'}
                      onChange={(e) => changeStatus(b.id, e.target.value)}
                      disabled={pendingId === b.id}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[b.paymentStatus] ?? STATUS_STYLE.pending_payment}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
