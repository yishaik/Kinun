import { describe, expect, it } from 'vitest';
import { GLOSSARY } from '../content/glossary';
import { filterGlossary } from './glossary';

describe('filterGlossary', () => {
  it('returns every term, sorted, for an empty query', () => {
    const all = filterGlossary(GLOSSARY, '  ');
    expect(all).toHaveLength(GLOSSARY.length);
    const names = all.map((t) => t.term);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'he')));
  });

  it('matches the other name (aka), case-insensitively', () => {
    expect(filterGlossary(GLOSSARY, 'tens').map((t) => t.term)).toContain('טנס');
  });

  it('puts title matches before definition matches', () => {
    const res = filterGlossary(GLOSSARY, 'פתיחה').map((t) => t.term);
    expect(res.slice(0, 2)).toEqual(['פתיחה', 'פתיחה מלאה']);
    expect(res).toContain('שלב המעבר');
  });

  it('returns nothing for an unknown word', () => {
    expect(filterGlossary(GLOSSARY, 'זזזזז')).toEqual([]);
  });
});
