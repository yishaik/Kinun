import { describe, expect, it } from 'vitest';
import { groupNames, hasName, nameStatus } from './names';
import { recordDefaults, type HouseholdRecord, type NameVote } from './types';

const name = (text: string, votes: Record<string, NameVote> = {}): HouseholdRecord => ({
  ...recordDefaults({ kind: 'name', text, votes }),
  id: text,
  createdAt: 1,
  createdBy: 'a',
  updatedAt: 1,
  updatedBy: 'a',
});

describe('names', () => {
  const members = ['a', 'b'];

  it('is "both" only when every member loves it', () => {
    expect(nameStatus(name('נועם', { a: 'love', b: 'love' }), members)).toBe('both');
    expect(nameStatus(name('נועם', { a: 'love' }), members)).toBe('pending');
    expect(nameStatus(name('נועם', { a: 'love', b: 'no' }), members)).toBe('no');
    expect(nameStatus(name('נועם'), [])).toBe('pending');
  });

  it('groups and sorts by name', () => {
    const g = groupNames(
      [
        name('יובל', { a: 'love', b: 'love' }),
        name('אלה', { a: 'love', b: 'love' }),
        name('תמר'),
        name('דן', { b: 'no' }),
      ],
      members,
    );
    expect(g.both.map((r) => r.text)).toEqual(['אלה', 'יובל']);
    expect(g.pending.map((r) => r.text)).toEqual(['תמר']);
    expect(g.no.map((r) => r.text)).toEqual(['דן']);
  });

  it('finds duplicates ignoring extra spaces', () => {
    expect(hasName([name('אורי')], '  אורי ')).toBe(true);
    expect(hasName([name('אורי')], 'אורית')).toBe(false);
  });
});
