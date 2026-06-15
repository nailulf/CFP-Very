'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import type { BookingAvailability } from '@/lib/booking-availability';

const WEEKDAYS = [
  { n: 1, label: 'Sen' }, { n: 2, label: 'Sel' }, { n: 3, label: 'Rab' },
  { n: 4, label: 'Kam' }, { n: 5, label: 'Jum' }, { n: 6, label: 'Sab' }, { n: 0, label: 'Min' },
];

const numField = 'w-full h-[48px] px-3 bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#f79d35]';

export default function AvailabilityForm({ initial }: { initial: BookingAvailability }) {
  const [cfg, setCfg] = useState<BookingAvailability>(initial);
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const setNum = (k: keyof BookingAvailability, v: string) =>
    setCfg((c) => ({ ...c, [k]: Math.max(0, Math.round(Number(v) || 0)) }));

  const toggleWeekday = (n: number) =>
    setCfg((c) => ({
      ...c,
      weekdays: c.weekdays.includes(n) ? c.weekdays.filter((d) => d !== n) : [...c.weekdays, n].sort(),
    }));

  const addBlackout = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate) && !cfg.blackoutDates.includes(newDate)) {
      setCfg((c) => ({ ...c, blackoutDates: [...c.blackoutDates, newDate].sort() }));
      setNewDate('');
    }
  };
  const removeBlackout = (d: string) =>
    setCfg((c) => ({ ...c, blackoutDates: c.blackoutDates.filter((x) => x !== d) }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ kind: 'err', text: data.message || 'Gagal menyimpan.' });
        return;
      }
      setCfg(data.availability);
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
      <h1 className="text-2xl font-extrabold text-[#1A1918] mb-6">Jadwal Tersedia</h1>

      <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6 space-y-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg((c) => ({ ...c, enabled: e.target.checked }))} />
          <span className="font-semibold text-[#1A1918]">Booking dibuka</span>
        </label>

        <div>
          <span className="block text-[13px] font-semibold text-[#3A5A70] mb-2">Hari kerja</span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((w) => (
              <button
                key={w.n}
                type="button"
                onClick={() => toggleWeekday(w.n)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  cfg.weekdays.includes(w.n)
                    ? 'bg-[#205781] text-white border-[#205781]'
                    : 'bg-white text-[#666666] border-[#CBDCEA]'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Jam mulai (0–23)</span>
            <input type="number" min={0} max={23} value={cfg.startHour} onChange={(e) => setNum('startHour', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Jam selesai (1–24)</span>
            <input type="number" min={1} max={24} value={cfg.endHour} onChange={(e) => setNum('endHour', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Durasi sesi (menit)</span>
            <input type="number" min={1} value={cfg.slotMinutes} onChange={(e) => setNum('slotMinutes', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Lead time (hari)</span>
            <input type="number" min={0} value={cfg.leadTimeDays} onChange={(e) => setNum('leadTimeDays', e.target.value)} className={numField} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#3A5A70] mb-1">Horizon (hari)</span>
            <input type="number" min={1} value={cfg.horizonDays} onChange={(e) => setNum('horizonDays', e.target.value)} className={numField} />
          </label>
        </div>

        <div>
          <span className="block text-[13px] font-semibold text-[#3A5A70] mb-2">Tanggal libur (blackout)</span>
          <div className="flex gap-2 mb-3">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={`${numField} max-w-[200px]`} />
            <button type="button" onClick={addBlackout} className="rounded-full bg-[#205781] text-white px-4 font-semibold text-sm">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cfg.blackoutDates.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 bg-[#E0EBF5] text-[#205781] rounded-full px-3 py-1 text-sm">
                {d}
                <button type="button" onClick={() => removeBlackout(d)} aria-label={`Hapus ${d}`}><X size={14} /></button>
              </span>
            ))}
            {cfg.blackoutDates.length === 0 && <span className="text-sm text-[#9C9B99]">Tidak ada.</span>}
          </div>
        </div>
      </div>

      {msg && <p className={`mt-5 text-sm ${msg.kind === 'ok' ? 'text-[#1B7A3F]' : 'text-[#8C1C00]'}`}>{msg.text}</p>}

      <button onClick={save} disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white disabled:opacity-60">
        {saving && <Loader2 className="animate-spin" size={18} />}
        Simpan
      </button>
    </div>
  );
}
