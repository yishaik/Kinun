import type { GlossaryTerm } from '../content/glossary';

/** Hebrew-aware filter: matches the term, its other names or the definition. Sorted by term. */
export function filterGlossary(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const q = query.trim().toLowerCase();
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'he'));
  if (!q) return sorted;
  const inTitle = (t: GlossaryTerm) => `${t.term} ${t.aka ?? ''}`.toLowerCase().includes(q);
  return [...sorted.filter(inTitle), ...sorted.filter((t) => !inTitle(t) && t.definition.toLowerCase().includes(q))];
}
