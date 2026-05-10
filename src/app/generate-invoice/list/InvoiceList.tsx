'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Status = 'Unpaid' | 'Paid' | 'Cancelled';

type InvoiceSummary = {
  id: string;
  savedAt: string;
  status: Status;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  clientName: string;
  total: number;
};

const formatCurrency = (n: number, currency: string) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isFinite(n) ? n : 0);

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusStyles: Record<Status, string> = {
  Unpaid: 'bg-amber-100 text-amber-800 border-amber-200',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function InvoiceList({
  userEmail,
  initialInvoices,
  loadError,
}: {
  userEmail: string;
  initialInvoices: InvoiceSummary[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>(initialInvoices);
  const [error, setError] = useState<string | null>(loadError);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/invoice/list', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat ulang.');
      }
      setInvoices(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ulang.');
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    const previous = invoices;
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    setPendingId(id);
    try {
      const res = await fetch(`/api/invoice/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui status.');
      }
    } catch (err) {
      setInvoices(previous);
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status.');
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (id: string, invoiceNumber: string) => {
    if (
      !confirm(
        `Hapus invoice "${invoiceNumber}"? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/invoice/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus invoice.');
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus.');
    } finally {
      setPendingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/invoice-auth/logout', { method: 'POST' });
    router.replace('/generate-invoice/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/generate-invoice"
              className="text-[#6D6C6A] hover:text-[#1A1918]"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1A1918]">Daftar Invoice</h1>
              <p className="text-xs text-[#6D6C6A]">Masuk sebagai {userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/generate-invoice">
              <Button size="sm" variant="outline">
                <Plus size={16} className="mr-2" /> Invoice Baru
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={16} className="mr-2" />
              )}
              Refresh
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Keluar
            </Button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border-t border-red-200 text-red-700 text-sm px-4 sm:px-6 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-10 text-center text-[#6D6C6A] text-sm">
              Belum ada invoice tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <Th>Invoice #</Th>
                    <Th>Tanggal Terbit</Th>
                    <Th>Jatuh Tempo</Th>
                    <Th>Klien</Th>
                    <Th className="text-right">Total</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const isPending = pendingId === inv.id;
                    return (
                      <tr key={inv.id} className="border-b last:border-0">
                        <Td>
                          <Link
                            href={`/generate-invoice/${inv.id}`}
                            className="font-medium text-[#205781] hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </Td>
                        <Td className="text-[#6D6C6A]">
                          {formatDate(inv.issueDate)}
                        </Td>
                        <Td className="text-[#6D6C6A]">
                          {formatDate(inv.dueDate)}
                        </Td>
                        <Td>{inv.clientName || '—'}</Td>
                        <Td className="text-right font-medium">
                          {formatCurrency(inv.total, inv.currency)}
                        </Td>
                        <Td>
                          <select
                            value={inv.status}
                            onChange={(e) =>
                              updateStatus(inv.id, e.target.value as Status)
                            }
                            disabled={isPending}
                            className={`text-xs font-medium rounded-full border px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#205781] disabled:opacity-50 ${
                              statusStyles[inv.status]
                            }`}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <Link
                            href={`/generate-invoice/${inv.id}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#205781] hover:bg-[#E0EFF5]"
                            aria-label="Buka"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => remove(inv.id, inv.invoiceNumber)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                            aria-label="Hapus"
                          >
                            {isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-[#6D6C6A] uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
