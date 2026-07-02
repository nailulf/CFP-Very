'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';
import { formatIDR } from '@/lib/konsultasi-packages';
import type { PaymentDisplay } from '@/lib/konsultasi-payment';

type StatusPayload = {
  success: boolean;
  status: string;
  paymentUrl: string | null;
  meetLink: string | null;
  service: string;
  date: string | null;
  time: string | null;
  amount: string;
};

const POLL_MS = 5000;
const MAX_POLLS = 180; // ~15 minutes of auto-polling, then manual "Cek Status".

export default function StatusClient({
  bookingId,
  payment,
}: {
  bookingId: string;
  payment: PaymentDisplay;
}) {
  const { lang } = useLang();
  const t = translations[lang].konsultasi.booking;
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const polls = useRef(0);

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/konsultasi/payment/status/${bookingId}`, { cache: 'no-store' });
      if (res.status === 400 || res.status === 404) {
        setData(null);
        setError(t.status.notFound);
        return;
      }
      const json = (await res.json()) as StatusPayload;
      if (!res.ok || !json.success) throw new Error();
      setData(json);
    } catch {
      setError(t.status.loadError);
    } finally {
      setLoading(false);
    }
  }, [bookingId, t.status.notFound, t.status.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-poll while payment is pending.
  useEffect(() => {
    if (data?.status !== 'pending_payment') return;
    const id = setInterval(() => {
      polls.current += 1;
      if (polls.current > MAX_POLLS) {
        clearInterval(id);
        return;
      }
      load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [data?.status, load]);

  const card = 'max-w-2xl mx-auto bg-white rounded-2xl border border-[#E0EBF5] p-8';

  if (loading) {
    return (
      <Container>
        <div className={`${card} flex items-center justify-center gap-3 text-[#666666]`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          {t.status.title}…
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <div className={`${card} text-center`}>
          <h1 className="text-2xl font-extrabold text-[#1A1918] mb-3">{t.status.title}</h1>
          <p className="text-[#8C1C00] mb-6">{error ?? t.status.notFound}</p>
          <Link href="/konsultasi/booking" className="inline-flex rounded-full bg-[#205781] px-6 py-3 font-semibold text-white">
            {t.status.rebook}
          </Link>
        </div>
      </Container>
    );
  }

  const paid = data.status === 'paid';
  const pending = data.status === 'pending_payment';
  const expired = data.status === 'expired';
  const heading = paid
    ? t.status.paidTitle
    : pending
      ? t.status.pendingTitle
      : expired
        ? t.status.expiredTitle
        : data.status === 'refunded'
          ? t.status.refundedTitle
          : t.status.cancelledTitle;
  const body = paid
    ? t.status.paidBody
    : pending
      ? t.status.pendingBody
      : expired
        ? t.status.expiredBody
        : data.status === 'refunded'
          ? t.status.refundedBody
          : t.status.cancelledBody;

  const waMessage = [
    t.success.waIntro,
    `${t.confirm.summaryPackage}: ${data.service}`,
    ...(data.date ? [`${t.confirm.summaryDate}: ${fmtDate(data.date)}`] : []),
    ...(data.time ? [`${t.confirm.summaryTime}: ${data.time} WIB`] : []),
    ...(data.meetLink ? [`Google Meet: ${data.meetLink}`] : []),
    `${t.success.refId}: ${bookingId}`,
  ].join('\n');
  const waHref = `${payment.whatsappUrl.split('?')[0]}?text=${encodeURIComponent(waMessage)}`;

  return (
    <Container>
      <div className={card}>
        {paid ? (
          <p className="inline-flex items-center gap-2 text-[#1B7A3F] font-extrabold text-2xl mb-2">
            <Check className="w-6 h-6" />
            {heading}
          </p>
        ) : (
          <h1 className={`text-2xl font-extrabold mb-2 ${expired ? 'text-[#8C1C00]' : 'text-[#1A1918]'}`}>{heading}</h1>
        )}
        <p className="text-[#666666] mb-4">{body}</p>
        <p className="text-[13px] text-[#666666] mb-6">
          {t.success.refId}: <span className="font-mono font-bold text-[#205781]">{bookingId}</span>
        </p>

        <div className="bg-[#F5F8FC] border border-[#E0EBF5] rounded-2xl p-5 mb-6">
          <p className="font-semibold text-[#1A1918] mb-3">{t.success.summaryTitle}</p>
          <dl className="flex flex-col gap-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryPackage}</dt><dd className="font-semibold text-[#1A1918] text-right">{data.service}</dd></div>
            {data.date && (
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryDate}</dt><dd className="font-semibold text-[#1A1918]">{fmtDate(data.date)}</dd></div>
            )}
            {data.time && (
              <div className="flex justify-between"><dt className="text-[#666666]">{t.confirm.summaryTime}</dt><dd className="font-semibold text-[#1A1918]">{data.time} WIB</dd></div>
            )}
            <div className="flex justify-between pt-2 mt-1 border-t border-[#E0EBF5]"><dt className="font-bold text-[#1A1918]">{t.confirm.total}</dt><dd className="font-extrabold text-[#205781]">{formatIDR(Number(data.amount) || 0)}</dd></div>
          </dl>
        </div>

        {pending && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {data.paymentUrl && (
              <a href={data.paymentUrl} className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">
                {t.payment.payNow}
              </a>
            )}
            <button type="button" onClick={load} className="inline-flex rounded-full border border-[#205781] px-6 py-3 font-semibold text-[#205781]">
              {t.status.checkStatus}
            </button>
          </div>
        )}

        {paid && (
          <>
            {data.meetLink ? (
              <p className="text-[13px] text-[#666666] mb-5">
                {t.success.meetNote}{' '}
                <a href={data.meetLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#4F9DA6] underline">
                  {t.success.joinMeet}
                </a>
              </p>
            ) : (
              <p className="text-[13px] text-[#666666] mb-5">{t.status.meetPending}</p>
            )}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#f79d35] px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(247,157,53,0.35)]">
              {t.success.whatsapp}
            </a>
          </>
        )}

        {expired && (
          <Link href="/konsultasi/booking" className="inline-flex rounded-full bg-[#205781] px-6 py-3 font-semibold text-white">
            {t.status.rebook}
          </Link>
        )}
      </div>
    </Container>
  );
}
