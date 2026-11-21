/**
 * Date math for the pregnancy timeline. All calculations are on calendar dates
 * (no time of day) so that DST and time zones never shift a day.
 *
 * Convention: gestational age is counted from the first day of the last period,
 * which is 280 days (40 weeks) before the estimated due date. "34+2" = 34 full weeks and 2 days.
 */
import type { Household, Item, PhaseKey } from './types';

export const PREGNANCY_DAYS = 280;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar-day number for an ISO date string `YYYY-MM-DD`. */
export function isoToDayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** Calendar-day number of a JS date in the user's local calendar. */
export function dateToDayNumber(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

/** Local `Date` (noon, to be safe) for a day number. */
export function dayNumberToDate(day: number): Date {
  const utc = new Date(day * DAY_MS);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 12);
}

export function dayNumberToIso(day: number): string {
  const utc = new Date(day * DAY_MS);
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso(now: Date = new Date()): string {
  return dayNumberToIso(dateToDayNumber(now));
}

export function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = isoToDayNumber(value);
  return dayNumberToIso(day) === value;
}

export interface PregnancyStatus {
  /** Completed gestational weeks. */
  week: number;
  /** Days into the current week (0–6). */
  day: number;
  /** Total gestational days. */
  gestationalDays: number;
  /** Days until the due date (negative when past it). */
  daysToDue: number;
  /** 0..1 progress through 40 weeks (clamped). */
  progress: number;
  trimester: 1 | 2 | 3;
}

export function pregnancyStatus(dueDate: string, now: Date = new Date()): PregnancyStatus {
  const due = isoToDayNumber(dueDate);
  const today = dateToDayNumber(now);
  const lmp = due - PREGNANCY_DAYS;
  const gestationalDays = Math.max(0, today - lmp);
  const week = Math.floor(gestationalDays / 7);
  const trimester: 1 | 2 | 3 = week < 14 ? 1 : week < 28 ? 2 : 3;
  return {
    week,
    day: gestationalDays % 7,
    gestationalDays,
    daysToDue: due - today,
    progress: Math.min(1, gestationalDays / PREGNANCY_DAYS),
    trimester,
  };
}

/** Day number on which a given gestational week starts. */
export function dayForWeek(dueDate: string, week: number): number {
  return isoToDayNumber(dueDate) - PREGNANCY_DAYS + week * 7;
}

/** Whole days since birth (0 on the birth day). */
export function babyAgeDays(birthDate: string, now: Date = new Date()): number {
  return dateToDayNumber(now) - isoToDayNumber(birthDate);
}

export interface DueInfo {
  /** Day number the task should be done by. */
  day: number;
  /** True when computed from the due date because the birth date is not known yet. */
  estimated: boolean;
}

/**
 * When a task should be done, if it has a timing:
 * - `dueWeek` → the end of that gestational week (based on the due date)
 * - `dueDaysAfterBirth` → birth date + N (or due date + N as an estimate before the birth)
 */
export function taskDue(
  item: Pick<Item, 'dueWeek' | 'dueDaysAfterBirth'>,
  household: Pick<Household, 'dueDate' | 'birthDate'>,
): DueInfo | null {
  if (item.dueWeek != null && household.dueDate) {
    return { day: dayForWeek(household.dueDate, item.dueWeek) + 6, estimated: false };
  }
  if (item.dueDaysAfterBirth != null) {
    if (household.birthDate) {
      return { day: isoToDayNumber(household.birthDate) + item.dueDaysAfterBirth, estimated: false };
    }
    if (household.dueDate) {
      return { day: isoToDayNumber(household.dueDate) + item.dueDaysAfterBirth, estimated: true };
    }
  }
  return null;
}

/** Which phase of the journey the household is in right now. */
export function currentPhase(household: Pick<Household, 'dueDate' | 'birthDate'>, now: Date = new Date()): PhaseKey {
  if (household.birthDate) {
    const age = babyAgeDays(household.birthDate, now);
    if (age <= 2) return 'hospital';
    if (age <= 42) return 'firstWeeks';
    return 'firstMonths';
  }
  if (household.dueDate) {
    const { week } = pregnancyStatus(household.dueDate, now);
    return week >= 34 ? 'prebirth' : 'pregnancy';
  }
  return 'pregnancy';
}

/** "34+2" */
export function formatGestation(status: Pick<PregnancyStatus, 'week' | 'day'>): string {
  return `${status.week}+${status.day}`;
}
