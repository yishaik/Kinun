import type { HouseholdRecord } from './types';

export type JournalTag = 'moment' | 'letter' | 'babymoon';

/** Today as yyyy-mm-dd in local time. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function byTag(list: HouseholdRecord[], tag: JournalTag): HouseholdRecord[] {
  return list.filter((r) => r.tag === tag);
}

/** Moments, newest date first (then newest written). */
export function sortedMoments(list: HouseholdRecord[]): HouseholdRecord[] {
  return byTag(list, 'moment').sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );
}

/** One letter per author. */
export function letterOf(list: HouseholdRecord[], uid: string): HouseholdRecord | null {
  return byTag(list, 'letter').find((r) => r.createdBy === uid) ?? null;
}
