// src/lib/emails/konsultasi.ts
//
// Copy for the two transactional emails in the konsultasi booking flow.
// Pure string builders — no I/O — so they stay unit-testable without SMTP.
//
// Indonesian only: the booking funnel is Indonesian-first and nothing in the
// flow captures a language preference (email B is sent later, from the webhook,
// where no request locale exists). Revisit if EN is ever needed end-to-end.

export type EmailContent = { subject: string; html: string; text: string };

type SlotFields = {
  bookingId: string;
  name: string;
  service: string;
  /** 'YYYY-MM-DD' (WIB), or null when the sheet row can't be parsed. */
  date: string | null;
  /** 'HH:mm' (WIB), or null when the sheet row can't be parsed. */
  time: string | null;
  amount: number | string;
  statusUrl: string;
};

export type BookingCreatedInput = SlotFields & {
  paymentUrl: string | null;
  deadline: Date | null;
};

export type PaymentConfirmedInput = SlotFields & {
  meetLink: string | null;
};

const NAVY = '#153A56';
const AMBER = '#f79d35';
const PAGE_BG = '#F0F7FA';
const BORDER = '#E0EBF5';
const DARK = '#1A1918';
const MUTED = '#666666';

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** '2026-09-30' → '30 September 2026'. Returns '' for an unparseable date. */
function formatDateId(date: string | null): string {
  if (!date) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return '';
  const month = MONTHS_ID[Number(m[2]) - 1];
  if (!month) return '';
  return `${Number(m[3])} ${month} ${m[1]}`;
}

/** The session slot as one Indonesian phrase, or '' when the row has no slot. */
function formatSlotId(date: string | null, time: string | null): string {
  const day = formatDateId(date);
  if (!day || !time) return '';
  return `${day}, pukul ${time} WIB`;
}

/** A UTC instant rendered as WIB wall-clock, e.g. '18 September 2026, 19:06 WIB'. */
function formatDeadlineId(deadline: Date | null): string {
  if (!deadline || Number.isNaN(deadline.getTime())) return '';
  const wib = new Date(deadline.getTime() + WIB_OFFSET_MS);
  const day = `${wib.getUTCDate()} ${MONTHS_ID[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
  const hh = String(wib.getUTCHours()).padStart(2, '0');
  const mm = String(wib.getUTCMinutes()).padStart(2, '0');
  return `${day}, ${hh}:${mm} WIB`;
}

/** 500000 → 'Rp 500.000'. Returns '' when the sheet holds a non-numeric amount. */
function formatRupiah(amount: number | string): string {
  const n = typeof amount === 'number' ? amount : Number(String(amount).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n)) return '';
  return `Rp ${Math.round(n).toLocaleString('de-DE')}`;
}

type Row = { label: string; value: string };

/** Detail rows, with blank values dropped so a partial row never renders "null". */
function detailRows(rows: Row[]): Row[] {
  return rows.filter((r) => r.value !== '');
}

function detailTableHtml(rows: Row[]): string {
  return rows
    .map(
      (r) => `
        <tr>
          <td style="padding:6px 0;color:${MUTED};font-size:14px;white-space:nowrap;">${escapeHtml(r.label)}</td>
          <td style="padding:6px 0 6px 16px;color:${DARK};font-size:14px;font-weight:600;">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join('');
}

function detailTableText(rows: Row[]): string {
  return rows.map((r) => `${r.label}: ${r.value}`).join('\n');
}

