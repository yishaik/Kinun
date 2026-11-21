/**
 * Shapes of the default ("seed") content.
 *
 * Seed entries are copied into a household when it is created, and later
 * content versions can be merged in (see src/lib/seed.ts). After copying,
 * the couple owns their copy and can edit or delete anything.
 *
 * `seedId` must be unique and must NEVER change once released — it is how
 * content updates know what a household already has.
 */
import type { ItemLink, PhaseKey, Priority } from '../lib/types';

interface SeedBase {
  /** Stable unique id, e.g. "task.pack-bag". Never rename after release. */
  seedId: string;
  title: string;
  notes?: string;
  /** Category key from src/lib/labels.ts for this kind. */
  category: string;
  links?: ItemLink[];
  /** URL backing the facts in `notes`. Required for health / rights content. */
  source?: string;
}

export interface SeedTask extends SeedBase {
  phase: PhaseKey;
  /** Gestational week by which this should be done. */
  dueWeek?: number;
  /** Days after birth by which this should be done. */
  dueDaysAfterBirth?: number;
  /** Optional = nice to consider, not everyone needs it. */
  optional?: boolean;
}

export interface SeedGear extends SeedBase {
  priority: Priority;
  quantity?: string;
}

export interface SeedBagItem extends SeedBase {
  priority?: Priority;
  quantity?: string;
}

export interface SeedLink extends SeedBase {
  url?: string;
  phone?: string;
}
