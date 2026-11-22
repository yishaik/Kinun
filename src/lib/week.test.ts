import { describe, expect, it } from 'vitest';
import type { Item } from './types';
import { FIRST_WEEK, LAST_WEEK, weekInfo, weekTasks, weekSize } from './week';

const task = (over: Partial<Item>): Item =>
  ({
    id: Math.random().toString(36).slice(2),
    kind: 'task',
    title: 't',
    notes: '',
    category: 'prep',
    phase: 'prebirth',
    done: false,
    order: 0,
    links: [],
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null,
    ...over,
  }) as Item;

describe('weekInfo', () => {
  it('covers every week from the first to the last without gaps', () => {
    for (let w = FIRST_WEEK; w <= LAST_WEEK; w++) expect(weekInfo(w)?.week).toBe(w);
  });
  it('returns null before the first week and the last week after it', () => {
    expect(weekInfo(FIRST_WEEK - 1)).toBeNull();
    expect(weekInfo(42)?.week).toBe(LAST_WEEK);
  });
});

describe('weekTasks', () => {
  it('lists open tasks due this week or next, earliest first', () => {
    const items = [
      task({ title: 'next', dueWeek: 33, order: 1 }),
      task({ title: 'this', dueWeek: 32, order: 5 }),
      task({ title: 'done', dueWeek: 32, done: true }),
      task({ title: 'later', dueWeek: 35 }),
      task({ title: 'overdue', dueWeek: 30 }),
      task({ title: 'gear', kind: 'gear', dueWeek: 32 }),
      task({ title: 'untimed', dueWeek: null }),
    ];
    expect(weekTasks(items, 32).map((i) => i.title)).toEqual(['this', 'next']);
  });
  it('respects the limit', () => {
    const items = Array.from({ length: 6 }, (_, i) => task({ dueWeek: 20, order: i }));
    expect(weekTasks(items, 20, 4)).toHaveLength(4);
  });
});

describe('weekSize', () => {
  it('uses this week, or the closest of the last 3 weeks that has a comparison', () => {
    expect(weekSize(12)).toEqual({ week: 12, size: 'שזיף' });
    expect(weekSize(13)).toEqual({ week: 12, size: 'שזיף' });
    expect(weekSize(19)).toEqual({ week: 16, size: 'אבוקדו' });
    expect(weekSize(35)).toBeNull();
    expect(weekSize(2)).toBeNull();
  });
});
