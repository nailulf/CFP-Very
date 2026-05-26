export interface SectionA {
  age: number | '';
  maritalStatus: 'Lajang' | 'Menikah' | 'Cerai' | '';
  dependents: number | '';
  jobStatus: 'Karyawan' | 'PNS-TNI-Polri' | 'Wirausaha' | 'Freelancer' | 'Belum Bekerja' | '';
}

export interface SectionB {
  primaryIncome: number;
  sideIncome: number;
  passiveIncome: number;
}

export interface SectionC {
  basicNeeds: number;
  transportation: number;
  debtPayment: number;
  insurancePremium: number;
  otherExpenses: number;
}

export interface SectionD {
  monthlySavings: number;
  totalSavings: number;
  totalInvestments: number;
  investmentProducts: string[];
}

export interface SectionE {
  propertyValue: number;
  vehicleValue: number;
  otherAssets: number;
}

export interface SectionF {
  mortgageDebt: number;
  vehicleDebt: number;
  creditCardDebt: number;
  otherDebt: number;
}

export interface SectionG {
  healthInsurance: 'BPJS saja' | 'BPJS + Swasta' | 'Swasta saja' | 'Tidak punya' | '';
  hasLifeInsurance: 'Ya' | 'Tidak' | '';
  lifeCoverage: number;
}

export interface FormData {
  A: SectionA;
  B: SectionB;
  C: SectionC;
  D: SectionD;
  E: SectionE;
  F: SectionF;
  G: SectionG;
}

export type RatioStatus = 'green' | 'yellow' | 'red';

export interface RatioResult {
  value: number | null;
  displayValue: string;
  status: RatioStatus;
  score: number;
}

export interface HealthCheckResults {
  emergencyFund: RatioResult;
  savingRatio: RatioResult;
  debtServiceRatio: RatioResult;
  solvencyRatio: RatioResult;
  assetNetWorthRatio: RatioResult;
  debtAssetRatio: RatioResult;
  insuranceCoverage: RatioResult;
  overallScore: number;
  overallLabel: string;
  overallMessage: string;
}
