import { useEffect, useMemo, useState } from 'react';
import type { Household, MemberProfile } from './types';

/** Current time, re-rendering every `intervalMs` (for live timers and "today"). */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Browser online/offline state. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export interface MemberEntry extends MemberProfile {
  uid: string;
}

/** Members with a profile (i.e. who opened the app at least once), owner first. */
export function useMembers(household: Household | null): MemberEntry[] {
  return useMemo(() => {
    if (!household) return [];
    return Object.entries(household.members)
      .map(([uid, p]) => ({ uid, ...p }))
      .sort((a, b) =>
        a.uid === household.ownerUid ? -1 : b.uid === household.ownerUid ? 1 : a.name.localeCompare(b.name, 'he'),
      );
  }, [household]);
}
