// Consultation packages — shared by the booking UI and the booking API.
// Amounts live here (server-trusted) so the client can't tamper with the price;
// marketing copy (name, audience, features) lives in translations.ts, joined by id.

export type KonsultasiPackageId = 'starter' | 'family' | 'comprehensive';

export type KonsultasiPackage = {
  id: KonsultasiPackageId;
  amount: number; // IDR
  /** Stable label recorded to the "Order" sheet (language-independent). */
  service: string;
};

export const KONSULTASI_PACKAGES: KonsultasiPackage[] = [
  { id: 'starter', amount: 500_000, service: 'Konsultasi Keuangan — Paket Starter' },
  { id: 'family', amount: 1_000_000, service: 'Konsultasi Keuangan — Paket Family' },
  { id: 'comprehensive', amount: 2_000_000, service: 'Konsultasi Keuangan — Paket Comprehensive' },
];

export const KONSULTASI_PACKAGE_IDS = KONSULTASI_PACKAGES.map((p) => p.id) as [
  KonsultasiPackageId,
  ...KonsultasiPackageId[],
];

export function getKonsultasiPackage(id: string): KonsultasiPackage | undefined {
  return KONSULTASI_PACKAGES.find((p) => p.id === id);
}

export function formatIDR(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}
