import { NextResponse } from 'next/server';
import { appendSheetRow, getSheetRowCount } from '@/lib/google-sheets';

const HEADERS = [
  // Contact & Score
  'Timestamp', 'Nama', 'Email', 'No. HP', 'Skor', 'Kategori',
  // Profil (A)
  'Usia', 'Status Pernikahan', 'Tanggungan', 'Pekerjaan',
  // Penghasilan (B)
  'Gaji Utama', 'Pendapatan Sampingan', 'Pendapatan Pasif',
  // Pengeluaran (C)
  'Kebutuhan Pokok', 'Transportasi', 'Cicilan Utang/Bln', 'Premi Asuransi', 'Pengeluaran Lain',
  // Tabungan & Investasi (D)
  'Tabungan/Bulan', 'Total Tabungan', 'Total Investasi', 'Produk Investasi',
  // Aset (E)
  'Nilai Properti', 'Nilai Kendaraan', 'Aset Lain',
  // Utang (F)
  'Sisa KPR', 'Kredit Kendaraan', 'Kartu Kredit', 'Utang Lain',
  // Asuransi (G)
  'Asuransi Kesehatan', 'Asuransi Jiwa', 'UP Jiwa',
  // Hasil Rasio
  'Dana Darurat', 'Status Dana Darurat',
  'Rasio Tabungan', 'Status Rasio Tabungan',
  'DSR', 'Status DSR',
  'Solvency', 'Status Solvency',
  'Inv/Kekayaan Bersih', 'Status Inv/NW',
  'Utang/Aset', 'Status Utang/Aset',
  'Proteksi', 'Status Proteksi',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, results, form } = body as {
      name: string;
      email: string;
      phone?: string;
      results: Record<string, { displayValue: string; status: string; score: number }> & {
        overallScore: number;
        overallLabel: string;
      };
      form: {
        A: { age: number | string; maritalStatus: string; dependents: number | string; jobStatus: string };
        B: { primaryIncome: number; sideIncome: number; passiveIncome: number };
        C: { basicNeeds: number; transportation: number; debtPayment: number; insurancePremium: number; otherExpenses: number };
        D: { monthlySavings: number; totalSavings: number; totalInvestments: number; investmentProducts: string[] };
        E: { propertyValue: number; vehicleValue: number; otherAssets: number };
        F: { mortgageDebt: number; vehicleDebt: number; creditCardDebt: number; otherDebt: number };
        G: { healthInsurance: string; hasLifeInsurance: string; lifeCoverage: number };
      };
    };

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

    const tab = process.env.GOOGLE_HEALTH_CHECK_TAB || 'Health Check Leads';
    const range = `${tab}!A:AV`;

    const rowCount = await getSheetRowCount(sheetId, range);
    if (rowCount === 0) {
      await appendSheetRow(sheetId, range, HEADERS);
    }

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    const row = [
      // Contact & Score
      timestamp, name, email, phone ?? '', Math.round(results.overallScore), results.overallLabel,
      // Profil
      form.A.age, form.A.maritalStatus, form.A.dependents, form.A.jobStatus,
      // Penghasilan
      form.B.primaryIncome, form.B.sideIncome, form.B.passiveIncome,
      // Pengeluaran
      form.C.basicNeeds, form.C.transportation, form.C.debtPayment, form.C.insurancePremium, form.C.otherExpenses,
      // Tabungan & Investasi
      form.D.monthlySavings, form.D.totalSavings, form.D.totalInvestments,
      form.D.investmentProducts.length ? form.D.investmentProducts.join(', ') : '-',
      // Aset
      form.E.propertyValue, form.E.vehicleValue, form.E.otherAssets,
      // Utang
      form.F.mortgageDebt, form.F.vehicleDebt, form.F.creditCardDebt, form.F.otherDebt,
      // Asuransi
      form.G.healthInsurance || '-', form.G.hasLifeInsurance || '-', form.G.lifeCoverage,
      // Rasio
      results.emergencyFund.displayValue,    results.emergencyFund.status,
      results.savingRatio.displayValue,      results.savingRatio.status,
      results.debtServiceRatio.displayValue, results.debtServiceRatio.status,
      results.solvencyRatio.displayValue,    results.solvencyRatio.status,
      results.assetNetWorthRatio.displayValue, results.assetNetWorthRatio.status,
      results.debtAssetRatio.displayValue,   results.debtAssetRatio.status,
      results.insuranceCoverage.displayValue, results.insuranceCoverage.status,
    ];

    await appendSheetRow(sheetId, range, row);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Health check lead save error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}