'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CloudUpload,
  List,
  Loader2,
  LogOut,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type PaymentAccount = {
  id: string;
  label: string;
  accountName: string;
  accountNumber: string;
};

const NO_ACCOUNT_ID = '__none__';

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type TaxType = 'PPN' | 'PPh';

export type InitialInvoiceData = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  issuer: IssuerInfo;
  client: ClientInfo;
  items: { description: string; quantity: number; unitPrice: number }[];
  discountPercent: number;
  taxType: TaxType;
  taxPercent: number;
  paymentAccountId: string;
  notes: string;
};

type IssuerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
};

type ClientInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${y}${m}${d}-${rand}`;
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
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export function InvoiceGenerator({
  userEmail,
  paymentAccounts,
  initialData,
  isStored = false,
}: {
  userEmail: string;
  paymentAccounts: PaymentAccount[];
  initialData?: InitialInvoiceData;
  isStored?: boolean;
}) {
  const router = useRouter();

  const [issuer, setIssuer] = useState<IssuerInfo>(
    initialData?.issuer ?? {
      name: 'Aditya Very Cleverina, CFP®',
      email: 'hello@cfpvery.com',
      phone: '+62 818-0648-4635',
      address: 'Jakarta, Indonesia',
      website: 'www.temantumbuh.id',
    }
  );

  const [client, setClient] = useState<ClientInfo>(
    initialData?.client ?? {
      name: '',
      email: '',
      phone: '',
      address: '',
    }
  );

  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber ?? generateInvoiceNumber()
  );
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate ?? todayISO()
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ?? addDaysISO(7)
  );
  const [currency, setCurrency] = useState(initialData?.currency ?? 'IDR');
  const [taxType, setTaxType] = useState<TaxType>(initialData?.taxType ?? 'PPN');
  const [taxPercent, setTaxPercent] = useState(initialData?.taxPercent ?? 0);
  const [discountPercent, setDiscountPercent] = useState(
    initialData?.discountPercent ?? 0
  );
  const [notes, setNotes] = useState(
    initialData?.notes ??
      'Terima kasih atas kepercayaan Anda. Mohon lakukan pembayaran sebelum jatuh tempo.'
  );
  const [paymentAccountId, setPaymentAccountId] = useState<string>(
    initialData?.paymentAccountId ?? paymentAccounts[0]?.id ?? NO_ACCOUNT_ID
  );
  const selectedPaymentAccount = useMemo(
    () => paymentAccounts.find((a) => a.id === paymentAccountId) ?? null,
    [paymentAccounts, paymentAccountId]
  );

  const [items, setItems] = useState<LineItem[]>(
    initialData?.items.length
      ? initialData.items.map((i) => ({
          id: crypto.randomUUID(),
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      : [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items]
  );
  const discountAmount = useMemo(
    () => (subtotal * discountPercent) / 100,
    [subtotal, discountPercent]
  );
  const taxableBase = subtotal - discountAmount;
  const taxAmount = (taxableBase * taxPercent) / 100;
  const total = taxableBase + taxAmount;

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)));
  };

  const handlePrint = () => {
    window.print();
  };

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const res = await fetch('/api/invoice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          dueDate,
          currency,
          issuer,
          client,
          items: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          subtotal,
          discountPercent,
          discountAmount,
          taxType,
          taxPercent,
          taxAmount,
          total,
          paymentAccountId:
            paymentAccountId === NO_ACCOUNT_ID ? '' : paymentAccountId,
          paymentAccountLabel: selectedPaymentAccount?.label ?? '',
          paymentAccountNumber: selectedPaymentAccount?.accountNumber ?? '',
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan invoice.');
      }
      setSaveStatus('saved');
      if (data.id) {
        router.push('/generate-invoice/list');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/invoice-auth/logout', { method: 'POST' });
    router.replace('/generate-invoice/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#1A1918]">
              {isStored ? 'Invoice Tersimpan' : 'Invoice Generator'}
            </h1>
            <p className="text-xs text-[#6D6C6A]">Masuk sebagai {userEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/generate-invoice/list">
              <Button size="sm" variant="ghost">
                <List size={16} className="mr-2" /> Daftar
              </Button>
            </Link>
            {!isStored && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check size={16} className="mr-2" /> Tersimpan
                  </>
                ) : (
                  <>
                    <CloudUpload size={16} className="mr-2" /> Simpan ke Spreadsheet
                  </>
                )}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer size={16} className="mr-2" /> Cetak / PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Keluar
            </Button>
          </div>
        </div>
        {saveStatus === 'error' && saveError && (
          <div className="bg-red-50 border-t border-red-200 text-red-700 text-sm px-4 sm:px-6 py-2">
            {saveError}
          </div>
        )}
      </div>

      <div
        className={
          isStored
            ? 'max-w-3xl mx-auto px-4 sm:px-6 py-6 print:p-0 print:max-w-none'
            : 'max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:p-0 print:max-w-none'
        }
      >
        {/* Form — hidden in stored (read-only) mode */}
        {!isStored && (
        <section className="print:hidden bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-[#1A1918] mb-3">Detail Invoice</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nomor Invoice">
                <Input value={invoiceNumber} onChange={setInvoiceNumber} />
              </Field>
              <Field label="Mata Uang">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                  <option value="SGD">SGD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <Field label="Tanggal Terbit">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Jatuh Tempo">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-[#1A1918] mb-3">Penerbit</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama">
                <Input
                  value={issuer.name}
                  onChange={(v) => setIssuer({ ...issuer, name: v })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={issuer.email}
                  onChange={(v) => setIssuer({ ...issuer, email: v })}
                />
              </Field>
              <Field label="Telepon">
                <Input
                  value={issuer.phone}
                  onChange={(v) => setIssuer({ ...issuer, phone: v })}
                />
              </Field>
              <Field label="Alamat">
                <Input
                  value={issuer.address}
                  onChange={(v) => setIssuer({ ...issuer, address: v })}
                />
              </Field>
              <Field label="Website">
                <Input
                  value={issuer.website}
                  onChange={(v) => setIssuer({ ...issuer, website: v })}
                />
              </Field>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-[#1A1918] mb-3">Klien</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama">
                <Input
                  value={client.name}
                  onChange={(v) => setClient({ ...client, name: v })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={client.email}
                  onChange={(v) => setClient({ ...client, email: v })}
                />
              </Field>
              <Field label="Telepon">
                <Input
                  value={client.phone}
                  onChange={(v) => setClient({ ...client, phone: v })}
                />
              </Field>
              <Field label="Alamat">
                <Input
                  value={client.address}
                  onChange={(v) => setClient({ ...client, address: v })}
                />
              </Field>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1918]">Item</h2>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus size={14} className="mr-1.5" /> Tambah Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-end border border-gray-200 rounded-lg p-3"
                >
                  <div className="col-span-12">
                    <label className="text-xs text-[#6D6C6A]">Deskripsi #{idx + 1}</label>
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      placeholder="cth: Sesi 1-on-1 Personal Finance"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-[#6D6C6A]">Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="text-xs text-[#6D6C6A]">Harga Satuan</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-11 px-3 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-[#1A1918] mb-3">Diskon & Pajak</h2>
            <div className="space-y-3">
              <Field label="Diskon (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Pajak (%)">
                <div className="flex gap-2">
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value as TaxType)}
                    className={inputClass + ' flex-1'}
                  >
                    <option value="PPN">PPN</option>
                    <option value="PPh">PPh</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercent}
                    onChange={(e) =>
                      setTaxPercent(parseFloat(e.target.value) || 0)
                    }
                    className={inputClass + ' flex-1'}
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className="space-y-3">
            <Field label="Akun Pembayaran">
              <select
                value={paymentAccountId}
                onChange={(e) => setPaymentAccountId(e.target.value)}
                className={inputClass}
              >
                {paymentAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.label} — {acc.accountNumber}
                  </option>
                ))}
                <option value={NO_ACCOUNT_ID}>Tanpa akun pembayaran</option>
              </select>
            </Field>
            <Field label="Catatan / Instruksi Pembayaran">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={inputClass + ' h-auto py-2'}
              />
            </Field>
          </div>
        </section>
        )}

        {/* Preview / Printable */}
        <section className="bg-white rounded-2xl shadow-sm p-8 print:rounded-none print:shadow-none print:p-10">
          {/* Brand header */}
          {/* Brand + invoice meta */}
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <Image
                src="/icon_1.png"
                alt="Teman Tumbuh"
                width={192}
                height={192}
                className="w-20 h-20 rounded-xl object-cover shadow-sm"
              />
              <div className="leading-tight">
                <p className="font-bold text-[24px] text-[#1A1918] tracking-tight">
                  Teman Tumbuh
                </p>
                <p className="text-[13px] text-[#6D6C6A] mt-0.5">
                  Aditya Very Cleverina
                </p>
                {issuer.website && (
                  <p className="text-[13px] text-[#205781] font-medium mt-1.5">
                    {issuer.website}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-[28px] leading-none font-bold text-[#205781] tracking-wide">
                INVOICE
              </h2>
              <p className="text-sm mt-3">
                <span className="text-[#6D6C6A]">No: </span>
                <span className="font-semibold text-[#1A1918]">
                  {invoiceNumber}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-[#6D6C6A]">Tanggal: </span>
                <span className="font-semibold text-[#1A1918]">
                  {formatDate(issueDate)}
                </span>
              </p>
              <span className="inline-block mt-2 text-sm font-semibold text-[#205781] bg-[#E0EFF5] rounded-md px-3 py-1">
                Jatuh Tempo: {formatDate(dueDate)}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-[#205781] mb-6" />

          {/* Client */}
          <div className="bg-[#FBF5EF] border-l-4 border-[#205781] rounded-lg p-5 mb-6 text-sm">
            <p className="text-[11px] tracking-[0.15em] text-[#6D6C6A] font-semibold uppercase mb-2">
              Ditagihkan kepada
            </p>
            <p className="font-semibold text-[#1A1918] text-base">
              {client.name || '—'}
            </p>
            {client.email && <p className="text-[#6D6C6A]">{client.email}</p>}
            {client.phone && <p className="text-[#6D6C6A]">{client.phone}</p>}
            {client.address && (
              <p className="text-[#6D6C6A]">{client.address}</p>
            )}
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-[#205781]">
                <th className="text-left py-2 font-semibold text-[#1A1918]">
                  Deskripsi
                </th>
                <th className="text-right py-2 font-semibold text-[#1A1918] w-16">
                  Qty
                </th>
                <th className="text-right py-2 font-semibold text-[#1A1918] w-32">
                  Harga
                </th>
                <th className="text-right py-2 font-semibold text-[#1A1918] w-32">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 align-top">
                  <td className="py-3 pr-2 whitespace-pre-wrap">
                    {item.description || '—'}
                  </td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.unitPrice, currency)}
                  </td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.quantity * item.unitPrice, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs text-sm space-y-2">
              <Row label="Subtotal" value={formatCurrency(subtotal, currency)} />
              {discountPercent > 0 && (
                <Row
                  label={`Diskon (${discountPercent}%)`}
                  value={`- ${formatCurrency(discountAmount, currency)}`}
                />
              )}
              {taxPercent > 0 && (
                <Row
                  label={`${taxType} (${taxPercent}%)`}
                  value={formatCurrency(taxAmount, currency)}
                />
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-[#1A1918]">Total</span>
                <span className="font-bold text-lg text-[#205781]">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>

          {(notes || selectedPaymentAccount) && (
            <div className="text-sm space-y-4">
              {selectedPaymentAccount && (
                <div className="bg-[#FBF5EF] border-l-4 border-[#205781] rounded-lg p-5">
                  <p className="text-[11px] tracking-[0.15em] text-[#6D6C6A] font-semibold uppercase mb-2">
                    Pembayaran ditransfer ke
                  </p>
                  <p className="font-bold text-[#1A1918]">
                    {selectedPaymentAccount.label}
                  </p>
                  <p className="font-bold text-[#1A1918] text-lg font-mono tracking-wide">
                    {selectedPaymentAccount.accountNumber}
                  </p>
                  <p className="text-[#6D6C6A]">
                    a.n. {selectedPaymentAccount.accountName}
                  </p>
                </div>
              )}
              {notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-[#1A1918] italic">
                    {notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Signature / Issuer footer */}
          <div className="mt-10 pt-6 border-t border-[#E0EFF5] flex justify-end">
            <div className="text-right text-sm max-w-xs">
              <p className="text-[#6D6C6A] mb-8">Hormat kami,</p>
              <p className="font-semibold text-[#1A1918] border-t border-[#1A1918] pt-2">
                {issuer.name}
              </p>
              {issuer.email && (
                <p className="text-[#6D6C6A] text-xs">{issuer.email}</p>
              )}
              {issuer.phone && (
                <p className="text-[#6D6C6A] text-xs">{issuer.phone}</p>
              )}
              {issuer.address && (
                <p className="text-[#6D6C6A] text-xs">{issuer.address}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

const inputClass =
  'w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#205781] focus:border-transparent text-sm';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-[#6D6C6A] mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#6D6C6A]">{label}</span>
      <span className="text-[#1A1918] font-medium">{value}</span>
    </div>
  );
}
