import { describe, expect, it } from 'vitest';
import { formatClock, intervalsSec, sortByStart, statsForWindow, suggestCalling } from './contractions';
import type { Contraction } from './types';

const MIN = 60_000;

function series(count: number, everyMin: number, durationSec: number, endAt: number): Contraction[] {
  return Array.from({ length: count }, (_, i) => {
    const start = endAt - (count - 1 - i) * everyMin * MIN;
    return { id: String(i), start, end: start + durationSec * 1000, createdBy: 'u' };
  });
}

describe('contraction stats', () => {
  const now = Date.UTC(2026, 10, 21, 22, 0);

  it('computes count, average interval and duration inside the window', () => {
    const list = series(10, 5, 60, now - MIN);
    const s = statsForWindow(list, now, 60 * MIN);
    expect(s.count).toBe(10);
    expect(s.avgIntervalSec).toBe(300);
    expect(s.avgDurationSec).toBe(60);
  });

  it('ignores contractions outside the window and in-progress ones for duration', () => {
    const old = series(3, 5, 50, now - 3 * 60 * MIN);
    const running: Contraction = { id: 'r', start: now - 10_000, end: null, createdBy: 'u' };
    const s = statsForWindow([...old, running], now, 60 * MIN);
    expect(s.count).toBe(0);
    expect(s.avgDurationSec).toBeNull();
    expect(s.avgIntervalSec).toBeNull();
  });

  it('suggests calling only for frequent, regular contractions', () => {
    expect(suggestCalling(statsForWindow(series(12, 5, 60, now), now, 60 * MIN))).toBe(true);
    expect(suggestCalling(statsForWindow(series(5, 10, 60, now), now, 60 * MIN))).toBe(false);
    expect(suggestCalling({ count: 9, avgIntervalSec: 8 * 60, avgDurationSec: 50 })).toBe(false);
  });

  it('sorts and computes start-to-start intervals', () => {
    const list = sortByStart([
      { id: 'b', start: 2 * MIN, end: null, createdBy: null },
      { id: 'a', start: 0, end: null, createdBy: null },
    ]);
    expect(list.map((c) => c.id)).toEqual(['a', 'b']);
    expect(intervalsSec(list)).toEqual([null, 120]);
  });

  it('formats clocks', () => {
    expect(formatClock(5)).toBe('0:05');
    expect(formatClock(245)).toBe('4:05');
    expect(formatClock(3723)).toBe('1:02:03');
  });
});
