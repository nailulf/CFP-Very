'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, CheckCircle2, Zap, Star,
  Phone, RotateCcw, Landmark, PiggyBank,
  TrendingDown, Scale, TrendingUp, ShieldCheck,
  Lightbulb, Rocket, Lock, ArrowRight, Wallet,
} from 'lucide-react';
import { FormData, RatioStatus, HealthCheckResults } from './lib/types';
import {
  computeHealthCheckResults,
  computeTotalMonthlyIncome,
  computeTotalMonthlyExpenses,
  computeTotalAssets,
  computeTotalLiabilities,
  getTopRecommendations,
} from './lib/calculations';

// ─── Constants ────────────────────────────────────────────────────────────────

const INVESTMENT_PRODUCTS = [
  'Deposito', 'Reksadana', 'Saham', 'Obligasi/SBN',
  'Emas/Logam Mulia', 'P2P Lending', 'Properti Investasi', 'Belum punya',
];

const STEP_LABELS = ['Profil', 'Penghasilan', 'Pengeluaran', 'Tabungan', 'Aset', 'Utang', 'Asuransi'];

const STEP_TITLES: Record<number, string> = {
  1: 'Profil Diri',
  2: 'Penghasilan Bulanan',
  3: 'Pengeluaran Bulanan',
  4: 'Tabungan & Investasi',
  5: 'Aset',
  6: 'Utang / Liabilitas',
  7: 'Asuransi & Proteksi',
};

const STEP_SUBTITLES: Record<number, string> = {
  1: 'Beberapa info dasar untuk memahami situasi keuanganmu.',
  2: 'Masukkan semua sumber penghasilanmu per bulan.',
  3: 'Estimasi pengeluaran rutinmu per bulan.',
  4: 'Berapa yang kamu sisihkan dan sudah kamu kumpulkan.',
  5: 'Nilai total aset yang kamu miliki saat ini.',
  6: 'Sisa total utang yang masih harus dilunasi.',
  7: 'Apakah kamu sudah terlindungi dengan baik?',
};

const INITIAL_FORM: FormData = {
  A: { age: '', maritalStatus: '', dependents: '', jobStatus: '' },
  B: { primaryIncome: 0, sideIncome: 0, passiveIncome: 0 },
  C: { basicNeeds: 0, transportation: 0, debtPayment: 0, insurancePremium: 0, otherExpenses: 0 },
  D: { monthlySavings: 0, totalSavings: 0, totalInvestments: 0, investmentProducts: [] },
  E: { propertyValue: 0, vehicleValue: 0, otherAssets: 0 },
  F: { mortgageDebt: 0, vehicleDebt: 0, creditCardDebt: 0, otherDebt: 0 },
  G: { healthInsurance: '', hasLifeInsurance: '', lifeCoverage: 0 },
};

// ─── Status Theme ─────────────────────────────────────────────────────────────

const STATUS_THEME: Record<RatioStatus, {
  panel: string; valueText: string;
  badge: string; badgeText: string; iconBg: string;
  label: string;
}> = {
  green: {
    panel: 'bg-[#E8F5EE]', valueText: 'text-[#1B7A3F]',
    badge: 'bg-[#E8F5EE]', badgeText: 'text-[#1B7A3F]', iconBg: 'bg-[#E8F5EE]',
    label: 'Sehat',
  },
  yellow: {
    panel: 'bg-[#FFF8E1]', valueText: 'text-[#C8960C]',
    badge: 'bg-[#FFF8E1]', badgeText: 'text-[#7A6000]', iconBg: 'bg-[#FFF8E1]',
    label: 'Cukup',
  },
  red: {
    panel: 'bg-[#FFF0EB]', valueText: 'text-[#C0451A]',
    badge: 'bg-[#FFF0EB]', badgeText: 'text-[#8C1C00]', iconBg: 'bg-[#FFF0EB]',
    label: 'Perlu Naik',
  },
};

type LucideIcon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

const SCORE_ICON: Record<string, LucideIcon> = {
  'Sangat Sehat': Star,
  'Sehat': CheckCircle2,
  'Cukup': Zap,
  'Perlu Perhatian': AlertTriangle,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('id-ID');
}

function parseRupiah(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, '');
  return cleaned === '' ? 0 : parseInt(cleaned, 10);
}

// ─── Input Primitives ─────────────────────────────────────────────────────────

const inputBase =
  'w-full h-[48px] px-[14px] rounded-[10px] bg-[#F5F8FC] border border-[#CBDCEA] text-[14px] text-[#1A1918] placeholder:text-[#BBBBBB] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition-colors';

interface CurrencyInputProps {
  label: string; hint?: string;
  value: number; onChange: (v: number) => void;
  autoFilled?: boolean;
}

