/**
 * Who may use Kinun. The app is private to one couple: only these Google accounts (lower-case)
 * can sign in for real, be added to a household, or read/write data.
 *
 * ⚠️ Keep in sync with `allowlist()` in firestore.rules — the rules are what actually enforce it;
 * this copy only gives a friendly screen instead of "permission denied" errors.
 */
import { normalizeEmail } from '../data/store';

export const ALLOWED_EMAILS: readonly string[] = [
  'yishai.k@gmail.com', // Yishai
  'yishaik@gmail.com', // Yishai (second Google account)
  'lisya.abulafya@gmail.com', // Lisya
];

export function isAllowedEmail(email: string | null | undefined): boolean {
  return Boolean(email) && ALLOWED_EMAILS.includes(normalizeEmail(email ?? ''));
}

/**
 * Whether the "enter demo mode" button may be shown: in development, in `--mode demo` builds,
 * or when explicitly asked for with `?demo`. Production builds never offer it — a production
 * build that can't find its Firebase config shows a "not configured" message instead.
 */
export function demoEntryAllowed(): boolean {
  if (import.meta.env.DEV || import.meta.env.MODE === 'demo' || import.meta.env.VITE_DEMO === 'true') return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('demo');
}

/** The partner account to suggest when creating the household (the other person on the allowlist). */
export function suggestedPartnerEmail(myEmail: string | null | undefined): string {
  const me = normalizeEmail(myEmail ?? '');
  if (me === 'lisya.abulafya@gmail.com') return 'yishai.k@gmail.com';
  if (me === 'yishai.k@gmail.com' || me === 'yishaik@gmail.com') return 'lisya.abulafya@gmail.com';
  return '';
}
