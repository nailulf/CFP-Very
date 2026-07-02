import 'server-only';

// Thin client for the Mayar Headless API v2 (https://docs.mayar.id/api-reference-v2/introduction).
// Sandbox base URL: https://api.mayar.club/hl/v2 — select via MAYAR_BASE_URL.
const DEFAULT_BASE_URL = 'https://api.mayar.id/hl/v2';

type MayarEnvelope<T> = { statusCode: number; messages: string; data: T };

export type MayarInvoice = {
  id: string;
  transactionId?: string;
  /** Hosted payment page URL for the customer. */
  link?: string;
  /** Present on the detail endpoint: 'paid' | 'unpaid' | 'closed'. */
  status?: string;
};

export function isMayarConfigured(): boolean {
  return Boolean(process.env.MAYAR_API_KEY);
}

async function mayarFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.MAYAR_API_KEY;
  if (!key) throw new Error('MAYAR_API_KEY not configured');
  const base = (process.env.MAYAR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => null)) as MayarEnvelope<T> | null;
  if (!res.ok || !body) {
    throw new Error(`Mayar ${path} failed (${res.status}): ${body?.messages ?? 'no response body'}`);
  }
  return body.data;
}

export type CreateInvoiceInput = {
  bookingId: string;
  name: string;
  email: string;
  mobile: string;
  /** Stable service label recorded to the sheet, e.g. 'Konsultasi Keuangan — Paket Starter'. */
  serviceLabel: string;
  /** IDR. */
  amount: number;
  expiredAt: Date;
  /** Public status-page URL — included on the invoice so the customer can find their way back. */
  statusUrl: string;
};

export async function createInvoice(input: CreateInvoiceInput): Promise<MayarInvoice> {
  return mayarFetch<MayarInvoice>('/invoices/create', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      mobile: input.mobile || '-',
      items: [{ quantity: 1, rate: input.amount, description: input.serviceLabel }],
      description: `${input.bookingId} — ${input.serviceLabel}\nCek status booking: ${input.statusUrl}`,
      expiredAt: input.expiredAt.toISOString(),
      extraData: { bookingId: input.bookingId },
    }),
  });
}

export async function getInvoice(id: string): Promise<MayarInvoice> {
  return mayarFetch<MayarInvoice>(`/invoices/${encodeURIComponent(id)}`);
}
