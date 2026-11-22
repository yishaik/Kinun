/** "השבוע שלכם": which weekly card to show, and the couple's tasks for that week. */
import { WEEKS, type WeekInfo } from '../content/weeks';
import type { Item } from './types';

export const FIRST_WEEK = WEEKS[0].week;
export const LAST_WEEK = WEEKS[WEEKS.length - 1].week;

/** Weekly info for a gestational week. Before week 4 → null; after the last covered week → the last one. */
export function weekInfo(week: number): WeekInfo | null {
  if (week < FIRST_WEEK) return null;
  const w = Math.min(week, LAST_WEEK);
  return WEEKS.find((x) => x.week === w) ?? null;
}

/**
 * Open tasks to do "this week": tasks due by the end of this week or the next one,
 * not done, earliest first. Overdue tasks from earlier weeks are left to the home "מה עכשיו" list.
 */
export function weekTasks(items: Item[], week: number, limit = 4): Item[] {
  return items
    .filter((i) => i.kind === 'task' && !i.done && i.dueWeek != null && i.dueWeek >= week && i.dueWeek <= week + 1)
    .sort((a, b) => (a.dueWeek ?? 0) - (b.dueWeek ?? 0) || a.order - b.order)
    .slice(0, limit);
}
