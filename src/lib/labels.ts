/**
 * Hebrew labels for every enum / category key used by the app.
 * Keep all user-facing names of keys here so content files and UI stay consistent.
 */
import type { GearStatus, ItemKind, PhaseKey, Priority } from './types';

export interface PhaseInfo {
  key: PhaseKey;
  label: string;
  hint: string;
}

/** Ordered from earliest to latest. */
export const PHASES: PhaseInfo[] = [
  { key: 'pregnancy', label: 'במהלך ההריון', hint: 'עד שבוע 34 בערך' },
  { key: 'prebirth', label: 'לקראת הלידה', hint: 'שבועות 34–40' },
  { key: 'labor', label: 'בלידה', hint: 'מהצירים הראשונים ועד חדר הלידה' },
  { key: 'hospital', label: 'בבית החולים', hint: 'מהלידה ועד השחרור' },
  { key: 'firstWeeks', label: 'השבועות הראשונים', hint: '0–6 שבועות אחרי הלידה' },
  { key: 'firstMonths', label: 'החודשים הראשונים', hint: 'חצי השנה הראשונה' },
];

export const PHASE_LABEL: Record<PhaseKey, string> = Object.fromEntries(PHASES.map((p) => [p.key, p.label])) as Record<
  PhaseKey,
  string
>;

export const PHASE_ORDER: Record<PhaseKey, number> = Object.fromEntries(PHASES.map((p, i) => [p.key, i])) as Record<
  PhaseKey,
  number
>;

export const KIND_LABEL: Record<ItemKind, string> = {
  task: 'משימה',
  gear: 'ציוד',
  bag: 'תיק לידה',
  link: 'קישור',
};

export const TASK_CATEGORIES: Record<string, string> = {
  hospital: 'בית החולים והלידה',
  health: 'בריאות ובדיקות',
  rights: 'זכויות וכסף',
  work: 'עבודה וחופשה',
  paperwork: 'רישום וניירת',
  finance: 'חיסכון וביטוח',
  home: 'הבית',
  logistics: 'לוגיסטיקה',
  baby: 'טיפול בתינוק',
  mom: 'החלמה ורווחה',
  family: 'משפחה וחברים',
};

export const GEAR_CATEGORIES: Record<string, string> = {
  sleep: 'שינה',
  travel: 'נסיעות ויציאות',
  feeding: 'האכלה',
  diapering: 'החתלה',
  bath: 'רחצה וטיפוח',
  clothing: 'ביגוד',
  health: 'בריאות ובטיחות',
  home: 'בית',
  mom: 'ליולדת',
};

export const BAG_CATEGORIES: Record<string, string> = {
  docs: 'מסמכים',
  mom: 'ליולדת',
  baby: 'לתינוק',
  partner: 'למלווה',
};

export const LINK_CATEGORIES: Record<string, string> = {
  emergency: 'חירום וקווים חמים',
  hospital: 'בתי חולים',
  rights: 'זכויות וביטוח לאומי',
  registration: 'רישום ומסמכים',
  health: 'בריאות',
  safety: 'בטיחות וציוד',
  support: 'תמיכה והנקה',
};

export const CATEGORY_LABELS: Record<ItemKind, Record<string, string>> = {
  task: TASK_CATEGORIES,
  gear: GEAR_CATEGORIES,
  bag: BAG_CATEGORIES,
  link: LINK_CATEGORIES,
};

/** Label for a category key; unknown (user-defined) categories are shown as typed. */
export function categoryLabel(kind: ItemKind, category: string): string {
  return CATEGORY_LABELS[kind][category] ?? category;
}

/** Category keys in their display order (known ones first, then custom ones A→Z). */
export function orderedCategories(kind: ItemKind, used: Iterable<string>): string[] {
  const known = Object.keys(CATEGORY_LABELS[kind]);
  const usedSet = new Set(used);
  const custom = [...usedSet].filter((c) => !known.includes(c)).sort((a, b) => a.localeCompare(b, 'he'));
  return [...known.filter((k) => usedSet.has(k)), ...custom];
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  must: 'חובה',
  nice: 'מומלץ',
  optional: 'אופציונלי',
};

export const GEAR_STATUS_LABEL: Record<GearStatus, string> = {
  need: 'צריך',
  ordered: 'בדרך',
  have: 'יש',
  skip: 'לא צריך',
};

/** Tap-to-cycle order for the gear status chip. */
export const GEAR_STATUS_CYCLE: GearStatus[] = ['need', 'ordered', 'have', 'skip'];

export function isGearDone(status: GearStatus | null | undefined): boolean {
  return status === 'have' || status === 'skip';
}