function CurrencyInput({ label, hint, value, onChange, autoFilled = false }: CurrencyInputProps) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const displayValue = focused ? raw : value > 0 ? formatRupiah(value) : '';

  function handleFocus() { setFocused(true); setRaw(value > 0 ? String(value) : ''); }
  function handleBlur() { setFocused(false); onChange(parseRupiah(raw)); setRaw(''); }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, '');
    setRaw(digits);
    onChange(parseRupiah(digits));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#3A5A70]">{label}</label>
      <p className={`text-[11px] leading-none min-h-[14px] ${hint ? 'text-[#9BAFC0]' : 'invisible'}`}>{hint}</p>
      <div className="relative">
        <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#9BAFC0] pointer-events-none">Rp</span>
        <input
          type="text" inputMode="numeric"
          value={displayValue}
          readOnly={autoFilled}
          onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange}
          placeholder="0"
          className={`${inputBase} pl-[38px] ${autoFilled ? 'bg-[#EEF4FA] border-[#4F9DA6] text-[#205781] font-medium cursor-default' : ''}`}
        />
      </div>
    </div>
  );
}

interface SelectInputProps {
  label: string; hint?: string;
  value: string; options: string[];
  onChange: (v: string) => void;
}

function SelectInput({ label, hint, value, options, onChange }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#3A5A70]">{label}</label>
      <p className={`text-[11px] leading-none min-h-[14px] ${hint ? 'text-[#9BAFC0]' : 'invisible'}`}>{hint}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} appearance-none`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239BAFC0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '36px',
        }}
      >
        <option value="">— Pilih —</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

interface NumberInputProps {
  label: string; hint?: string;
  value: number | ''; min?: number; max?: number;
  onChange: (v: number | '') => void;
}

function NumberInput({ label, hint, value, min, max, onChange }: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#3A5A70]">{label}</label>
      <p className={`text-[11px] leading-none min-h-[14px] ${hint ? 'text-[#9BAFC0]' : 'invisible'}`}>{hint}</p>
      <input
        type="number" value={value} min={min} max={max} placeholder="0"
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className={inputBase}
      />
    </div>
  );
}

interface RadioGroupProps {
  label: string; hint?: string;
  value: string; options: string[];
  onChange: (v: string) => void;
}

function RadioGroup({ label, hint, value, options, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-[#3A5A70]">{label}</label>
      {hint && <p className="text-[11px] text-[#9BAFC0] leading-none">{hint}</p>}

      <div className="flex flex-wrap gap-2 mt-0.5">
        {options.map((opt) => (
          <button
            key={opt} type="button" onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
              value === opt
                ? 'bg-[#D97706] text-white border-[#D97706]'
                : 'bg-white text-[#3A5A70] border-[#CBDCEA] hover:border-[#D97706]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="w-full overflow-x-auto pb-1 mt-3">
      <div className="flex items-start mx-auto" style={{ width: 'max-content', minWidth: '100%', justifyContent: 'center' }}>
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = num === current;
          const isDone = num < current;
          const hi = isActive || isDone;
          return (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                  hi ? 'bg-[#D97706]' : 'bg-[#DDEAF5] border-[1.5px] border-[#C0D5E8]'
                }`}>
                  <span className={hi ? 'text-white' : 'text-[#7A9AB5]'}>{num}</span>
                </div>
                <span className={`text-[10px] font-bold leading-none ${hi ? 'text-[#D97706]' : 'text-[#9BAFC0]'}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 w-10 sm:w-16 mt-4 mx-1 shrink-0 transition-colors ${isDone ? 'bg-[#D97706]' : 'bg-[#DDEAF5]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hero (Form Page) ─────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section style={{ background: 'linear-gradient(180deg, #153A56 0%, #205781 100%)' }}>
      <div className="max-w-screen-xl mx-auto px-5 sm:px-20 py-14 sm:py-20 flex flex-col gap-5">
        <h1 className="text-[36px] sm:text-[56px] font-extrabold text-white leading-[1.1] tracking-[-1px]">
          Financial Health Check
        </h1>
        <p className="text-[12px] sm:text-[16px] text-white/80 max-w-xl leading-relaxed">
          Answer a few quick questions about your finances and get an instant snapshot of your financial health — cashflow, savings, and debt. No judgment, just clarity.
        </p>
        <div className="flex gap-10 sm:gap-12 pt-4">
          {[
            { value: '2 min', label: 'Quick Assessment' },
            { value: '100%', label: 'Free & Private' },
            { value: 'Instant', label: 'Results' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-[24px] sm:text-[28px] font-extrabold text-[#D97706]">{s.value}</span>
              <span className="text-[13px] text-white">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Step Content Components ──────────────────────────────────────────────────

interface StepProps {
  form: FormData;
  setA: (p: Partial<FormData['A']>) => void;
  setB: (p: Partial<FormData['B']>) => void;
  setC: (p: Partial<FormData['C']>) => void;
  setD: (p: Partial<FormData['D']>) => void;
  setE: (p: Partial<FormData['E']>) => void;
  setF: (p: Partial<FormData['F']>) => void;
  setG: (p: Partial<FormData['G']>) => void;
}

const G2 = 'grid grid-cols-1 sm:grid-cols-2 sm:items-start gap-5';

function Step1({ form, setA }: StepProps) {
  return (
    <div className={G2}>
      <NumberInput
        label="Usia" hint="Antara 17–70 tahun"
        value={form.A.age} min={17} max={70}
        onChange={(v) => setA({ age: v })}
      />
      <SelectInput
        label="Status Pernikahan"
        value={form.A.maritalStatus}
        options={['Lajang', 'Menikah', 'Cerai']}
        onChange={(v) => setA({ maritalStatus: v as FormData['A']['maritalStatus'] })}
      />
      <NumberInput
        label="Jumlah Tanggungan" hint="Anak, orang tua, dll."
        value={form.A.dependents} min={0} max={10}
        onChange={(v) => setA({ dependents: v })}
      />
      <SelectInput
        label="Status Pekerjaan"
        value={form.A.jobStatus}
        options={['Karyawan', 'PNS-TNI-Polri', 'Wirausaha', 'Freelancer', 'Belum Bekerja']}
        onChange={(v) => setA({ jobStatus: v as FormData['A']['jobStatus'] })}
      />
    </div>
  );
}

function Step2({ form, setB }: StepProps) {
  const total = computeTotalMonthlyIncome(form);
  return (
    <div className="flex flex-col gap-5">
      {/* 3 fields → B1+B2 in row 1, B3 alone at half-width in row 2 */}
      <div className={G2}>
        <CurrencyInput
          label="Gaji / Penghasilan Utama per Bulan"
          value={form.B.primaryIncome} onChange={(v) => setB({ primaryIncome: v })}
        />
        <CurrencyInput
          label="Pendapatan Sampingan per Bulan" hint="Kosongkan jika tidak ada"
          value={form.B.sideIncome} onChange={(v) => setB({ sideIncome: v })}
        />
        <CurrencyInput
          label="Pendapatan Pasif per Bulan" hint="Sewa, dividen, dll."
          value={form.B.passiveIncome} onChange={(v) => setB({ passiveIncome: v })}
        />
      </div>
      {total > 0 && (
        <div className="rounded-[10px] bg-[#EEF4FA] border border-[#CBDCEA] px-4 py-3 text-[13px] font-semibold text-[#205781]">
          Total Penghasilan: Rp {total.toLocaleString('id-ID')} / bulan
        </div>
      )}
    </div>
  );
}

function Step3({ form, setC }: StepProps) {
  const totalIncome = computeTotalMonthlyIncome(form);
  const totalExpenses = computeTotalMonthlyExpenses(form);
  const overflow = totalIncome > 0 && totalExpenses > totalIncome;
  return (
    <div className="flex flex-col gap-5">
      {/* 5 fields → C1+C2, C3+C4, C5 alone at half-width */}
      <div className={G2}>
        <CurrencyInput
          label="Kebutuhan Pokok" hint="Makan, listrik, air, internet"
          value={form.C.basicNeeds} onChange={(v) => setC({ basicNeeds: v })}
        />
        <CurrencyInput
          label="Transportasi"
          value={form.C.transportation} onChange={(v) => setC({ transportation: v })}
        />
        <CurrencyInput
          label="Cicilan Utang per Bulan" hint="KPR, KKB, kartu kredit, pinjaman"
          value={form.C.debtPayment} onChange={(v) => setC({ debtPayment: v })}
        />
        <CurrencyInput
          label="Premi Asuransi per Bulan"
          value={form.C.insurancePremium} onChange={(v) => setC({ insurancePremium: v })}
        />
        <CurrencyInput
          label="Pengeluaran Lainnya" hint="Hiburan, sedekah, pendidikan, dll."
          value={form.C.otherExpenses} onChange={(v) => setC({ otherExpenses: v })}
        />
      </div>
      {totalExpenses > 0 && (
        <div className={`rounded-[10px] px-4 py-3 text-[13px] font-semibold border ${
          overflow
            ? 'bg-[#FFF0EB] border-[#F0A090] text-[#C0451A]'
            : 'bg-[#EEF4FA] border-[#CBDCEA] text-[#205781]'
        }`}>
          Total Pengeluaran: Rp {totalExpenses.toLocaleString('id-ID')} / bulan
          {overflow && (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-normal mt-0.5">
              <AlertTriangle size={12} strokeWidth={2.5} className="shrink-0" />
              Pengeluaranmu melebihi penghasilan. Ini perlu diperhatikan segera.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Step4({ form, setD }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 3 currency fields → D1+D2, D3 alone at half-width */}
      <div className={G2}>
        <CurrencyInput
          label="Jumlah yang Ditabung + Diinvestasikan per Bulan"
          value={form.D.monthlySavings} onChange={(v) => setD({ monthlySavings: v })}
        />
        <CurrencyInput
          label="Total Nilai Tabungan Saat Ini" hint="Semua rekening bank"
          value={form.D.totalSavings} onChange={(v) => setD({ totalSavings: v })}
        />
        <CurrencyInput
          label="Total Nilai Investasi Saat Ini" hint="Reksadana, saham, emas, dll."
          value={form.D.totalInvestments} onChange={(v) => setD({ totalInvestments: v })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-[#3A5A70]">Produk Investasi yang Dimiliki</label>
        <p className="text-[11px] text-[#9BAFC0]">Pilih semua yang berlaku</p>
        <div className="flex flex-wrap gap-2 mt-0.5">
          {INVESTMENT_PRODUCTS.map((prod) => {
            const selected = form.D.investmentProducts.includes(prod);
            return (
              <button
                key={prod} type="button"
                onClick={() => {
                  let next: string[];
                  if (prod === 'Belum punya') {
                    next = selected ? [] : ['Belum punya'];
                  } else {
                    const withoutBelumPunya = form.D.investmentProducts.filter((p) => p !== 'Belum punya');
                    next = selected
                      ? withoutBelumPunya.filter((p) => p !== prod)
                      : [...withoutBelumPunya, prod];
                  }
                  setD({ investmentProducts: next });
                }}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  selected
                    ? 'bg-[#D97706] text-white border-[#D97706]'
                    : 'bg-white text-[#3A5A70] border-[#CBDCEA] hover:border-[#D97706]'
                }`}
              >
                {prod}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step5({ form, setE }: StepProps) {
  const total = computeTotalAssets(form);
  return (
    <div className="flex flex-col gap-5">
      {/* 5 fields → E1+E2 (auto), E3+E4, E5 alone at half-width */}
      <div className={G2}>
        <CurrencyInput label="Kas & Tabungan" hint="Otomatis terisi dari langkah sebelumnya" value={form.D.totalSavings} onChange={() => {}} autoFilled />
        <CurrencyInput label="Nilai Investasi" hint="Otomatis terisi dari langkah sebelumnya" value={form.D.totalInvestments} onChange={() => {}} autoFilled />
        <CurrencyInput
          label="Nilai Properti" hint="Rumah, tanah, bangunan"
          value={form.E.propertyValue} onChange={(v) => setE({ propertyValue: v })}
        />
        <CurrencyInput
          label="Nilai Kendaraan"
          value={form.E.vehicleValue} onChange={(v) => setE({ vehicleValue: v })}
        />
        <CurrencyInput
          label="Aset Lainnya" hint="Perhiasan, koleksi, dll."
          value={form.E.otherAssets} onChange={(v) => setE({ otherAssets: v })}
        />
      </div>
      {total > 0 && (
        <div className="rounded-[10px] bg-[#EEF4FA] border border-[#CBDCEA] px-4 py-3 text-[13px] font-semibold text-[#205781]">
          Total Aset: Rp {total.toLocaleString('id-ID')}
        </div>
      )}
    </div>
  );
}

