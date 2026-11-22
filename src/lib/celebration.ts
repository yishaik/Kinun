/** Remember which category celebrations the household has already seen. */

const prefix = 'kinun.celebrate.';

export function celebrationStorageKey(householdId: string, topic: string): string {
  return `${prefix}${householdId}:${topic}`;
}

export function hasSeenCelebration(key: string, storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  try {
    return storage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function markCelebrationSeen(key: string, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): void {
  try {
    storage.setItem(key, '1');
  } catch {
    /* private mode / quota — the toast simply will not persist */
  }
}

/** If the list drops below complete, allow the celebration to show again later. */
export function clearCelebration(key: string, storage: Pick<Storage, 'removeItem'> = localStorage): void {
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}
