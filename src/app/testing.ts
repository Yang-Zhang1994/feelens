import { Fund } from './lib/fund';

export const FUNDS: Fund[] = [
  { id: 'cheap', name: 'Equity Index ETF', category: 'Equity', kind: 'Index ETF', mer: 0.06 },
  { id: 'dear', name: 'Equity Fund, Series A', category: 'Equity', kind: 'Mutual fund', mer: 2.1 },
  { id: 'bond', name: 'Bond Index ETF', category: 'Fixed income', kind: 'Index ETF', mer: 0.1 },
  { id: 'cash', name: 'Money Market Fund', category: 'Cash', kind: 'Mutual fund', mer: 0.3 },
];
