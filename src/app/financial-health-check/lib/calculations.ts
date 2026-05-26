import { FormData, RatioResult, RatioStatus, HealthCheckResults } from './types';

function statusScore(status: RatioStatus): number {
  return status === 'green' ? 100 : status === 'yellow' ? 60 : 25;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatMonths(value: number): string {
  return `${value.toFixed(1)} bulan`;
}

export function computeTotalMonthlyIncome(data: FormData): number {
  return data.B.primaryIncome + data.B.sideIncome + data.B.passiveIncome;
}

export function computeTotalMonthlyExpenses(data: FormData): number {
  return (
    data.C.basicNeeds +
    data.C.transportation +
    data.C.debtPayment +
    data.C.insurancePremium +
    data.C.otherExpenses
  );
}

export function computeTotalAssets(data: FormData): number {
  return (
    data.D.totalSavings +
    data.D.totalInvestments +
    data.E.propertyValue +
    data.E.vehicleValue +
    data.E.otherAssets
  );
}

export function computeTotalLiabilities(data: FormData): number {
  return (
    data.F.mortgageDebt +
    data.F.vehicleDebt +
    data.F.creditCardDebt +
    data.F.otherDebt
  );
}

function getEmergencyFundTarget(data: FormData): { green: number; yellow: [number, number] } {
  const { jobStatus, maritalStatus, dependents } = data.A;
  const isFreelancer = jobStatus === 'Freelancer' || jobStatus === 'Wirausaha';
  const hasDependent = (dependents as number) > 0;
  const isMarried = maritalStatus === 'Menikah';

  if (isFreelancer) {
    return { green: 12, yellow: [6, 11] };
  }
  if (isMarried || hasDependent) {
    return { green: 9, yellow: [6, 8] };
  }
  return { green: 6, yellow: [3, 5] };
}

export function computeEmergencyFund(data: FormData): RatioResult {
  const totalExpenses = computeTotalMonthlyExpenses(data);
  if (totalExpenses === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  const months = data.D.totalSavings / totalExpenses;
  const target = getEmergencyFundTarget(data);

  let status: RatioStatus;
  if (months >= target.green) {
    status = 'green';
  } else if (months >= target.yellow[0]) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: months,
    displayValue: formatMonths(months),
    status,
    score: statusScore(status),
  };
}

export function computeSavingRatio(data: FormData): RatioResult {
  const totalIncome = computeTotalMonthlyIncome(data);
  if (totalIncome === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  const ratio = (data.D.monthlySavings / totalIncome) * 100;

  let status: RatioStatus;
  if (ratio >= 20) {
    status = 'green';
  } else if (ratio >= 10) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: ratio,
    displayValue: formatPercent(ratio),
    status,
    score: statusScore(status),
  };
}

export function computeDebtServiceRatio(data: FormData): RatioResult {
  const totalIncome = computeTotalMonthlyIncome(data);
  if (totalIncome === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  if (data.C.debtPayment === 0) {
    return { value: 0, displayValue: '0.0%', status: 'green', score: 100 };
  }

  const ratio = (data.C.debtPayment / totalIncome) * 100;

  let status: RatioStatus;
  if (ratio < 30) {
    status = 'green';
  } else if (ratio <= 40) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: ratio,
    displayValue: formatPercent(ratio),
    status,
    score: statusScore(status),
  };
}

export function computeSolvencyRatio(data: FormData): RatioResult {
  const totalAssets = computeTotalAssets(data);
  const totalLiabilities = computeTotalLiabilities(data);

  if (totalAssets === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  const ratio = ((totalAssets - totalLiabilities) / totalAssets) * 100;

  let status: RatioStatus;
  if (ratio >= 50) {
    status = 'green';
  } else if (ratio >= 20) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: ratio,
    displayValue: formatPercent(ratio),
    status,
    score: statusScore(status),
  };
}

export function computeAssetNetWorthRatio(data: FormData): RatioResult {
  const totalAssets = computeTotalAssets(data);

  if (totalAssets === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  const totalLiabilities = computeTotalLiabilities(data);
  const totalNetWorth = totalAssets - totalLiabilities;

  if (totalNetWorth <= 0) {
    return { value: 0, displayValue: '0.0%', status: 'red', score: 25 };
  }

  const ratio = (data.D.totalInvestments / totalNetWorth) * 100;

  let status: RatioStatus;
  if (ratio >= 50) {
    status = 'green';
  } else if (ratio >= 20) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: ratio,
    displayValue: formatPercent(ratio),
    status,
    score: statusScore(status),
  };
}

export function computeDebtAssetRatio(data: FormData): RatioResult {
  const totalAssets = computeTotalAssets(data);

  if (totalAssets === 0) {
    return { value: null, displayValue: 'Data tidak cukup', status: 'red', score: 25 };
  }

  const totalLiabilities = computeTotalLiabilities(data);

  if (totalLiabilities === 0) {
    return { value: 0, displayValue: '0.0%', status: 'green', score: 100 };
  }

  const ratio = (totalLiabilities / totalAssets) * 100;

  let status: RatioStatus;
  if (ratio < 30) {
    status = 'green';
  } else if (ratio <= 50) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    value: ratio,
    displayValue: formatPercent(ratio),
    status,
    score: statusScore(status),
  };
}

