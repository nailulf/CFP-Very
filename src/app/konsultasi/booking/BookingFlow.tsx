'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { EMPTY_BOOKING, type BookingForm, type BookingStep } from './lib/types';
import type { PaymentDisplay } from '@/lib/konsultasi-payment';

type Props = {
  enabled: boolean;
  dates: string[];
  slotsByDate: Record<string, string[]>;
  payment: PaymentDisplay;
};

const STEP_ORDER: BookingStep[] = ['schedule', 'details', 'confirm'];

export default function BookingFlow({ enabled, dates, slotsByDate, payment }: Props) {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.booking;
  const [step, setStep] = useState<BookingStep>('schedule');
  const [form, setForm] = useState<BookingForm>(EMPTY_BOOKING);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const slots = useMemo(() => (form.date ? slotsByDate[form.date] ?? [] : []), [form.date, slotsByDate]);
  const set = (patch: Partial<BookingForm>) => setForm((f) => ({ ...f, ...patch }));

  if (!enabled) {
    return (
      <Container>
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-10 text-center">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-3">{t.closed.title}</h1>
          <p className="text-[#666666] mb-6">{t.closed.body}</p>
          <a href={payment.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white">{t.closed.cta}</a>
        </div>
      </Container>
    );
  }

  if (bookingId) {
    const copy = (val: string) => { navigator.clipboard.writeText(val); setCopied(val); setTimeout(() => setCopied(null), 1500); };
    return (
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-2">{t.success.title}</h1>
          <p className="text-[#666666] mb-4">{t.success.body}</p>
          <p className="text-[13px] text-[#666666] mb-6">{t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span></p>
          <h2 className="font-semibold text-[#1A1918] mb-3">{t.success.payTitle}</h2>
          <p className="text-[13px] font-semibold text-[#3A5A70] mb-2">{t.success.bankTransfer}</p>
          <div className="flex flex-col gap-2 mb-5">
            {payment.banks.map((b) => (
              <div key={b.accountNumber} className="flex items-center justify-between bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] px-4 py-3">
                <div><p className="text-[13px] text-[#666666]">{b.label} · {b.accountName}</p><p className="font-mono font-bold text-[#1A1918]">{b.accountNumber}</p></div>
                <button type="button" onClick={() => copy(b.accountNumber)} className="text-[#205781] flex items-center gap-1 text-[13px]">{copied === b.accountNumber ? <><Check className="w-4 h-4" />{t.success.copied}</> : <><Copy className="w-4 h-4" />{t.success.copy}</>}</button>
              </div>
            ))}
          </div>
          <p className="text-[13px] font-semibold text-[#3A5A70] mb-2">{t.success.qris}</p>
          <div className="flex items-center gap-4 mb-5">
            <Image src={payment.qrisImageSrc} alt="QRIS" width={140} height={140} className="rounded-xl border border-[#E0EBF5]" />
            <p className="text-[13px] text-[#666666]">{payment.qrisName}</p>
          </div>
          <div className="bg-[#FFF8E1] text-[#D97706] text-[13px] rounded-[10px] px-4 py-3 mb-2">{t.success.window}</div>
          <p className="text-[12px] text-[#666666] mb-5">{t.success.refund}</p>
          <a href={payment.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-[#205781] text-[#205781] px-6 py-3 font-semibold">{t.success.whatsapp}</a>
        </div>
      </Container>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const canNext =
    (step === 'schedule' && form.date && form.timeSlot) ||
    (step === 'details' && form.name.trim().length >= 2 && /.+@.+\..+/.test(form.email) && form.topic.trim().length >= 10);

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/konsultasi/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal');
      setBookingId(data.bookingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal');
    } finally { setSubmitting(false); }
  };

  const input = 'h-[48px] w-full bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] px-4 outline-none focus:ring-2 focus:ring-[#f79d35]/40 focus:border-[#f79d35]';
  const label = 'block text-[13px] font-semibold text-[#3A5A70] mb-1.5';

  return (
    <Container>
      <div className="max-w-2xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`flex-1 text-center text-[13px] font-semibold rounded-full py-2 ${i === stepIndex ? 'bg-[#205781] text-white' : i < stepIndex ? 'bg-[#4F9DA6] text-white' : 'bg-[#E0EBF5] text-[#666666]'}`}>{t.steps[s]}</div>
          ))}
        </div>

        {step === 'schedule' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <h2 className="font-extrabold text-[#1A1918] text-xl mb-1">{t.timeline.title}</h2>
              <p className="text-[14px] text-[#666666] mb-5">{t.timeline.subtitle}</p>
              <div className="flex flex-col gap-4">
                {t.timeline.items.map((it) => (
                  <div key={it.week} className="flex gap-4">
                    <span className="font-mono text-[11px] font-bold text-[#205781] uppercase w-20 shrink-0 pt-1">{it.week}</span>
                    <div><p className="font-semibold text-[15px] text-[#1A1918]">{it.title}</p><p className="text-[13px] text-[#666666]">{it.desc}</p></div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#9C9B99] mt-4">{t.timeline.note}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <label className={label}>{t.schedule.dateLabel}</label>
              {dates.length === 0 ? <p className="text-[14px] text-[#666666]">{t.schedule.empty}</p> : (
                <select className={input} value={form.date} onChange={(e) => set({ date: e.target.value, timeSlot: '' })}>
                  <option value="">—</option>
                  {dates.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              {form.date && (
                <div className="mt-4">
                  <label className={label}>{t.schedule.timeLabel}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => set({ timeSlot: s })} className={`py-2 rounded-[10px] text-[14px] border ${form.timeSlot === s ? 'bg-[#205781] text-white border-[#205781]' : 'bg-[#F5F8FC] border-[#CBDCEA] text-[#1A1918]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6 flex flex-col gap-4">
            <div><label className={label}>{t.details.nameLabel}</label><input className={input} value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label className={label}>{t.details.emailLabel}</label><input type="email" className={input} value={form.email} onChange={(e) => set({ email: e.target.value })} /></div>
            <div><label className={label}>{t.details.phoneLabel}</label><input className={input} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div>
              <label className={label}>{t.details.topicLabel}</label>
              <textarea className="w-full min-h-[120px] bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] p-4 outline-none focus:ring-2 focus:ring-[#f79d35]/40 focus:border-[#f79d35]" value={form.topic} onChange={(e) => set({ topic: e.target.value })} />
              <p className="text-[11px] text-[#9BAFC0] mt-1">{t.details.topicHint}</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
            <h2 className="font-extrabold text-[#1A1918] text-xl mb-4">{t.confirm.title}</h2>
            <dl className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{form.date}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{form.timeSlot} WIB</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryName}</dt><dd className="font-semibold text-[#1A1918]">{form.name}</dd></div>
              <div className="flex justify-between gap-6"><dt className="text-[#666666] shrink-0">{t.confirm.summaryTopic}</dt><dd className="text-[#1A1918] text-right">{form.topic}</dd></div>
            </dl>
            {error && <p className="text-[#8C1C00] text-[13px] mt-4">{error}</p>}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-6">
          <button type="button" disabled={stepIndex === 0} onClick={() => setStep(STEP_ORDER[stepIndex - 1])} className="rounded-full border border-[#CBDCEA] px-6 py-3 font-semibold text-[#3A5A70] disabled:opacity-40">{t.back}</button>
          {step === 'confirm' ? (
            <button type="button" disabled={submitting} onClick={submit} className="rounded-full bg-[#f79d35] px-7 py-3 font-semibold text-white disabled:opacity-50">{t.confirm.submit}</button>
          ) : (
            <button type="button" disabled={!canNext} onClick={() => setStep(STEP_ORDER[stepIndex + 1])} className="rounded-full bg-[#205781] px-7 py-3 font-semibold text-white disabled:opacity-40">{t.next}</button>
          )}
        </div>

        <p className="text-center mt-6 text-[13px] text-[#666666]"><Link href="/konsultasi" className="underline">&larr; {translations[lang].konsultasi.hero.title}</Link></p>
      </div>
    </Container>
  );
}