function Step6({ form, setF }: StepProps) {
  const total = computeTotalLiabilities(form);
  return (
    <div className="flex flex-col gap-5">
      {/* 4 fields (even) → F1+F2, F3+F4 */}
      <div className={G2}>
        <CurrencyInput
          label="Sisa KPR / Kredit Properti"
          value={form.F.mortgageDebt} onChange={(v) => setF({ mortgageDebt: v })}
        />
        <CurrencyInput
          label="Sisa Kredit Kendaraan"
          value={form.F.vehicleDebt} onChange={(v) => setF({ vehicleDebt: v })}
        />
        <CurrencyInput
          label="Sisa Utang Kartu Kredit"
          value={form.F.creditCardDebt} onChange={(v) => setF({ creditCardDebt: v })}
        />
        <CurrencyInput
          label="Sisa Pinjaman Lainnya" hint="KTA, pinjol, pinjaman keluarga"
          value={form.F.otherDebt} onChange={(v) => setF({ otherDebt: v })}
        />
      </div>
      {total > 0 && (
        <div className="rounded-[10px] bg-[#EEF4FA] border border-[#CBDCEA] px-4 py-3 text-[13px] font-semibold text-[#205781]">
          Total Utang: Rp {total.toLocaleString('id-ID')}
        </div>
      )}
    </div>
  );
}

