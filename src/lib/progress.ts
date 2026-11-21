/** Progress and "what's next" selectors over the item list. Pure functions — easy to test. */
import { PHASE_ORDER } from './labels';
import { dateToDayNumber, taskDue } from './pregnancy';
import type { Household, Item, ItemKind } from './types';

export interface Progress {
  done: number;
  total: number;
  ratio: number;
}

export function progressOf(items: Item[], kind: ItemKind, filter?: (i: Item) => boolean): Progress {
  const list = items.filter((i) => i.kind === kind && (!filter || filter(i)));
  const done = list.filter((i) => i.done).length;
  return { done, total: list.length, ratio: list.length ? done / list.length : 0 };
}

export interface UpcomingTask {
  item: Item;
  dueDay: number | null;
  estimated: boolean;
  /** dueDay - today (negative = overdue). */
  diff: number | null;
}

/**
 * True when the task's due date had already passed when the task was added
 * (e.g. the couple started using the app at week 35 — the week-20 tasks aren't "late",
 * they're simply from an earlier stage). Such tasks are shown quietly, not as overdue.
 */
export function isFromEarlierStage(item: Pick<Item, 'createdAt'>, dueDay: number): boolean {
  if (item.createdAt == null) return false;
  return dueDay < dateToDayNumber(new Date(item.createdAt));
}

/** Open tasks whose due date passed before they were added (see isFromEarlierStage). */
export function earlierStageTasks(items: Item[], household: Pick<Household, 'dueDate' | 'birthDate'>): Item[] {
  return items.filter((i) => {
    if (i.kind !== 'task' || i.done) return false;
    const due = taskDue(i, household);
    return due != null && !due.estimated && isFromEarlierStage(i, due.day);
  });
}

/**
 * Open tasks worth looking at now: overdue ones and those due within `horizonDays`,
 * then tasks of the current/earlier phases without a date. Sorted by urgency.
 */
export function upcomingTasks(
  items: Item[],
  household: Pick<Household, 'dueDate' | 'birthDate'>,
  options: { now?: Date; horizonDays?: number; limit?: number; currentPhaseOrder?: number } = {},
): UpcomingTask[] {
  const today = dateToDayNumber(options.now ?? new Date());
  const horizon = options.horizonDays ?? 21;
  const phaseLimit = options.currentPhaseOrder ?? 0;
  const open = items.filter((i) => i.kind === 'task' && !i.done);

  const dated: UpcomingTask[] = [];
  const undatedNow: UpcomingTask[] = [];
  for (const item of open) {
    const due = taskDue(item, household);
    if (due) {
      if (!due.estimated && isFromEarlierStage(item, due.day)) continue;
      const diff = due.day - today;
      if (diff <= horizon) dated.push({ item, dueDay: due.day, estimated: due.estimated, diff });
    } else if (PHASE_ORDER[item.phase] <= phaseLimit && item.priority !== 'optional') {
      undatedNow.push({ item, dueDay: null, estimated: false, diff: null });
    }
  }
  dated.sort((a, b) => (a.diff ?? 0) - (b.diff ?? 0) || a.item.order - b.item.order);
  undatedNow.sort((a, b) => PHASE_ORDER[a.item.phase] - PHASE_ORDER[b.item.phase] || a.item.order - b.item.order);
  const all = [...dated, ...undatedNow];
  return options.limit ? all.slice(0, options.limit) : all;
}

/** Most recently changed items (for the "what happened" feed). */
export function recentActivity(items: Item[], limit = 5): Item[] {
  return [...items]
    .filter((i) => i.updatedAt != null && i.updatedBy != null)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, limit);
}

export function sortItems(list: Item[]): Item[] {
  return [...list].sort(
    (a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1) || a.order - b.order || a.title.localeCompare(b.title, 'he'),
  );
}
