import { describe, expect, it } from 'vitest';
import { letterOf, sortedMoments, todayIso } from './journal';
import { recordDefaults, type HouseholdRecord, type NewRecord } from './types';

let n = 0;
const rec = (r: Omit<NewRecord, 'kind'>, by = 'a', at = ++n): HouseholdRecord => ({
  ...recordDefaults({ kind: 'journal', ...r }),
  id: String(at),
  createdAt: at,
  createdBy: by,
  updatedAt: at,
  updatedBy: by,
});

describe('journal', () => {
  it('formats today in local time', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('sorts moments by date, newest first, ignoring other tags', () => {
    const list = [
      rec({ tag: 'moment', date: '2026-10-01', text: 'a' }),
      rec({ tag: 'letter', text: 'x' }),
      rec({ tag: 'moment', date: '2026-11-01', text: 'b' }),
      rec({ tag: 'moment', date: '2026-11-01', text: 'c' }),
    ];
    expect(sortedMoments(list).map((r) => r.text)).toEqual(['c', 'b', 'a']);
  });

  it("finds each partner's own letter", () => {
    const list = [rec({ tag: 'letter', text: 'שלי' }, 'a'), rec({ tag: 'letter', text: 'שלה' }, 'b')];
    expect(letterOf(list, 'b')?.text).toBe('שלה');
    expect(letterOf(list, 'c')).toBeNull();
  });
});
