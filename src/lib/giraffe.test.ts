import { describe, expect, it } from 'vitest';
import { combinedChecklistProgress, giraffeMood } from './giraffe';
import type { Item, NewItem } from './types';

let n = 0;
function item(fields: Partial<NewItem> & Pick<NewItem, 'kind'>): Item {
  n += 1;
  return {
    title: `item ${n}`,
    notes: '',
    category: 'home',
    phase: 'pregnancy',
    done: false,
    order: n,
    links: [],
    ...fields,
    id: `id${n}`,
    createdAt: 1,
    createdBy: 'u',
    updatedAt: 1,
    updatedBy: 'u',
  };
}

describe('giraffeMood', () => {
  it('is sleepy, smiling, then celebrating at the 34% and 80% marks', () => {
    expect(giraffeMood(0)).toBe('sleepy');
    expect(giraffeMood(0.339)).toBe('sleepy');
    expect(giraffeMood(0.34)).toBe('smile');
    expect(giraffeMood(0.79)).toBe('smile');
    expect(giraffeMood(0.8)).toBe('celebrate');
    expect(giraffeMood(1)).toBe('celebrate');
  });
});

describe('combinedChecklistProgress', () => {
  it('sums tasks, must-have gear, and the bag (optional gear is ignored)', () => {
    const items = [
      item({ kind: 'task', done: true }),
      item({ kind: 'task', done: false }),
      item({ kind: 'gear', priority: 'must', done: true }),
      item({ kind: 'gear', priority: 'nice', done: false }),
      item({ kind: 'bag', done: true }),
      item({ kind: 'bag', done: true }),
      item({ kind: 'bag', done: false }),
    ];
    // 1/2 tasks + 1/1 must gear + 2/3 bag = 4/6
    expect(combinedChecklistProgress(items)).toEqual({ done: 4, total: 6, ratio: 4 / 6 });
  });
});
