/** Names list: who loves which name. */
import type { HouseholdRecord } from './types';

export type NameStatus = 'both' | 'no' | 'pending';

/** 'both' when every member loves it, 'no' when anyone said no, otherwise waiting for votes. */
export function nameStatus(r: HouseholdRecord, memberUids: string[]): NameStatus {
  const votes = Object.values(r.votes);
  if (votes.includes('no')) return 'no';
  if (memberUids.length > 0 && memberUids.every((uid) => r.votes[uid] === 'love')) return 'both';
  return 'pending';
}

export const NAME_TAGS = [
  { value: 'any', label: 'לשניהם' },
  { value: 'girl', label: 'בת' },
  { value: 'boy', label: 'בן' },
] as const;
export type NameTag = (typeof NAME_TAGS)[number]['value'];

export function groupNames(list: HouseholdRecord[], memberUids: string[]) {
  const sorted = [...list].sort((a, b) => a.text.localeCompare(b.text, 'he'));
  return {
    both: sorted.filter((r) => nameStatus(r, memberUids) === 'both'),
    pending: sorted.filter((r) => nameStatus(r, memberUids) === 'pending'),
    no: sorted.filter((r) => nameStatus(r, memberUids) === 'no'),
  };
}

/** Case/space-insensitive duplicate check. */
export function hasName(list: HouseholdRecord[], name: string): boolean {
  const n = name.trim().replace(/\s+/g, ' ');
  return list.some((r) => r.text.trim().replace(/\s+/g, ' ') === n);
}
