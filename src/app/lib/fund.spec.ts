import { Fund, filterFunds, parseIds } from './fund';

const funds: Fund[] = [
  { id: 'a', name: 'Bond Index ETF', category: 'Fixed income', kind: 'Index ETF', mer: 0.1 },
  { id: 'b', name: 'Equity Fund', category: 'Equity', kind: 'Mutual fund', mer: 2.1 },
  { id: 'c', name: 'Equity Index ETF', category: 'Equity', kind: 'Index ETF', mer: 0.06 },
  { id: 'd', name: 'Money Market Fund', category: 'Cash', kind: 'Mutual fund', mer: 0.3 },
];

describe('filterFunds', () => {
  it('filters by category and sorts by fee', () => {
    const out = filterFunds(funds, { search: '', category: 'Equity', sort: 'mer-asc' });
    expect(out.map((f) => f.id)).toEqual(['c', 'b']);
  });

  it('searches names case-insensitively and ignores whitespace', () => {
    const out = filterFunds(funds, { search: '  INDEX ', category: 'All', sort: 'name' });
    expect(out.map((f) => f.id)).toEqual(['a', 'c']);
  });

  it('does not reorder the input array', () => {
    filterFunds(funds, { search: '', category: 'All', sort: 'mer-desc' });
    expect(funds[0].id).toBe('a');
  });
});

describe('parseIds', () => {
  it('drops unknown and duplicate ids and caps at three', () => {
    expect(parseIds('b,zzz,b,a,c,d', funds)).toEqual(['b', 'a', 'c']);
  });

  it('handles a missing parameter', () => {
    expect(parseIds(null, funds)).toEqual([]);
  });
});
