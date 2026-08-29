import { CoastInputs, SeriesPoint } from "./coastfire";

export interface PercentileBandPoint {
  age: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloResult {
  contributing: PercentileBandPoint[];
  coastPlan: PercentileBandPoint[];
  probabilityOfSuccess: number; // % of simulations where contributing path reaches retirementNumber by retireAge
}

// Box-Muller transform for a standard normal sample.
function randomNormal(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Lightly fat-tailed: mostly a normal draw, occasionally (5%) a wider-variance draw
// to approximate the heavier tails real market returns show vs. a pure normal.
function sampleAnnualReturn(meanPct: number, stdDevPct: number): number {
  const tailDraw = Math.random() < 0.05;
  const stdDev = tailDraw ? stdDevPct * 2 : stdDevPct;
  return meanPct + randomNormal() * stdDev;
}

function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function runMonteCarlo(
  vals: CoastInputs,
  coastAgeMonths: number | null,
  retirementNumber: number,
  simulations = 500,
  stdDevPct = 15
): MonteCarloResult {
  const { currentAge, retireAge, currentSavings, monthlyContribution, annualReturn } = vals;
  const yearsToRetire = Math.max(retireAge - currentAge, 0);
  const totalMonths = Math.round(yearsToRetire * 12);

  // yearly snapshots across all simulations
  const yearCount = Math.floor(totalMonths / 12) + 1;
  const contributingByYear: number[][] = Array.from({ length: yearCount }, () => []);
  const coastByYear: number[][] = Array.from({ length: yearCount }, () => []);
  let successes = 0;

  for (let s = 0; s < simulations; s++) {
    let balance = currentSavings;
    let coastBalance = currentSavings;
    let monthlyRate = 0;
    // redraw one annual return per simulated year, applied monthly via its compounded monthly rate
    for (let m = 0; m <= totalMonths; m++) {
      if (m % 12 === 0) {
        const yearIdx = m / 12;
        contributingByYear[yearIdx].push(balance);
        coastByYear[yearIdx].push(coastBalance);
        const yearReturn = sampleAnnualReturn(annualReturn, stdDevPct);
        monthlyRate = Math.pow(1 + yearReturn / 100, 1 / 12) - 1;
      }
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (coastAgeMonths !== null && m < coastAgeMonths) {
        coastBalance = coastBalance * (1 + monthlyRate) + monthlyContribution;
      } else {
        coastBalance = coastBalance * (1 + monthlyRate);
      }
    }
    if (balance >= retirementNumber) successes++;
  }

  const contributing: PercentileBandPoint[] = contributingByYear.map((values, i) => {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      age: currentAge + i,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
    };
  });

  const coastPlan: PercentileBandPoint[] = coastByYear.map((values, i) => {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      age: currentAge + i,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
    };
  });

  return {
    contributing,
    coastPlan,
    probabilityOfSuccess: simulations > 0 ? (successes / simulations) * 100 : 0,
  };
}