function Step7({ form, setG }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <RadioGroup
        label="Apakah kamu punya asuransi kesehatan?"
        value={form.G.healthInsurance}
        options={['BPJS saja', 'BPJS + Swasta', 'Swasta saja', 'Tidak punya']}
        onChange={(v) => setG({ healthInsurance: v as FormData['G']['healthInsurance'] })}
      />
      <RadioGroup
        label="Apakah kamu punya asuransi jiwa?"
        value={form.G.hasLifeInsurance}
        options={['Ya', 'Tidak']}
        onChange={(v) => setG({
          hasLifeInsurance: v as 'Ya' | 'Tidak',
          lifeCoverage: v === 'Tidak' ? 0 : form.G.lifeCoverage,
        })}
      />
      {form.G.hasLifeInsurance === 'Ya' && (
        <CurrencyInput
          label="Total Uang Pertanggungan (UP) Asuransi Jiwa"
          hint="Nilai UP yang tertera di polis"
          value={form.G.lifeCoverage} onChange={(v) => setG({ lifeCoverage: v })}
        />
      )}
    </div>
  );
}

// ─── Results: Score Hero ──────────────────────────────────────────────────────

function ScoreHero({ results }: { results: HealthCheckResults }) {
  const ScoreIcon = SCORE_ICON[results.overallLabel] ?? Zap;
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section style={{ background: 'linear-gradient(180deg, #153A56 0%, #1E5070 100%)' }}>
      {/* Top banner */}
      <div className="w-full bg-[#D9770618] px-5 py-3 text-center">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#D97706]">
          <CheckCircle2 size={14} strokeWidth={2.5} />
          Analisis Selesai — Hasil Kesehatan Keuanganmu Sudah Siap!
        </span>
      </div>

      {/* Score content */}
      <div className="max-w-screen-xl mx-auto px-5 sm:px-20 py-14 sm:py-[56px] flex flex-col gap-4">
        <p className="text-[16px] font-semibold text-white">Skor Kesehatan Keuanganmu</p>

        {/* Big number */}
        <div className="flex items-end gap-3">
          <span className="text-[80px] sm:text-[112px] font-extrabold text-[#D97706] leading-none tracking-[-4px]">
            {Math.round(results.overallScore)}
          </span>
          <span className="text-[28px] sm:text-[32px] font-semibold text-white/45 mb-3">/ 100</span>
        </div>

        {/* Status pill */}
        <div className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9770625]">
          <ScoreIcon size={16} strokeWidth={2.5} className="text-[#D97706] shrink-0" />
          <span className="text-[15px] font-bold text-[#D97706]">
            {results.overallLabel} — {results.overallMessage}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2 mt-2 max-w-[580px] w-full">
          <div className="relative h-[10px] w-full rounded-full bg-white/[0.18] overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#f79d35] transition-all duration-700"
              style={{ width: `${results.overallScore}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/40">0 — Kritis</span>
            <span className="text-[11px] text-white/40">Sangat Sehat — 100</span>
          </div>
        </div>

        <p className="text-[13px] text-white/60 mt-1">Dianalisis: {today}</p>
      </div>
    </section>
  );
}

// ─── Results: CTA Strip ───────────────────────────────────────────────────────

function CTAStrip() {
  return (
    <section className="bg-[#f79d35] px-5 sm:px-20 py-7">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-extrabold text-white">Mau tau langkah konkret selanjutnya?</p>
          <p className="text-[13px] text-white">Diskusi gratis 30 menit bersama perencana keuangan tersertifikasi CFP®</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#D97706] text-[14px] font-extrabold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            <Phone size={15} strokeWidth={2.5} />
            Jadwalkan Konsultasi
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FitText ──────────────────────────────────────────────────────────────────

function FitText({ text, className, maxSize = 36, minSize = 10 }: {
  text: string; className?: string; maxSize?: number; minSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lo = minSize, hi = maxSize, best = minSize;
    while (lo <= hi) {
      const mid = Math.ceil((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;
      if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) {
        best = mid; lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    el.style.fontSize = '';
    setFontSize(best);
  }, [text, maxSize, minSize]);

  return (
    <div
      ref={ref}
      style={{ fontSize: `${fontSize}px` }}
      className={`w-full h-full overflow-hidden flex items-center justify-center text-center break-words leading-tight ${className ?? ''}`}
    >
      {text}
    </div>
  );
}

// ─── Results: Ratio Card ──────────────────────────────────────────────────────

interface RatioCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  result: { displayValue: string; status: RatioStatus };
}

function RatioCard({ icon: Icon, name, description, result }: RatioCardProps) {
  const theme = STATUS_THEME[result.status];
  return (
    <div className="flex bg-white rounded-2xl border border-[#DDE9F5] overflow-hidden h-[120px]"
      style={{ boxShadow: '0 2px 16px 0 rgba(21,58,86,0.04)' }}>
      {/* Left: content */}
      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        {/* Icon + name */}
        <div className="flex items-center gap-2">
          <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
            <Icon size={15} strokeWidth={2} className={theme.valueText} />
          </div>
          <span className="text-[13px] font-bold text-[#153A56] leading-tight">{name}</span>
        </div>
        {/* Description */}
        <p className="text-[11px] text-[#888888] leading-[1.45]">{description}</p>
        {/* Status badge */}
        <span className={`self-start px-2.5 py-0.5 rounded-full text-[11px] font-bold ${theme.badge} ${theme.badgeText}`}>
          {theme.label}
        </span>
      </div>
      {/* Right: value panel — 35% width, text auto-fits */}
      <div className={`w-[35%] shrink-0 p-3 overflow-hidden ${theme.panel}`}>
        <FitText
          text={result.displayValue}
          className={`font-extrabold tracking-tight ${theme.valueText}`}
          maxSize={36}
          minSize={10}
        />
      </div>
    </div>
  );
}

// ─── Results: Ratios Section ──────────────────────────────────────────────────

function RatiosSection({ results }: { results: HealthCheckResults }) {
  const row1: { key: 'emergencyFund' | 'savingRatio' | 'debtServiceRatio'; icon: LucideIcon; name: string; description: string }[] = [
    { key: 'emergencyFund', icon: Landmark, name: 'Dana Darurat', description: 'Dana darurat vs pengeluaran bulanan' },
    { key: 'savingRatio', icon: Wallet, name: 'Rasio Tabungan', description: 'Idealnya minimal 20% dari penghasilan' },
    { key: 'debtServiceRatio', icon: TrendingDown, name: 'Rasio Utang (DTI)', description: 'Cicilan bulanan vs penghasilan' },
  ];
  const row2: { key: 'solvencyRatio' | 'investmentAssetsRatio' | 'insuranceCoverage'; icon: LucideIcon; name: string; description: string }[] = [
    { key: 'solvencyRatio', icon: Scale, name: 'Kekayaan Bersih', description: 'Total aset vs total kewajiban' },
    { key: 'investmentAssetsRatio', icon: TrendingUp, name: 'Aset Investasi', description: 'Porsi aset yang produktif & bertumbuh' },
    { key: 'insuranceCoverage', icon: ShieldCheck, name: 'Proteksi Asuransi', description: 'Proteksi jiwa & kesehatan' },
  ];

  return (
    <section className="bg-[#F0F7FA] px-5 sm:px-[120px] py-16 sm:py-[64px]">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#153A56]">Detail 6 Rasio Keuangan</h2>
            <p className="text-[14px] text-[#666666]">Ringkasan kondisi setiap aspek keuanganmu.</p>
          </div>
        </div>
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {row1.map((r) => (
            <RatioCard key={r.key} icon={r.icon} name={r.name} description={r.description} result={results[r.key]} />
          ))}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {row2.map((r) => (
            <RatioCard key={r.key} icon={r.icon} name={r.name} description={r.description} result={results[r.key]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Results: Recommendations ─────────────────────────────────────────────────

const REC_ICON: Record<string, LucideIcon> = {
  emergencyFund: Landmark,
  savingRatio: TrendingUp,
  debtServiceRatio: TrendingDown,
  solvencyRatio: Scale,
  investmentAssetsRatio: Lightbulb,
  insuranceCoverage: ShieldCheck,
};

function RecommendationsSection({ results }: { results: HealthCheckResults }) {
  const recs = getTopRecommendations(results, 3);
  if (recs.length === 0) return null;

  return (
    <section className="bg-white px-5 sm:px-20 py-16 sm:py-[64px] relative overflow-hidden">
      {/* Blurred recommendation cards */}
      <div className="max-w-screen-xl mx-auto flex flex-col gap-9 select-none pointer-events-none" aria-hidden>
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#153A56]">Rekomendasi Untukmu</h2>
          <p className="text-[14px] sm:text-[15px] text-[#666666]">
            Berdasarkan profil keuanganmu, berikut tiga langkah penting yang bisa kamu mulai sekarang.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 blur-[6px]">
          {recs.map((rec, idx) => {
            const theme = STATUS_THEME[results[rec.key].status];
            const RecIcon = REC_ICON[rec.key] ?? Lightbulb;
            return (
              <div key={rec.key} className="flex flex-col gap-4 bg-[#FAFCFE] rounded-2xl p-7 border border-[#EEF4FB]">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${theme.badge} ${theme.badgeText}`}>
                    Tindakan #{idx + 1}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.iconBg}`}>
                  <RecIcon size={20} strokeWidth={1.8} className={theme.valueText} />
                </div>
                <h3 className="text-[18px] font-extrabold text-[#153A56] leading-tight">{rec.label}</h3>
                <p className="text-[13px] text-[#555555] leading-relaxed flex-1">{rec.text}</p>
                <span className="text-[13px] font-bold text-[#D97706]">Diskusikan dengan CFP →</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/75 backdrop-blur-[3px] px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F0F7FA] border border-[#DDE9F5] flex items-center justify-center">
          <Lock size={24} strokeWidth={1.8} className="text-[#205781]" />
        </div>
        <div className="flex flex-col gap-1.5 max-w-[420px]">
          <p className="text-[20px] font-extrabold text-[#153A56]">Dapatkan Rekomendasi Lengkap</p>
          <p className="text-[14px] text-[#666666] leading-relaxed">
            Langkah-langkah konkret tersedia dalam sesi konsultasi gratis bersama perencana keuangan CFP® kami.
          </p>
        </div>
        <a
          href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#D97706] text-white text-[14px] font-bold px-7 py-3.5 rounded-full hover:bg-[#C96D00] transition-colors"
          style={{ boxShadow: '0 4px 14px 0 rgba(255,132,0,0.25)' }}
        >
          <Phone size={15} strokeWidth={2.5} />
          Mulai Konsultasi Gratis
        </a>
      </div>
    </section>
  );
}

