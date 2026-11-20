import { niceCeil } from './growth-chart';

describe('niceCeil', () => {
  it('rounds up to 1, 2, 2.5 or 5 times a power of ten', () => {
    expect(niceCeil(87_000)).toBe(100_000);
    expect(niceCeil(140_000)).toBe(200_000);
    expect(niceCeil(410)).toBe(500);
    expect(niceCeil(243_443)).toBe(250_000);
    expect(niceCeil(1_000)).toBe(1_000);
  });
});
