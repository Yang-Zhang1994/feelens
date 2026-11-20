export type Category = 'Equity' | 'Balanced' | 'Fixed income' | 'Cash';

export interface Fund {
  id: string;
  name: string;
  category: Category;
  kind: 'Index ETF' | 'Mutual fund';
  /** Management expense ratio, percent per year. */
  mer: number;
}

export interface FundFilter {
  search: string;
  category: Category | 'All';
  sort: 'mer-asc' | 'mer-desc' | 'name';
}

export const MAX_COMPARE = 3;

export function filterFunds(funds: Fund[], filter: FundFilter): Fund[] {
  const term = filter.search.trim().toLowerCase();
  const matches = funds.filter(
    (f) =>
      (filter.category === 'All' || f.category === filter.category) &&
      (!term || f.name.toLowerCase().includes(term)),
  );
  const order: Record<FundFilter['sort'], (a: Fund, b: Fund) => number> = {
    'mer-asc': (a, b) => a.mer - b.mer,
    'mer-desc': (a, b) => b.mer - a.mer,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return [...matches].sort(order[filter.sort]);
}

/** Parse "?ids=a,b" into known fund ids, keeping order, dropping unknowns and duplicates. */
export function parseIds(param: string | null, funds: Fund[]): string[] {
  const known = new Set(funds.map((f) => f.id));
  const ids = (param ?? '').split(',').filter((id) => known.has(id));
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}
