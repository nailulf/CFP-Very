import 'server-only';

export type PaymentAccount = {
  id: string;
  label: string;
  accountName: string;
  accountNumber: string;
};

// Edit this list to add / remove / update payment destinations.
// Marked server-only — never bundled to the client outside the auth-gated page.
export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'bni',
    label: 'Rekening BNI',
    accountName: 'Aditya Very Cleverina',
    accountNumber: '3055443324',
  },
  {
    id: 'bca',
    label: 'Rekening BCA',
    accountName: 'Aditya Very Cleverina',
    accountNumber: '8365115873',
  },
  {
    id: 'gopay',
    label: 'GoPay',
    accountName: 'Aditya Very Cleverina',
    accountNumber: '081806484635',
  },
];
