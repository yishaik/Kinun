/** Soft night (jungle) vs light vs follow-the-system. Labor mode is a separate dark-room theme. */

export type Appearance = 'system' | 'light' | 'dark';

export const APPEARANCE_KEY = 'kinun.appearance';

export function isAppearance(value: string | null): value is Appearance {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function readAppearance(storage: Pick<Storage, 'getItem'> = localStorage): Appearance {
  try {
    const raw = storage.getItem(APPEARANCE_KEY);
    return isAppearance(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function writeAppearance(appearance: Appearance, storage: Pick<Storage, 'setItem'> = localStorage): void {
  try {
    storage.setItem(APPEARANCE_KEY, appearance);
  } catch {
    /* private mode / quota */
  }
}

export function systemPrefersDark(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  } catch {
    return false;
  }
}

export function resolveTheme(appearance: Appearance, systemDark = systemPrefersDark()): 'light' | 'dark' {
  if (appearance === 'light') return 'light';
  if (appearance === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

const DARK_THEME_COLOR = '#10281C';
const LIGHT_THEME_COLOR = '#F6F1E6';

/** Paint `data-theme` / color-scheme / theme-color so the first frame matches the choice. */
export function applyAppearance(
  appearance: Appearance,
  root: HTMLElement = document.documentElement,
): 'light' | 'dark' {
  const theme = resolveTheme(appearance);
  root.setAttribute('data-appearance', appearance);
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  syncThemeColor(theme);
  return theme;
}

function syncThemeColor(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const color = theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute('content', color);
    meta.removeAttribute('media');
  }
}

/** Apply stored preference and keep `system` in sync with the OS. Returns a cleanup. */
export function startAppearance(): () => void {
  const apply = () => applyAppearance(readAppearance());
  apply();
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (readAppearance() === 'system') apply();
  };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
