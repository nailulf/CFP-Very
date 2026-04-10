import crypto from 'crypto';

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID!;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY!;
const DOKU_BASE_URL = (process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com').replace(/\/+$/, '');

interface CreatePaymentParams {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
}

function generateDigest(jsonBody: string): string {
  const hash = crypto.createHash('sha256').update(jsonBody, 'utf8').digest();
  return hash.toString('base64');
}

function generateSignature(
  clientId: string,
  requestId: string,
  requestTimestamp: string,
  requestTarget: string,
  digest: string,
  secretKey: string
): string {
  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digest}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  return `HMACSHA256=${hmac.digest('base64')}`;
}

export async function createPaymentOrder({
  invoiceNumber,
  amount,
  customerName,
  customerEmail,
  itemName,
}: CreatePaymentParams): Promise<{ paymentUrl: string; invoiceNumber: string }> {
  const requestId = crypto.randomUUID();
  // DOKU requires ISO8601 UTC+0 format WITHOUT milliseconds
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requestTarget = '/checkout/v1/payment';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const body = {
    order: {
      amount,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      callback_url: `${baseUrl}/api/payment/webhook`,
      auto_redirect: true,
    },
    payment: {
      payment_due_date: 60,
    },
    customer: {
      name: customerName,
      email: customerEmail,
    },
  };

  const jsonBody = JSON.stringify(body);
  const digest = generateDigest(jsonBody);
  const signature = generateSignature(
    DOKU_CLIENT_ID,
    requestId,
    requestTimestamp,
    requestTarget,
    digest,
    DOKU_SECRET_KEY
  );

  const response = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': DOKU_CLIENT_ID,
      'Request-Id': requestId,
      'Request-Timestamp': requestTimestamp,
      'Signature': signature,
    },
    body: jsonBody,
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('DOKU API error:', responseText);
    throw new Error(`DOKU API error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);

  // DOKU Checkout returns the payment URL in response.payment.url
  const paymentUrl = data?.response?.payment?.url || data?.payment?.url;

  if (!paymentUrl) {
    throw new Error(`DOKU: No payment URL in response - ${responseText}`);
  }

  return {
    paymentUrl,
    invoiceNumber,
  };
}

export function verifyWebhookSignature(
  requestId: string,
  requestTimestamp: string,
  requestTarget: string,
  rawBody: string,
  receivedSignature: string
): boolean {
  const digest = generateDigest(rawBody);
  const expectedSignature = generateSignature(
    DOKU_CLIENT_ID,
    requestId,
    requestTimestamp,
    requestTarget,
    digest,
    DOKU_SECRET_KEY
  );

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}
