/** Hebrew formatting helpers. */
import { dayNumberToDate, isoToDayNumber } from './pregnancy';

const dateFmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' });

export function formatIsoDate(iso: string): string {
  return dateFmt.format(dayNumberToDate(isoToDayNumber(iso)));
}

export function formatDayShort(day: number): string {
  return shortDateFmt.format(dayNumberToDate(day));
}

export function formatTime(ms: number): string {
  return timeFmt.format(new Date(ms));
}

/** "היום", "מחר", "בעוד 5 ימים", "לפני 3 ימים" */
export function relativeDays(diff: number): string {
  if (diff === 0) return 'היום';
  if (diff === 1) return 'מחר';
  if (diff === -1) return 'אתמול';
  if (diff === 2) return 'מחרתיים';
  if (diff > 0) return diff < 14 ? `בעוד ${diff} ימים` : `בעוד ${Math.round(diff / 7)} שבועות`;
  const past = -diff;
  return past < 14 ? `לפני ${past} ימים` : `לפני ${Math.round(past / 7)} שבועות`;
}

/** "לפני 5 דק׳" style for activity feeds. */
export function timeAgo(ms: number, now: number = Date.now()): string {
  const sec = Math.round((now - ms) / 1000);
  if (sec < 60) return 'עכשיו';
  const min = Math.round(sec / 60);
  if (min < 60) return `לפני ${min} דק׳`;
  const h = Math.round(min / 60);
  if (h < 24) return h === 1 ? 'לפני שעה' : `לפני ${h} שעות`;
  const d = Math.round(h / 24);
  return d === 1 ? 'אתמול' : `לפני ${d} ימים`;
}

/** Display host of a URL ("btl.gov.il"). */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** `tel:` href that keeps * and # for service codes like *5400. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d*#+]/g, '').replace(/#/g, '%23')}`;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}