function buttonHtml(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:999px;background:${AMBER};">
          <a href="${escapeHtml(href)}"
             style="display:inline-block;padding:14px 32px;border-radius:999px;background:${AMBER};
                    color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * Shell shared by both emails: navy header, white card on the page background.
 * All CSS is inline — email clients strip <style> blocks.
 */
function layout(opts: {
  heading: string;
  intro: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  return `
<div style="margin:0;padding:24px 12px;background:${PAGE_BG};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:${NAVY};border-radius:16px 16px 0 0;padding:28px 32px;">
        <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Teman Tumbuh</div>
        <div style="color:#8AD6C1;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Konsultasi Keuangan</div>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;border:1px solid ${BORDER};border-top:none;border-radius:0 0 16px 16px;padding:32px;">
        <h1 style="margin:0 0 12px;color:${DARK};font-size:24px;font-weight:800;letter-spacing:-0.8px;">${escapeHtml(opts.heading)}</h1>
        <p style="margin:0 0 24px;color:${MUTED};font-size:15px;line-height:1.6;">${opts.intro}</p>
        ${opts.bodyHtml}
        <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${BORDER};color:${MUTED};font-size:13px;line-height:1.6;">${opts.footerNote}</p>
      </td>
    </tr>
  </table>
</div>`;
}

export function bookingCreatedEmail(input: BookingCreatedInput): EmailContent {
  const slot = formatSlotId(input.date, input.time);
  const deadline = formatDeadlineId(input.deadline);
  const rows = detailRows([
    { label: 'No. Referensi', value: input.bookingId },
    { label: 'Paket', value: input.service },
    { label: 'Jadwal', value: slot },
    { label: 'Biaya', value: formatRupiah(input.amount) },
  ]);

  // Mayar may have been down at booking time; the status page self-heals the
  // invoice, so it is always a safe destination.
  const ctaHref = input.paymentUrl ?? input.statusUrl;
  const ctaLabel = input.paymentUrl ? 'Bayar Sekarang' : 'Buka Halaman Pembayaran';

  const deadlineLine = deadline
    ? `Mohon selesaikan pembayaran sebelum <strong style="color:${DARK};">${escapeHtml(deadline)}</strong>. Lewat batas itu, jadwal kamu otomatis dilepas agar bisa dipakai orang lain.`
    : 'Mohon selesaikan pembayaran segera agar jadwal kamu tidak dilepas.';

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0">${detailTableHtml(rows)}</table>
    ${buttonHtml(ctaHref, ctaLabel)}
    <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6;">${deadlineLine}</p>
    <p style="margin:16px 0 0;color:${MUTED};font-size:14px;line-height:1.6;">
      Kamu bisa memantau status pembayaran kapan saja di
      <a href="${escapeHtml(input.statusUrl)}" style="color:#205781;">halaman status booking</a>.
    </p>`;

  const text = [
    `Halo ${input.name},`,
    '',
    'Terima kasih! Booking konsultasi kamu sudah kami terima dan jadwalnya kami tahan sementara.',
    '',
    detailTableText(rows),
    '',
    `Selesaikan pembayaran di sini: ${ctaHref}`,
    deadline ? `Batas pembayaran: ${deadline}` : '',
    '',
    `Pantau status booking: ${input.statusUrl}`,
    '',
    'Setelah pembayaran terkonfirmasi, kami kirim undangan Google Meet untuk sesi kamu.',
    '',
    'Teman Tumbuh',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');

  return {
    subject: `Selesaikan pembayaran konsultasi kamu (${input.bookingId})`,
    html: layout({
      heading: 'Booking kamu sudah kami terima',
      intro: `Halo <strong style="color:${DARK};">${escapeHtml(input.name)}</strong>, terima kasih! Jadwal di bawah ini kami tahan sementara sampai pembayaran selesai.`,
      bodyHtml,
      footerNote:
        'Setelah pembayaran terkonfirmasi, kami kirim email berisi link Google Meet untuk sesi kamu. Ada pertanyaan? Balas email ini.',
    }),
    text,
  };
}

export function paymentConfirmedEmail(input: PaymentConfirmedInput): EmailContent {
  const slot = formatSlotId(input.date, input.time);
  const rows = detailRows([
    { label: 'No. Referensi', value: input.bookingId },
    { label: 'Paket', value: input.service },
    { label: 'Jadwal', value: slot },
    { label: 'Biaya', value: formatRupiah(input.amount) },
  ]);

  const meetHtml = input.meetLink
    ? `${buttonHtml(input.meetLink, 'Gabung Google Meet')}
       <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6;">
         Undangan kalender juga sudah kami kirim ke email ini — cukup klik tombol di atas saat sesi dimulai.
       </p>`
    : `<p style="margin:24px 0 0;color:${MUTED};font-size:14px;line-height:1.6;">
         Link Google Meet sedang kami siapkan dan akan menyusul lewat undangan kalender.
         Kamu juga bisa mengeceknya kapan saja di
         <a href="${escapeHtml(input.statusUrl)}" style="color:#205781;">halaman status booking</a>.
       </p>`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0">${detailTableHtml(rows)}</table>
    ${meetHtml}
    ${
      input.meetLink
        ? `<p style="margin:16px 0 0;color:${MUTED};font-size:14px;line-height:1.6;">
             Detail booking kamu ada di
             <a href="${escapeHtml(input.statusUrl)}" style="color:#205781;">halaman status booking</a>.
           </p>`
        : ''
    }`;

  const text = [
    `Halo ${input.name},`,
    '',
    'Pembayaran kamu sudah terkonfirmasi. Sampai jumpa di sesi konsultasi!',
    '',
    detailTableText(rows),
    '',
    input.meetLink
      ? `Link Google Meet: ${input.meetLink}`
      : 'Link Google Meet sedang kami siapkan dan akan menyusul lewat undangan kalender.',
    '',
    `Halaman status booking: ${input.statusUrl}`,
    '',
    'Teman Tumbuh',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');

  return {
    subject: `Pembayaran terkonfirmasi — sesi konsultasi kamu sudah terjadwal (${input.bookingId})`,
    html: layout({
      heading: 'Pembayaran terkonfirmasi',
      intro: `Halo <strong style="color:${DARK};">${escapeHtml(input.name)}</strong>, pembayaran kamu sudah kami terima. Sesi konsultasi kamu resmi terjadwal.`,
      bodyHtml,
      footerNote:
        'Perlu ubah jadwal atau ada pertanyaan sebelum sesi? Balas email ini dan tim kami bantu.',
    }),
    text,
  };
}
