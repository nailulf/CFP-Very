'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { EMPTY_BOOKING, type BookingForm, type BookingStep } from './lib/types';
import { getKonsultasiPackage, formatIDR } from '@/lib/konsultasi-packages';
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
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => (form.date ? slotsByDate[form.date] ?? [] : []), [form.date, slotsByDate]);
  const set = (patch: Partial<BookingForm>) => setForm((f) => ({ ...f, ...patch }));
  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const pkgAmount = (id: string) => getKonsultasiPackage(id)?.amount ?? 0;
  const selectedPkg = t.packages.items.find((p) => p.id === form.packageId);
  const selectedAmount = pkgAmount(form.packageId);

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
    const waMessage = [
      t.success.waIntro,
      `${t.confirm.summaryName}: ${form.name}`,
      `${t.confirm.summaryPackage}: ${selectedPkg?.name ?? '-'}`,
      `${t.confirm.summaryDate}: ${fmtDate(form.date)}`,
      `${t.confirm.summaryTime}: ${form.timeSlot} WIB`,
      ...(meetLink ? [`Google Meet: ${meetLink}`] : []),
      `${t.success.refId}: ${bookingId}`,
    ].join('\n');
    const waHref = `${payment.whatsappUrl.split('?')[0]}?text=${encodeURIComponent(waMessage)}`;
    return (
      <Container>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8">
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-2">{t.success.title}</h1>
          <p className="text-[#666666] mb-4">{t.success.body}</p>
          <p className="text-[13px] text-[#666666] mb-6">{t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span></p>

          <div className="bg-[#F5F8FC] border border-[#E0EBF5] rounded-2xl p-5 mb-6">
            <p className="font-semibold text-[#1A1918] mb-3">{t.success.summaryTitle}</p>
            <dl className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryName}</dt><dd className="font-semibold text-[#1A1918]">{form.name}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryPackage}</dt><dd className="font-semibold text-[#1A1918]">{selectedPkg?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{fmtDate(form.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{form.timeSlot} WIB</dd></div>
              <div className="flex justify-between pt-2 mt-1 border-t border-[#E0EBF5]"><dt className="font-bold text-[#1A1918]">{t.confirm.total}</dt><dd className="font-extrabold text-[#205781]">{formatIDR(selectedAmount)}</dd></div>
            </dl>
          </div>

          {meetLink && (
            <p className="text-[13px] text-[#666666] mb-5">
              {t.success.meetNote}{' '}
              <a href={meetLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#4F9DA6] underline">{t.success.joinMeet}</a>
            </p>
          )}

          <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">{t.success.whatsapp}</a>
        </div>
      </Container>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const canNext =
    (step === 'schedule' && Boolean(form.packageId) && form.date && form.timeSlot) ||
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
      setMeetLink(data.meetLink ?? null);
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
            {/* Package selection */}
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <h2 className="font-extrabold text-[#1A1918] text-xl mb-1">{t.packages.label}</h2>
              <p className="text-[14px] text-[#666666] mb-5">{t.packages.subtitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.packages.items.map((p) => {
                  const selected = form.packageId === p.id;
                  const popular = p.id === 'family';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set({ packageId: p.id })}
                      aria-pressed={selected}
                      className={`relative text-left rounded-2xl border p-5 flex flex-col gap-3 transition ${selected ? 'border-[#205781] ring-2 ring-[#205781]/30 bg-[#F5F8FC]' : 'border-[#E0EBF5] bg-white hover:border-[#CBDCEA]'}`}
                    >
                      {popular && (
                        <span className="absolute -top-2 right-4 bg-[#f79d35] text-white text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full">{t.packages.popular}</span>
                      )}
                      <div>
                        <p className="font-extrabold text-[#1A1918] text-[16px] leading-tight">{p.name}</p>
                        <p className="text-[20px] font-extrabold text-[#205781] mt-1">{formatIDR(pkgAmount(p.id))}</p>
                      </div>
                      <p className="text-[12px] text-[#666666] leading-snug">{p.audience}</p>
                      <p className="font-mono text-[11px] font-bold text-[#4F9DA6] uppercase tracking-[0.5px]">{p.duration}</p>
                      <ul className="flex flex-col gap-1.5 mt-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px] text-[#666666] leading-snug">
                            <Check className="w-3.5 h-3.5 text-[#4F9DA6] mt-0.5 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & time */}
            <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
              <label className={label} htmlFor="booking-date">{t.schedule.dateLabel}</label>
              {dates.length === 0 ? <p className="text-[14px] text-[#666666]">{t.schedule.empty}</p> : (
                <select id="booking-date" className={input} value={form.date} onChange={(e) => set({ date: e.target.value, timeSlot: '' })}>
                  <option value="">—</option>
                  {dates.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
                </select>
              )}
              {form.date && (
                <div className="mt-4">
                  <label className={label}>{t.schedule.timeLabel}</label>
                  {slots.length === 0 ? (
                    <p className="text-[14px] text-[#666666]">{t.schedule.empty}</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button key={s} type="button" onClick={() => set({ timeSlot: s })} className={`py-2 rounded-[10px] text-[14px] border ${form.timeSlot === s ? 'bg-[#205781] text-white border-[#205781]' : 'bg-[#F5F8FC] border-[#CBDCEA] text-[#1A1918]'}`}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline */}
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
          </div>
        )}

        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6 flex flex-col gap-4">
            <div><label className={label} htmlFor="booking-name">{t.details.nameLabel}</label><input id="booking-name" className={input} value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label className={label} htmlFor="booking-email">{t.details.emailLabel}</label><input id="booking-email" type="email" className={input} value={form.email} onChange={(e) => set({ email: e.target.value })} /></div>
            <div><label className={label} htmlFor="booking-phone">{t.details.phoneLabel}</label><input id="booking-phone" className={input} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div>
              <label className={label} htmlFor="booking-topic">{t.details.topicLabel}</label>
              <textarea id="booking-topic" className="w-full min-h-[120px] bg-[#F5F8FC] border border-[#CBDCEA] rounded-[10px] p-4 outline-none focus:ring-2 focus:ring-[#f79d35]/40 focus:border-[#f79d35]" value={form.topic} onChange={(e) => set({ topic: e.target.value })} />
              <p className="text-[11px] text-[#9BAFC0] mt-1">{t.details.topicHint}</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-2xl border border-[#E0EBF5] p-6">
            <h2 className="font-extrabold text-[#1A1918] text-xl mb-4">{t.confirm.title}</h2>
            <dl className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryPackage}</dt><dd className="font-semibold text-[#1A1918]">{selectedPkg?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{fmtDate(form.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{form.timeSlot} WIB</dd></div>
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryName}</dt><dd className="font-semibold text-[#1A1918]">{form.name}</dd></div>
              <div className="flex justify-between gap-6"><dt className="text-[#666666] shrink-0">{t.confirm.summaryTopic}</dt><dd className="text-[#1A1918] text-right">{form.topic}</dd></div>
            </dl>

            {/* Price breakdown */}
            <div className="mt-5 pt-4 border-t border-[#E0EBF5]">
              <p className="font-semibold text-[#1A1918] mb-3">{t.confirm.priceTitle}</p>
              <div className="flex justify-between text-[14px] mb-2">
                <span className="text-[#666666]">{selectedPkg?.name}</span>
                <span className="font-semibold text-[#1A1918]">{formatIDR(selectedAmount)}</span>
              </div>
              <div className="flex justify-between text-[15px] pt-3 border-t border-[#E0EBF5]">
                <span className="font-bold text-[#1A1918]">{t.confirm.total}</span>
                <span className="font-extrabold text-[#205781]">{formatIDR(selectedAmount)}</span>
              </div>
            </div>

            <div className="bg-[#FFF8E1] text-[#D97706] text-[13px] rounded-[10px] px-4 py-3 mt-4">{t.confirm.note}</div>

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
