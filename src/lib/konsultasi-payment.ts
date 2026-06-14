import 'server-only';
import { PAYMENT_ACCOUNTS } from './invoice-payments';

export type PaymentDisplay = {
  banks: { label: string; accountName: string; accountNumber: string }[];
  qrisImageSrc: string;
  qrisName: string;
  whatsappUrl: string;
};

export function getPaymentDisplay(): PaymentDisplay {
  const banks = PAYMENT_ACCOUNTS.filter((a) => a.id === 'bni' || a.id === 'bca').map((a) => ({
    label: a.label,
    accountName: a.accountName,
    accountNumber: a.accountNumber,
  }));

  return {
    banks,
    qrisImageSrc: '/konsultasi-qris.png',
    qrisName: 'Aditya Very Cleverina',
    whatsappUrl:
      'https://wa.me/6281806484635?text=Halo%2C+saya+ingin+konfirmasi+pembayaran+konsultasi',
  };
}
