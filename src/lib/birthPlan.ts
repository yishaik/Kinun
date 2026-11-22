import { BIRTH_PLAN, MULTI_SEPARATOR } from '../content/birthPlan';

/** Add or remove one option of a multi-choice answer, keeping the options' order. */
export function toggleMulti(value: string, option: string, options: string[]): string {
  const set = new Set(value.split(MULTI_SEPARATOR).filter(Boolean));
  if (set.has(option)) set.delete(option);
  else set.add(option);
  return options.filter((o) => set.has(o)).join(MULTI_SEPARATOR);
}

const KNOWN = new Set(BIRTH_PLAN.flatMap((s) => s.fields.map((f) => f.id)));

export function answeredCount(answers: Record<string, string>): number {
  return Object.entries(answers).filter(([k, v]) => KNOWN.has(k) && v.trim()).length;
}

/** The sections and answered fields to print (empty ones are left out). */
export function printableSections(answers: Record<string, string>) {
  return BIRTH_PLAN.map((s) => ({
    id: s.id,
    title: s.title,
    rows: s.fields
      .filter((f) => (answers[f.id] ?? '').trim())
      .map((f) => ({ id: f.id, label: f.label, value: answers[f.id].trim() })),
  })).filter((s) => s.rows.length > 0);
}
