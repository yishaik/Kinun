/**
 * Default content entry point.
 *
 * Bump CONTENT_VERSION whenever you add seed entries. Existing households will then see
 * "new default content is available" in Settings and can merge it in (see lib/seed.ts).
 */
export { SEED_TASKS } from './tasks';
export { SEED_GEAR } from './gear';
export { SEED_BAG } from './bag';
export { SEED_LINKS } from './links';
export { SRC } from './sources';

/** Version of the default content. Increment when seed entries are added or changed. */
export const CONTENT_VERSION = 3;

/** Date the default content was last researched / verified. */
export const CONTENT_RESEARCHED_AT = '2026-11-22';
