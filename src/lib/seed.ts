/**
 * Turns the default content (src/content) into items a household can store,
 * and finds default entries a household does not have yet (content updates).
 */
import { SEED_BAG, SEED_GEAR, SEED_LINKS, SEED_TASKS } from '../content';
import type { SeedBagItem, SeedGear, SeedLink, SeedTask } from '../content/schema';
import type { Item, NewItem } from './types';

const ORDER_STEP = 10;

function taskToItem(s: SeedTask, i: number): NewItem {
  return {
    kind: 'task',
    seedId: s.seedId,
    title: s.title,
    notes: s.notes ?? '',
    category: s.category,
    phase: s.phase,
    done: false,
    order: i * ORDER_STEP,
    links: s.links ?? [],
    source: s.source ?? null,
    dueWeek: s.dueWeek ?? null,
    dueDaysAfterBirth: s.dueDaysAfterBirth ?? null,
    assignee: null,
    priority: s.optional ? 'optional' : null,
  };
}

function gearToItem(s: SeedGear, i: number): NewItem {
  return {
    kind: 'gear',
    seedId: s.seedId,
    title: s.title,
    notes: s.notes ?? '',
    category: s.category,
    phase: 'prebirth',
    done: false,
    order: i * ORDER_STEP,
    links: s.links ?? [],
    source: s.source ?? null,
    gearStatus: 'need',
    priority: s.priority,
    quantity: s.quantity ?? null,
    price: null,
    assignee: null,
  };
}

function bagToItem(s: SeedBagItem, i: number): NewItem {
  return {
    kind: 'bag',
    seedId: s.seedId,
    title: s.title,
    notes: s.notes ?? '',
    category: s.category,
    phase: 'labor',
    done: false,
    order: i * ORDER_STEP,
    links: s.links ?? [],
    source: s.source ?? null,
    priority: s.priority ?? null,
    quantity: s.quantity ?? null,
    assignee: null,
  };
}

function linkToItem(s: SeedLink, i: number): NewItem {
  return {
    kind: 'link',
    seedId: s.seedId,
    title: s.title,
    notes: s.notes ?? '',
    category: s.category,
    phase: 'pregnancy',
    done: false,
    order: i * ORDER_STEP,
    links: s.links ?? [],
    source: s.source ?? null,
    url: s.url ?? null,
    phone: s.phone ?? null,
  };
}

/** All default content as new items, in display order. */
export function buildSeedItems(): NewItem[] {
  return [
    ...SEED_TASKS.map(taskToItem),
    ...SEED_GEAR.map(gearToItem),
    ...SEED_BAG.map(bagToItem),
    ...SEED_LINKS.map(linkToItem),
  ];
}

/**
 * Default entries the household doesn't have yet and didn't delete on purpose.
 * Used by "content updates" in Settings.
 */
export function missingSeedItems(existing: Pick<Item, 'seedId'>[], dismissedSeedIds: string[]): NewItem[] {
  const have = new Set(existing.map((i) => i.seedId).filter(Boolean));
  const dismissed = new Set(dismissedSeedIds);
  return buildSeedItems().filter((s) => s.seedId && !have.has(s.seedId) && !dismissed.has(s.seedId));
}

/** Next free `order` value at the end of a list. */
export function nextOrder(items: Pick<Item, 'order'>[]): number {
  return items.reduce((max, i) => Math.max(max, i.order ?? 0), 0) + ORDER_STEP;
}