export function computeInsuranceCoverage(data: FormData): RatioResult {
  let healthScore = 0;
  if (data.G.healthInsurance === 'BPJS + Swasta') healthScore = 2;
  else if (data.G.healthInsurance === 'BPJS saja' || data.G.healthInsurance === 'Swasta saja') healthScore = 1;

  const totalIncome = computeTotalMonthlyIncome(data);
  const annualIncome = totalIncome * 12;

  let lifeScore = 0;
  if (data.G.hasLifeInsurance === 'Ya') {
    if (annualIncome > 0 && data.G.lifeCoverage >= annualIncome * 10) {
      lifeScore = 2;
    } else {
      lifeScore = 1;
    }
  }

  const total = healthScore + lifeScore;

  let status: RatioStatus;
  if (total === 4) {
    status = 'green';
  } else if (total >= 2) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  const displayParts: string[] = [];
  if (data.G.healthInsurance) displayParts.push(data.G.healthInsurance);
  if (data.G.hasLifeInsurance === 'Ya') displayParts.push('Ada jiwa');
  else if (data.G.hasLifeInsurance === 'Tidak') displayParts.push('Tanpa jiwa');
  const displayValue = displayParts.length ? displayParts.join(', ') : 'Tidak ada';

  return {
    value: total,
    displayValue,
    status,
    score: statusScore(status),
  };
}

const SCORE_LABELS: { min: number; label: string; message: string }[] = [
  {
    min: 80,
    label: 'Sangat Sehat',
    message: 'Keuanganmu dalam kondisi prima! Pertahankan dan terus kembangkan.',
  },
  {
    min: 60,
    label: 'Sehat',
    message: 'Keuanganmu sudah cukup baik. Beberapa area masih bisa dioptimalkan.',
  },
  {
    min: 40,
    label: 'Cukup',
    message: 'Ada beberapa area yang perlu diperbaiki. Yuk, mulai rencanakan!',
  },
  {
    min: 0,
    label: 'Perlu Perhatian',
    message: 'Keuanganmu butuh perhatian segera. Konsultasi bisa sangat membantu.',
  },
];

export function computeHealthCheckResults(data: FormData): HealthCheckResults {
  const emergencyFund = computeEmergencyFund(data);
  const savingRatio = computeSavingRatio(data);
  const debtServiceRatio = computeDebtServiceRatio(data);
  const solvencyRatio = computeSolvencyRatio(data);
  const assetNetWorthRatio = computeAssetNetWorthRatio(data);
  const debtAssetRatio = computeDebtAssetRatio(data);
  const insuranceCoverage = computeInsuranceCoverage(data);

  const overallScore =
    emergencyFund.score * 0.18 +
    savingRatio.score * 0.18 +
    debtServiceRatio.score * 0.18 +
    solvencyRatio.score * 0.15 +
    assetNetWorthRatio.score * 0.10 +
    debtAssetRatio.score * 0.06 +
    insuranceCoverage.score * 0.15;

  const labelEntry = SCORE_LABELS.find((l) => overallScore >= l.min)!;

  return {
    emergencyFund,
    savingRatio,
    debtServiceRatio,
    solvencyRatio,
    assetNetWorthRatio,
    debtAssetRatio,
    insuranceCoverage,
    overallScore,
    overallLabel: labelEntry.label,
    overallMessage: labelEntry.message,
  };
}

export interface RecommendationEntry {
  key: keyof Omit<HealthCheckResults, 'overallScore' | 'overallLabel' | 'overallMessage'>;
  label: string;
  text: string;
  priority: number;
}

const RECOMMENDATIONS: RecommendationEntry[] = [
  {
    key: 'emergencyFund',
    label: 'Dana Darurat',
    text: 'Dana daruratmu belum mencukupi. Prioritaskan menyisihkan minimal 10% penghasilanmu ke tabungan darurat sebelum berinvestasi.',
    priority: 1,
  },
  {
    key: 'savingRatio',
    label: 'Rasio Menabung',
    text: 'Cobalah tingkatkan porsi menabung & investasi. Target idealnya minimal 20% dari penghasilan bulananmu.',
    priority: 2,
  },
  {
    key: 'debtServiceRatio',
    label: 'Cicilan Utang',
    text: 'Cicilan utangmu cukup besar. Pertimbangkan strategi pelunasan utang agar cash flow lebih sehat.',
    priority: 3,
  },
  {
    key: 'solvencyRatio',
    label: 'Kekayaan Bersih',
    text: 'Utangmu masih cukup besar dibanding aset. Fokus untuk mengurangi utang konsumtif.',
    priority: 4,
  },
  {
    key: 'assetNetWorthRatio',
    label: 'Investasi vs Kekayaan Bersih',
    text: 'Porsi investasimu terhadap kekayaan bersih masih rendah. Mulai alokasikan dana ke instrumen yang bisa bertumbuh.',
    priority: 5,
  },
  {
    key: 'debtAssetRatio',
    label: 'Rasio Utang terhadap Aset',
    text: 'Utangmu cukup besar dibanding total asetmu. Fokus melunasi utang konsumtif untuk memperkuat posisi keuangan.',
    priority: 6,
  },
  {
    key: 'insuranceCoverage',
    label: 'Proteksi',
    text: 'Proteksimu belum lengkap. Pastikan kamu punya asuransi kesehatan & jiwa yang memadai.',
    priority: 7,
  },
];

export function getTopRecommendations(results: HealthCheckResults, max = 3): RecommendationEntry[] {
  return RECOMMENDATIONS.filter(
    (r) => results[r.key].status === 'red' || results[r.key].status === 'yellow'
  )
    .sort((a, b) => {
      const scoreA = results[a.key].score;
      const scoreB = results[b.key].score;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.priority - b.priority;
    })
    .slice(0, max);
}
