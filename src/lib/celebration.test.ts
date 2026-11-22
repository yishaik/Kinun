import { describe, expect, it } from 'vitest';
import { celebrationStorageKey, clearCelebration, hasSeenCelebration, markCelebrationSeen } from './celebration';

function memory(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => {
      data.delete(k);
    },
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

describe('celebration memory', () => {
  it('builds a per-household key and remembers a seen celebration', () => {
    const store = memory();
    const key = celebrationStorageKey('hh1', 'bag');
    expect(key).toBe('kinun.celebrate.hh1:bag');
    expect(hasSeenCelebration(key, store)).toBe(false);
    markCelebrationSeen(key, store);
    expect(hasSeenCelebration(key, store)).toBe(true);
    clearCelebration(key, store);
    expect(hasSeenCelebration(key, store)).toBe(false);
  });
});
