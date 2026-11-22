import { describe, expect, it } from 'vitest';
import { BIRTH_PLAN } from '../content/birthPlan';
import { answeredCount, printableSections, toggleMulti } from './birthPlan';

describe('birth plan helpers', () => {
  const opts = ['תנועה', 'מקלחת', 'אפידורל'];

  it('toggles multi-choice answers in the options order', () => {
    expect(toggleMulti('', 'אפידורל', opts)).toBe('אפידורל');
    expect(toggleMulti('אפידורל', 'תנועה', opts)).toBe('תנועה · אפידורל');
    expect(toggleMulti('תנועה · אפידורל', 'תנועה', opts)).toBe('אפידורל');
  });

  it('counts only known, non-empty answers', () => {
    expect(answeredCount({ music: 'כן', fullName: ' ', old: 'x' })).toBe(1);
  });

  it('prints only the answered fields, in form order', () => {
    const out = printableSections({ notes: 'תודה', fullName: 'נועה', music: 'כן' });
    expect(out.map((s) => s.id)).toEqual(['intro', 'latent', 'more']);
    expect(out[0].rows).toEqual([{ id: 'fullName', label: 'שם מלא', value: 'נועה' }]);
  });

  it('has unique field ids that fit the record limits', () => {
    const ids = BIRTH_PLAN.flatMap((s) => s.fields.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeLessThanOrEqual(60); // firestore.rules → answers.size() <= 60
  });
});
