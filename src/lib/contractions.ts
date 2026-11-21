/**
 * Contraction timer statistics.
 *
 * Interval = start-to-start time between consecutive contractions (the common convention).
 * The app only shows numbers and a gentle "consider calling" hint — it never tells anyone
 * that they are or aren't in labor. Guidance text comes from the default content.
 */
import type { Contraction } from './types';

export interface ContractionStats {
  /** Completed contractions whose start is inside the window. */
  count: number;
  /** Average duration in seconds, or null if none. */
  avgDurationSec: number | null;
  /** Average start-to-start interval in seconds, or null if fewer than two. */
  avgIntervalSec: number | null;
}

export function sortByStart(list: Contraction[]): Contraction[] {
  return [...list].sort((a, b) => a.start - b.start);
}

export function durationSec(c: Contraction): number | null {
  return c.end == null ? null : Math.max(0, Math.round((c.end - c.start) / 1000));
}

/** Interval (seconds) from the previous contraction's start, for each contraction (oldest first). */
export function intervalsSec(sorted: Contraction[]): (number | null)[] {
  return sorted.map((c, i) => (i === 0 ? null : Math.round((c.start - sorted[i - 1].start) / 1000)));
}

export function statsForWindow(list: Contraction[], now: number, windowMs: number): ContractionStats {
  const sorted = sortByStart(list).filter((c) => c.start >= now - windowMs && c.start <= now);
  const completed = sorted.filter((c) => c.end != null);
  const durations = completed.map((c) => durationSec(c) as number);
  const intervals = intervalsSec(sorted).filter((x): x is number => x != null);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  return {
    count: completed.length,
    avgDurationSec: avg(durations),
    avgIntervalSec: intervals.length ? avg(intervals) : null,
  };
}

/**
 * Soft hint: in the last hour there were many contractions roughly every ≤6 minutes.
 * Shown as "worth calling the delivery room" — calling is always fine.
 */
export function suggestCalling(lastHour: ContractionStats): boolean {
  return lastHour.count >= 8 && lastHour.avgIntervalSec != null && lastHour.avgIntervalSec <= 6 * 60;
}

/** "4:05" for seconds; "1:02:03" past an hour. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}
