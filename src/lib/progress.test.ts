import { describe, expect, it } from 'vitest';
import { buildSeedItems, missingSeedItems } from './seed';
import { earlierStageTasks, progressOf, upcomingTasks } from './progress';
import type { Item, NewItem } from './types';

let n = 0;
function item(fields: Partial<NewItem> & Pick<NewItem, 'kind'>, createdAt = Date.parse('2026-11-21T08:00:00Z')): Item {
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
    createdAt,
    createdBy: 'u',
    updatedAt: createdAt,
    updatedBy: 'u',
  };
}

const household = { dueDate: '2027-01-01', birthDate: null }; // 2026-11-21 ≈ 34+1
const now = new Date('2026-11-21T12:00:00');

describe('upcoming tasks', () => {
  it('shows tasks due soon, not tasks from stages that passed before they were added', () => {
    const passed = item({ kind: 'task', dueWeek: 20 });
    const soon = item({ kind: 'task', dueWeek: 35, phase: 'prebirth' });
    const later = item({ kind: 'task', dueWeek: 39, phase: 'prebirth' });
    const list = upcomingTasks([passed, soon, later], household, { now, horizonDays: 21 });
    expect(list.map((u) => u.item.id)).toEqual([soon.id]);
    expect(earlierStageTasks([passed, soon, later], household).map((i) => i.id)).toEqual([passed.id]);
  });

  it('flags real overdue tasks (due after they were added)', () => {
    const addedEarly = item({ kind: 'task', dueWeek: 33 }, Date.parse('2026-10-01T08:00:00Z'));
    const list = upcomingTasks([addedEarly], household, { now });
    expect(list).toHaveLength(1);
    expect(list[0].diff).toBeLessThan(0);
  });

  it('includes undated tasks of the current phase, skipping optional ones', () => {
    const undated = item({ kind: 'task', phase: 'pregnancy' });
    const optional = item({ kind: 'task', phase: 'pregnancy', priority: 'optional' });
    const future = item({ kind: 'task', phase: 'firstWeeks' });
    const list = upcomingTasks([undated, optional, future], household, { now, currentPhaseOrder: 1 });
    expect(list.map((u) => u.item.id)).toEqual([undated.id]);
  });

  it('computes progress per kind', () => {
    const items = [item({ kind: 'bag', done: true }), item({ kind: 'bag' }), item({ kind: 'gear' })];
    expect(progressOf(items, 'bag')).toEqual({ done: 1, total: 2, ratio: 0.5 });
  });
});

describe('content updates', () => {
  it('offers only seed entries that are missing and not dismissed', () => {
    const seeds = buildSeedItems();
    const have = seeds.slice(0, 10).map((s) => ({ seedId: s.seedId }));
    const dismissed = [seeds[10].seedId as string];
    const missing = missingSeedItems(have, dismissed);
    expect(missing).toHaveLength(seeds.length - 11);
    expect(missing.some((m) => m.seedId === seeds[10].seedId)).toBe(false);
  });
});
