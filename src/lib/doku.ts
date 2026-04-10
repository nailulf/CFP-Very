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
  secretKey: string,
  digest?: string
): string {
  let componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}`;

  if (digest) {
    componentSignature += `\nDigest:${digest}`;
  }

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
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requestTarget = '/checkout/v1/payment';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const body = {
    order: {
      amount,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      callback_url: `${baseUrl}/book/confirmation?id=${invoiceNumber}`,
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
    DOKU_SECRET_KEY,
    digest
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

  const paymentUrl = data?.response?.payment?.url || data?.payment?.url;

  if (!paymentUrl) {
    throw new Error(`DOKU: No payment URL in response - ${responseText}`);
  }

  return {
    paymentUrl,
    invoiceNumber,
  };
}

/**
 * Check payment status via DOKU API.
 * GET /orders/v1/status/{invoice_number}
 */
export async function checkPaymentStatus(invoiceNumber: string): Promise<{
  status: string;
  paymentMethod?: string;
}> {
  const requestId = crypto.randomUUID();
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requestTarget = `/orders/v1/status/${invoiceNumber}`;

  // GET requests don't need Digest
  const signature = generateSignature(
    DOKU_CLIENT_ID,
    requestId,
    requestTimestamp,
    requestTarget,
    DOKU_SECRET_KEY
  );

  const response = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
    method: 'GET',
    headers: {
      'Client-Id': DOKU_CLIENT_ID,
      'Request-Id': requestId,
      'Request-Timestamp': requestTimestamp,
      'Signature': signature,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('DOKU status check error:', responseText);
    throw new Error(`DOKU status error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  console.log('DOKU status response:', data);

  const transactionStatus = data?.transaction?.status
    || data?.response?.transaction?.status
    || data?.order?.status
    || '';

  const paymentMethod = data?.payment?.payment_method_type
    || data?.response?.payment?.payment_method_type
    || '';

  return {
    status: transactionStatus,
    paymentMethod,
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
    DOKU_SECRET_KEY,
    digest
  );

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedSignature)
  );
}