// ─── Results: Bottom CTA ──────────────────────────────────────────────────────

function BottomCTA({ onReset }: { onReset: () => void }) {
  return (
    <section
      className="px-5 sm:px-20 py-[72px] flex flex-col items-center gap-6 text-center"
      style={{ background: 'linear-gradient(180deg, #205781 0%, #4F9DA6 100%)' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
        <Rocket size={32} strokeWidth={1.6} className="text-white" />
      </div>
      <h2 className="text-[30px] sm:text-[38px] font-extrabold text-white leading-[1.1] tracking-[-0.8px] max-w-[580px]">
        Jadikan skor ini titik balikmu.
      </h2>
      <p className="text-[15px] sm:text-[16px] text-white/85 max-w-[520px] leading-relaxed">
        Perencana keuangan kami siap membantu kamu menyusun rencana aksi yang nyata — bukan sekadar teori.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#D97706] text-white text-[16px] font-extrabold px-8 py-4 rounded-full hover:bg-[#C96D00] transition-colors whitespace-nowrap"
          style={{ boxShadow: '0 4px 16px 0 rgba(255,132,0,0.30)' }}
        >
          <Phone size={17} strokeWidth={2.5} />
          Jadwalkan Konsultasi Gratis
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 bg-white/20 text-white text-[16px] font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition-colors whitespace-nowrap"
        >
          <RotateCcw size={16} strokeWidth={2.2} />
          Ulangi dari Awal
        </button>
      </div>
      <p className="text-[12px] text-white/60">Gratis · Tanpa Komitmen · Langsung dengan CFP tersertifikasi</p>
    </section>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { icon: Landmark, label: 'Memeriksa dana darurat...' },
  { icon: Wallet, label: 'Menghitung rasio tabungan...' },
  { icon: TrendingDown, label: 'Menganalisis cicilan utang...' },
  { icon: Scale, label: 'Menilai kekayaan bersih...' },
  { icon: TrendingUp, label: 'Mengukur portofolio investasi...' },
  { icon: ShieldCheck, label: 'Memeriksa proteksi asuransi...' },
];

function LoadingScreen() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % LOADING_STEPS.length), 320);
    return () => clearInterval(id);
  }, []);

  const step = LOADING_STEPS[activeIdx];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 px-5"
      style={{ background: 'linear-gradient(180deg, #153A56 0%, #1E5070 100%)' }}>
      {/* Animated icon ring */}
      <div className="relative w-24 h-24">
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-white/10 border-t-[#D97706] animate-spin" />
        {/* Center icon */}
        <div className="absolute inset-2 rounded-full bg-white/10 flex items-center justify-center">
          <StepIcon size={28} strokeWidth={1.6} className="text-[#D97706]" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[22px] font-extrabold text-white tracking-[-0.5px]">Menganalisis keuanganmu…</p>
        <p className="text-[14px] text-white/60 min-h-[20px] transition-all duration-300">{step.label}</p>
      </div>

      {/* Mini progress dots */}
      <div className="flex gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 bg-[#D97706]' : 'w-1.5 bg-white/25'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────

function ResultsPage({
  results, data, onReset,
}: {
  results: HealthCheckResults;
  data: FormData;
  onReset: () => void;
}) {
  return (
    <div className="pt-[72px]">
      <ScoreHero results={results} />
      <CTAStrip />
      <RatiosSection results={results} />
      <RecommendationsSection results={results} />
      <BottomCTA onReset={onReset} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HealthCheckForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [results, setResults] = useState<HealthCheckResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (results) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [results]);

  const setA = useCallback((p: Partial<FormData['A']>) => setForm((f) => ({ ...f, A: { ...f.A, ...p } })), []);
  const setB = useCallback((p: Partial<FormData['B']>) => setForm((f) => ({ ...f, B: { ...f.B, ...p } })), []);
  const setC = useCallback((p: Partial<FormData['C']>) => setForm((f) => ({ ...f, C: { ...f.C, ...p } })), []);
  const setD = useCallback((p: Partial<FormData['D']>) => setForm((f) => ({ ...f, D: { ...f.D, ...p } })), []);
  const setE = useCallback((p: Partial<FormData['E']>) => setForm((f) => ({ ...f, E: { ...f.E, ...p } })), []);
  const setF = useCallback((p: Partial<FormData['F']>) => setForm((f) => ({ ...f, F: { ...f.F, ...p } })), []);
  const setG = useCallback((p: Partial<FormData['G']>) => setForm((f) => ({ ...f, G: { ...f.G, ...p } })), []);

  function validateStep(s: number): string[] {
    const errs: string[] = [];
    if (s === 1) {
      if (form.A.age === '' || Number(form.A.age) < 17 || Number(form.A.age) > 70)
        errs.push('Usia harus antara 17–70 tahun.');
      if (!form.A.maritalStatus) errs.push('Pilih status pernikahan.');
      if (form.A.dependents === '') errs.push('Masukkan jumlah tanggungan.');
      if (!form.A.jobStatus) errs.push('Pilih status pekerjaan.');
    }
    if (s === 2) {
      if (computeTotalMonthlyIncome(form) === 0)
        errs.push('Masukkan penghasilan untuk melihat hasil analisis.');
    }
    if (s === 4) {
      const income = computeTotalMonthlyIncome(form);
      if (income > 0 && form.D.monthlySavings > income)
        errs.push('Jumlah tabungan tidak boleh melebihi penghasilan.');
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    if (step === 7) {
      setLoading(true);
      setTimeout(() => {
        setResults(computeHealthCheckResults(form));
        setLoading(false);
      }, 2000);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1));
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setStep(1);
    setErrors([]);
    setResults(null);
  }

  if (loading) return <LoadingScreen />;
  if (results) return <ResultsPage results={results} data={form} onReset={handleReset} />;

  const stepProps: StepProps = { form, setA, setB, setC, setD, setE, setF, setG };

  return (
    <div className="pt-[72px]">
      {/* Hero */}
      <HeroSection />

      {/* Wizard */}
      <section className="bg-[#F0F7FA] px-5 sm:px-20 py-14 sm:py-[64px]">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
          {/* Section header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-[28px] sm:text-[34px] font-extrabold text-[#153A56]">Cek Kesehatan Keuangan Kamu</h2>
            <p className="text-[14px] sm:text-[15px] text-[#666666]">
              Jawab 7 langkah sederhana ini — butuh kurang dari 2 menit!
            </p>
            <StepIndicator current={step} />
          </div>

          {/* Form card */}
          <div
            className="mx-auto w-full max-w-[760px] bg-white rounded-[20px] border border-[#E0EBF5] p-8 sm:p-10"
            style={{ boxShadow: '0 8px 32px 0 rgba(21,58,86,0.07)' }}
          >
            {/* Step title */}
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="text-[22px] font-extrabold text-[#153A56]">{STEP_TITLES[step]}</h3>
              <p className="text-[13px] text-[#777777]">{STEP_SUBTITLES[step]}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#EEF4FA] mb-7" />

            {/* Fields */}
            {step === 1 && <Step1 {...stepProps} />}
            {step === 2 && <Step2 {...stepProps} />}
            {step === 3 && <Step3 {...stepProps} />}
            {step === 4 && <Step4 {...stepProps} />}
            {step === 5 && <Step5 {...stepProps} />}
            {step === 6 && <Step6 {...stepProps} />}
            {step === 7 && <Step7 {...stepProps} />}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mt-5 flex flex-col gap-1 rounded-[10px] bg-[#FFF0EB] border border-[#F0A090] px-4 py-3">
                {errors.map((e) => (
                  <p key={e} className="text-[13px] text-[#C0451A]">{e}</p>
                ))}
              </div>
            )}

            {/* Navigation footer */}
            <div className="flex items-center justify-between mt-8 pt-2">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="text-[13px] text-[#AAAAAA] hover:text-[#666] transition-colors"
                >
                  ← Kembali
                </button>
              ) : (
                <Link href="/" className="text-[13px] text-[#AAAAAA] hover:text-[#666] transition-colors">
                  ← Beranda
                </Link>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 bg-[#D97706] text-white text-[15px] font-bold px-8 py-3 rounded-full hover:bg-[#C96D00] transition-colors"
                style={{ boxShadow: '0 4px 14px 0 rgba(255,132,0,0.25)' }}
              >
                {step === 7 ? 'Lihat Hasil' : 'Selanjutnya →'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
