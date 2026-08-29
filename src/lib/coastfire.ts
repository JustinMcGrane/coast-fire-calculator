// Ported line-for-line from the coastfire-calculator.html prototype's project() function.

export interface CoastInputs {
  currentAge: number;
  retireAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  desiredSpending: number;
  swr: number;
}

export interface SeriesPoint {
  age: number;
  value: number;
}

export interface CoastResult {
  retirementNumber: number;
  coastNumberToday: number;
  coastAgeMonths: number | null;
  coastAgeYears: number | null;
  yearlyWithContributions: SeriesPoint[];
  yearlyCoastOnly: SeriesPoint[];
  coastPlan: SeriesPoint[];
  alreadyCoasting: boolean;
  yearsToRetire: number;
}

export const DEFAULT_INPUTS: CoastInputs = {
  currentAge: 30,
  retireAge: 60,
  currentSavings: 65000,
  monthlyContribution: 1200,
  annualReturn: 7,
  desiredSpending: 60000,
  swr: 4,
};

export function project(vals: CoastInputs): CoastResult {
  const {
    currentAge,
    retireAge,
    currentSavings,
    monthlyContribution,
    annualReturn,
    desiredSpending,
    swr,
  } = vals;
  const yearsToRetire = Math.max(retireAge - currentAge, 0);
  const totalMonths = Math.round(yearsToRetire * 12);
  const retirementNumber = swr > 0 ? desiredSpending / (swr / 100) : 0;
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

  let balance = currentSavings;
  let coastAgeMonths: number | null = null;
  const yearlyWithContributions: SeriesPoint[] = [];
  const yearlyCoastOnly: SeriesPoint[] = [];

  // coast-only line: current savings compounding alone, no contributions
  let coastOnlyBalance = currentSavings;

  for (let m = 0; m <= totalMonths; m++) {
    const ageYears = currentAge + m / 12;
    const monthsRemaining = totalMonths - m;
    const requiredNow =
      annualReturn > -100
        ? retirementNumber / Math.pow(1 + annualReturn / 100, monthsRemaining / 12)
        : retirementNumber;

    if (coastAgeMonths === null && balance >= requiredNow) {
      coastAgeMonths = m;
    }

    if (m % 12 === 0) {
      yearlyWithContributions.push({ age: ageYears, value: balance });
      yearlyCoastOnly.push({ age: ageYears, value: coastOnlyBalance });
    }

    balance = balance * (1 + monthlyRate) + monthlyContribution;
    coastOnlyBalance = coastOnlyBalance * (1 + monthlyRate);
  }
  // ensure final point included
  if (totalMonths % 12 !== 0) {
    yearlyWithContributions.push({ age: retireAge, value: balance });
    yearlyCoastOnly.push({ age: retireAge, value: coastOnlyBalance });
  }

  // coast plan line: contribute until coastAgeMonths, then compound only
  const coastPlan: SeriesPoint[] = [];
  if (coastAgeMonths !== null) {
    let b = currentSavings;
    for (let m = 0; m <= totalMonths; m++) {
      if (m % 12 === 0) coastPlan.push({ age: currentAge + m / 12, value: b });
      if (m < coastAgeMonths) {
        b = b * (1 + monthlyRate) + monthlyContribution;
      } else {
        b = b * (1 + monthlyRate);
      }
    }
    if (totalMonths % 12 !== 0) coastPlan.push({ age: retireAge, value: b });
  }

  const coastNumberToday =
    annualReturn > -100
      ? retirementNumber / Math.pow(1 + annualReturn / 100, yearsToRetire)
      : retirementNumber;

  return {
    retirementNumber,
    coastNumberToday,
    coastAgeMonths,
    coastAgeYears: coastAgeMonths !== null ? currentAge + coastAgeMonths / 12 : null,
    yearlyWithContributions,
    yearlyCoastOnly,
    coastPlan,
    alreadyCoasting: currentSavings >= coastNumberToday,
    yearsToRetire,
  };
}

