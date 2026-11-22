/** How the home-screen giraffe reacts to combined checklist progress. */
import { progressOf, type Progress } from './progress';
import type { Item } from './types';

export type GiraffeMood = 'sleepy' | 'smile' | 'celebrate';

/** Sleepy below 34%, smiling from 34%, celebrating from 80%. */
export function giraffeMood(ratio: number): GiraffeMood {
  if (ratio >= 0.8) return 'celebrate';
  if (ratio >= 0.34) return 'smile';
  return 'sleepy';
}

/** Tasks + must-have gear + the hospital bag, as one household checklist. */
export function combinedChecklistProgress(items: Item[]): Progress {
  const tasks = progressOf(items, 'task');
  const gear = progressOf(items, 'gear', (i) => i.priority === 'must');
  const bag = progressOf(items, 'bag');
  const done = tasks.done + gear.done + bag.done;
  const total = tasks.total + gear.total + bag.total;
  return { done, total, ratio: total ? done / total : 0 };
}
