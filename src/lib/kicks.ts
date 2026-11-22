/**
 * Kick counting. The app counts up to KICK_GOAL; the guidance shown alongside is the Ministry
 * of Health method (see the warnings content): in 30 minutes expect 3–5 movements; fewer than 3 →
 * keep counting another 30 minutes; fewer than 6 in the hour → go to the maternity ER now.
 */
import type { HouseholdRecord } from './types';

export const KICK_GOAL = 10;
const HALF_HOUR = 30 * 60_000;
const HOUR = 60 * 60_000;

/** Tag on a session that reached 3 movements within its first 30 minutes. */
export const MET_30 = 'met30';

export type KickStatus = 'counting' | 'reassuring' | 'continue' | 'urgent' | 'goal';

export function kickStatus(count: number, elapsedMs: number, met30: boolean): KickStatus {
  if (count >= KICK_GOAL) return 'goal';
  if (met30 || count >= 6) return 'reassuring';
  if (elapsedMs < HALF_HOUR) return count >= 3 ? 'reassuring' : 'counting';
  if (elapsedMs < HOUR) return 'continue';
  return 'urgent';
}

/** True when this tap brings the count to 3 inside the first half hour. */
export function reachesMet30(newCount: number, elapsedMs: number): boolean {
  return newCount >= 3 && elapsedMs <= HALF_HOUR;
}

export function activeKickSession(list: HouseholdRecord[]): HouseholdRecord | null {
  return list.find((r) => r.end == null && r.start != null) ?? null;
}

export function pastKickSessions(list: HouseholdRecord[]): HouseholdRecord[] {
  return list.filter((r) => r.end != null && r.start != null).sort((a, b) => (b.start ?? 0) - (a.start ?? 0));
}
