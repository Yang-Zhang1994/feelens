export interface Plan {
  initial: number;
  monthly: number;
  years: number;
  /** Assumed return before fees, percent per year. */
  grossReturn: number;
}

/** Monthly rate equivalent to an annual percent, compounded monthly. */
function monthlyRate(annualPercent: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

/** Balance at the end of each year (index 0 = start), contributions made at month end. */
export function balances(plan: Plan, merPercent: number): number[] {
  const r = monthlyRate(plan.grossReturn - merPercent);
  const out = [plan.initial];
  let balance = plan.initial;
  for (let month = 1; month <= plan.years * 12; month++) {
    balance = balance * (1 + r) + plan.monthly;
    if (month % 12 === 0) out.push(balance);
  }
  return out;
}

export interface Outcome {
  endValue: number;
  contributed: number;
  /** What the same plan would be worth with no fee, minus the end value. */
  lostToFees: number;
}

export function outcome(plan: Plan, merPercent: number): Outcome {
  const endValue = balances(plan, merPercent).at(-1)!;
  const noFee = balances(plan, 0).at(-1)!;
  return {
    endValue,
    contributed: plan.initial + plan.monthly * 12 * plan.years,
    lostToFees: noFee - endValue,
  };
}

export function formatMoney(value: number): string {
  return value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
}
