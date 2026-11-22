import { afterEach, describe, expect, it } from 'vitest';
import {
  APPEARANCE_KEY,
  applyAppearance,
  isAppearance,
  readAppearance,
  resolveTheme,
  writeAppearance,
} from './appearance';

function memory(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
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

describe('appearance', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-appearance');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('reads a stored preference and falls back to system', () => {
    expect(readAppearance(memory())).toBe('system');
    expect(readAppearance(memory({ [APPEARANCE_KEY]: 'dark' }))).toBe('dark');
    expect(readAppearance(memory({ [APPEARANCE_KEY]: 'nope' }))).toBe('system');
    expect(isAppearance('light')).toBe(true);
    expect(isAppearance('sepia')).toBe(false);
  });

  it('resolves system to the current color scheme, and honors a manual override', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('writes the preference and applies data-theme on the root', () => {
    const store = memory();
    writeAppearance('dark', store);
    expect(store.getItem(APPEARANCE_KEY)).toBe('dark');
    applyAppearance('light');
    expect(document.documentElement.getAttribute('data-appearance')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