export interface FiInputs {
  currentAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  desiredSpending: number;
  swr: number;
}

export interface FiResult {
  retirementNumber: number;
  fiAgeYears: number | null;
  yearsToFI: number | null;
  series: SeriesPoint[];
  alreadyFI: boolean;
}

export const DEFAULT_FI_INPUTS: FiInputs = {
  currentAge: 30,
  currentSavings: 65000,
  monthlyContribution: 1800,
  annualReturn: 7,
  desiredSpending: 60000,
  swr: 4,
};

const FI_MAX_YEARS = 60;

// Answers a different question than project(): not "what do I need today to
// coast," but "at my current savings rate, when do I hit full FI?" — no
// target retirement age input, since the age is the output here.
export function projectFI(vals: FiInputs): FiResult {
  const { currentAge, currentSavings, monthlyContribution, annualReturn, desiredSpending, swr } = vals;
  const retirementNumber = swr > 0 ? desiredSpending / (swr / 100) : 0;
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const maxMonths = FI_MAX_YEARS * 12;

  const alreadyFI = currentSavings >= retirementNumber;
  let balance = currentSavings;
  let fiMonth: number | null = alreadyFI ? 0 : null;
  const series: SeriesPoint[] = [{ age: currentAge, value: balance }];

  for (let m = 1; m <= maxMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (fiMonth === null && balance >= retirementNumber) {
      fiMonth = m;
    }
    if (m % 12 === 0) {
      series.push({ age: currentAge + m / 12, value: balance });
      if (fiMonth !== null) break;
    }
  }

  return {
    retirementNumber,
    fiAgeYears: fiMonth !== null ? currentAge + fiMonth / 12 : null,
    yearsToFI: fiMonth !== null ? fiMonth / 12 : null,
    series,
    alreadyFI,
  };
}

export interface LongevityInputs {
  currentAge: number;
  currentSavings: number;
  annualWithdrawal: number;
  annualReturn: number;
}

export interface LongevityResult {
  yearsLasting: number | null;
  ageMoneyRunsOut: number | null;
  series: SeriesPoint[];
  lastsIndefinitely: boolean;
}

export const DEFAULT_LONGEVITY_INPUTS: LongevityInputs = {
  currentAge: 60,
  currentSavings: 1000000,
  annualWithdrawal: 45000,
  annualReturn: 5,
};

const LONGEVITY_MAX_YEARS = 60;

// The inverse question from projectFI(): given a starting balance and a fixed
// withdrawal, how long does it last (rather than how long to reach a target)?
export function projectLongevity(vals: LongevityInputs): LongevityResult {
  const { currentAge, currentSavings, annualWithdrawal, annualReturn } = vals;
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const monthlyWithdrawal = annualWithdrawal / 12;
  const maxMonths = LONGEVITY_MAX_YEARS * 12;

  let balance = currentSavings;
  let depletionMonth: number | null = balance <= 0 ? 0 : null;
  const series: SeriesPoint[] = [{ age: currentAge, value: balance }];

  for (let m = 1; m <= maxMonths; m++) {
    balance = balance * (1 + monthlyRate) - monthlyWithdrawal;
    if (balance <= 0 && depletionMonth === null) {
      depletionMonth = m;
      balance = 0;
    }
    if (m % 12 === 0) {
      series.push({ age: currentAge + m / 12, value: Math.max(balance, 0) });
      if (depletionMonth !== null) break;
    }
  }

  return {
    yearsLasting: depletionMonth !== null ? depletionMonth / 12 : null,
    ageMoneyRunsOut: depletionMonth !== null ? currentAge + depletionMonth / 12 : null,
    series,
    lastsIndefinitely: depletionMonth === null,
  };
}

export const fmtUSD = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export const fmtUSDShort = (n: number) => {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + Math.round(n);
};
