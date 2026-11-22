import { describe, expect, it } from 'vitest';
import { activeKickSession, kickStatus, pastKickSessions, reachesMet30 } from './kicks';
import { recordDefaults, type HouseholdRecord } from './types';

const min = 60_000;
const session = (id: string, start: number, end: number | null, count = 0): HouseholdRecord => ({
  ...recordDefaults({ kind: 'kick', start, end, count }),
  id,
  createdAt: start,
  createdBy: 'u',
  updatedAt: start,
  updatedBy: 'u',
});

describe('kickStatus (MoH method)', () => {
  it('keeps counting during the first half hour until 3 movements', () => {
    expect(kickStatus(0, 5 * min, false)).toBe('counting');
    expect(kickStatus(2, 29 * min, false)).toBe('counting');
    expect(kickStatus(3, 10 * min, false)).toBe('reassuring');
  });

  it('asks for another half hour when fewer than 3 came in the first 30 minutes', () => {
    expect(kickStatus(2, 31 * min, false)).toBe('continue');
    expect(kickStatus(5, 50 * min, false)).toBe('continue');
  });

  it('is reassuring with 6 in the hour, or 3 early', () => {
    expect(kickStatus(6, 55 * min, false)).toBe('reassuring');
    expect(kickStatus(4, 80 * min, true)).toBe('reassuring');
  });

  it('is urgent with fewer than 6 after an hour (unless 3 came early)', () => {
    expect(kickStatus(5, 60 * min, false)).toBe('urgent');
  });

  it('reports the goal', () => {
    expect(kickStatus(10, 200 * min, false)).toBe('goal');
  });

  it('knows when a tap meets the half-hour mark', () => {
    expect(reachesMet30(3, 30 * min)).toBe(true);
    expect(reachesMet30(3, 31 * min)).toBe(false);
    expect(reachesMet30(2, 1 * min)).toBe(false);
  });
});

describe('kick sessions', () => {
  it('splits the live session from the history (newest first)', () => {
    const list = [session('a', 1000, 2000, 10), session('b', 5000, null, 2), session('c', 3000, 4000, 7)];
    expect(activeKickSession(list)?.id).toBe('b');
    expect(pastKickSessions(list).map((s) => s.id)).toEqual(['c', 'a']);
    expect(activeKickSession([])).toBeNull();
  });
});
