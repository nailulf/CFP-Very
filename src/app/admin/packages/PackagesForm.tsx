'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { PackagePricing } from '@/lib/settings-config';
import { formatIDR } from '@/lib/konsultasi-packages';

type Pkg = { id: keyof PackagePricing; service: string };

export default function PackagesForm({
  packages,
  initialPricing,
}: {
  packages: Pkg[];
  initialPricing: PackagePricing;
}) {
  const [pricing, setPricing] = useState<PackagePricing>(initialPricing);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const setField = (id: keyof PackagePricing, field: 'price' | 'salePrice', raw: string) => {
    const n = raw === '' ? (field === 'salePrice' ? null : 0) : Math.max(0, Math.round(Number(raw)));
    setPricing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: n } }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.message || 'Gagal menyimpan.' });
        return;
      }
      setPricing(data.pricing);
      setMsg({ kind: 'ok', text: 'Tersimpan.' });
    } catch {
      setMsg({ kind: 'err', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#205781] mb-6">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Paket & Harga</h1>

      <div className="space-y-5">
        {packages.map((pkg) => {
          const p = pricing[pkg.id];
          const onSale = p.salePrice != null && p.salePrice < p.price;
          return (
            <div key={pkg.id} className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1A1918]">{pkg.service}</h2>
                <span className="text-sm font-semibold text-[#205781]">
                  {onSale ? (
                    <>
                      <span className="text-[#9C9B99] line-through mr-2">{formatIDR(p.price)}</span>
                      {formatIDR(p.salePrice!)}
                    </>
                  ) : (
                    formatIDR(p.price)
                  )}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Harga (IDR)</span>
                  <input
                    type="number"
                    min={0}
                    value={p.price}
                    onChange={(e) => setField(pkg.id, 'price', e.target.value)}
                    className="w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Harga promo (kosongkan jika tidak ada)</span>
                  <input
                    type="number"
                    min={0}
                    value={p.salePrice ?? ''}
                    onChange={(e) => setField(pkg.id, 'salePrice', e.target.value)}
                    className="w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]"
                  />
                </label>
              </div>
              {p.salePrice != null && p.salePrice >= p.price && (
                <p className="text-[12px] text-[#8C1C00] mt-2">Harga promo harus lebih kecil dari harga normal.</p>
              )}
            </div>
          );
        })}
      </div>

      {msg && (
        <p className={`mt-5 text-sm ${msg.kind === 'ok' ? 'text-[#1B7A3F]' : 'text-[#8C1C00]'}`}>{msg.text}</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving && <Loader2 className="animate-spin" size={18} />}
        Simpan
      </button>
    </div>
  );
}
