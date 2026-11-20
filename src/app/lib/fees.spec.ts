import { balances, formatMoney, outcome, Plan } from './fees';

const plan: Plan = { initial: 10_000, monthly: 0, years: 10, grossReturn: 6 };

describe('fees', () => {
  it('compounds a lump sum at the net annual rate', () => {
    // 6% gross minus a 1% fee = 5% a year: 10,000 × 1.05^10
    expect(outcome(plan, 1).endValue).toBeCloseTo(10_000 * Math.pow(1.05, 10), 6);
  });

  it('adds monthly contributions as an annuity', () => {
    const flat = { initial: 0, monthly: 100, years: 2, grossReturn: 0 };
    expect(outcome(flat, 0).endValue).toBeCloseTo(2_400, 6);
    expect(outcome(flat, 0).contributed).toBe(2_400);
  });

  it('returns one balance per year plus the start', () => {
    const series = balances(plan, 0.5);
    expect(series).toHaveLength(11);
    expect(series[0]).toBe(10_000);
  });

  it('reports no fee cost for a zero-fee fund', () => {
    expect(outcome(plan, 0).lostToFees).toBeCloseTo(0, 6);
  });

  it('charges a higher-fee fund more and leaves less', () => {
    const cheap = outcome({ ...plan, monthly: 300, years: 25 }, 0.06);
    const dear = outcome({ ...plan, monthly: 300, years: 25 }, 2.1);
    expect(dear.endValue).toBeLessThan(cheap.endValue);
    expect(dear.lostToFees).toBeGreaterThan(cheap.lostToFees);
    // Fee cost plus ending value is the same for every fund: the no-fee value.
    expect(dear.endValue + dear.lostToFees).toBeCloseTo(cheap.endValue + cheap.lostToFees, 6);
  });

  it('formats Canadian dollars without cents', () => {
    expect(formatMoney(12_345.67)).toBe('$12,346');
  });
});
