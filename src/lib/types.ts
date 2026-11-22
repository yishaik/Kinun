/**
 * Domain types shared by the whole app.
 *
 * The same shapes are used by every DataStore implementation (Firebase and local demo),
 * so UI code never touches Firestore types directly. Timestamps are plain epoch
 * milliseconds on the client side.
 */

/** What kind of list an item belongs to. */
export type ItemKind = 'task' | 'gear' | 'bag' | 'link';

/** Stage of the journey an item is relevant for. Order matters (see PHASES in labels.ts). */
export type PhaseKey =
  | 'pregnancy' // במהלך ההריון (עד ~שבוע 34)
  | 'prebirth' // לקראת הלידה (שבועות 34–40)
  | 'labor' // בלידה
  | 'hospital' // בבית החולים אחרי הלידה
  | 'firstWeeks' // השבועות הראשונים בבית (0–6 שבועות)
  | 'firstMonths'; // החודשים הראשונים

export type Priority = 'must' | 'nice' | 'optional';

/** Gear lifecycle. `done` on the item is derived from it: have/skip ⇒ done. */
export type GearStatus = 'need' | 'ordered' | 'have' | 'skip';

export interface ItemLink {
  label: string;
  url: string;
}

/** Fields an item carries. Kind-specific fields are optional and ignored by other kinds. */
export interface ItemFields {
  kind: ItemKind;
  title: string;
  notes: string;
  /** Category key (see labels.ts). Free text is allowed for user-defined categories. */
  category: string;
  phase: PhaseKey;
  done: boolean;
  /** Sort order inside its group (lower first). */
  order: number;
  /** Helpful links shown on the item. */
  links: ItemLink[];
  /** Where the information came from (seed content keeps a citation). */
  source?: string | null;
  /** Stable id of the default-content entry this item was created from. */
  seedId?: string | null;

  // ---- task ----
  /** Finish by this pregnancy week (gestational weeks, 0–42). */
  dueWeek?: number | null;
  /** Finish within N days after the birth. */
  dueDaysAfterBirth?: number | null;
  /** `'both'`, a member uid, or null (unassigned). */
  assignee?: string | null;

  // ---- gear / bag ----
  gearStatus?: GearStatus | null;
  priority?: Priority | null;
  /** Free text such as "6–8" or "2". */
  quantity?: string | null;
  price?: number | null;

  // ---- link ----
  url?: string | null;
  phone?: string | null;
}

export interface Item extends ItemFields {
  id: string;
  createdAt: number | null;
  createdBy: string | null;
  updatedAt: number | null;
  updatedBy: string | null;
  doneAt?: number | null;
  doneBy?: string | null;
}

export type NewItem = ItemFields;
export type ItemPatch = Partial<ItemFields>;

export interface HospitalInfo {
  name: string;
  /** Delivery-room / maternity ER phone used by the "call" button in labor mode. */
  phone: string;
  address: string;
  url: string;
  notes: string;
}

export interface MemberProfile {
  name: string;
  email: string;
  photoURL: string | null;
}

export interface Household {
  id: string;
  name: string;
  ownerUid: string;
  /** Lower-cased Google account emails that may access this household. */
  memberEmails: string[];
  /** Display profiles keyed by uid (filled in when a member first opens the app). */
  members: Record<string, MemberProfile>;
  /** Estimated due date, ISO `YYYY-MM-DD`. */
  dueDate: string | null;
  /** Actual birth date, ISO `YYYY-MM-DD`. Switches the app to "after birth" mode. */
  birthDate: string | null;
  babyName: string | null;
  hospital: HospitalInfo | null;
  /** CONTENT_VERSION that was last merged into this household. */
  contentVersion: number;
  /** Seed ids the couple deleted on purpose — never offered again by content updates. */
  dismissedSeedIds: string[];
  createdAt: number | null;
  updatedAt: number | null;
}

export type HouseholdPatch = Partial<
  Pick<
    Household,
    | 'name'
    | 'memberEmails'
    | 'members'
    | 'dueDate'
    | 'birthDate'
    | 'babyName'
    | 'hospital'
    | 'contentVersion'
    | 'dismissedSeedIds'
  >
>;

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
}

export interface Contraction {
  id: string;
  /** Epoch ms. */
  start: number;
  /** Epoch ms, null while the contraction is in progress. */
  end: number | null;
  createdBy: string | null;
}

/**
 * Shared notes and tools that aren't checklist items: kick-count sessions, the birth plan,
 * questions for the doctor, the names list and the journal. One sub-collection
 * (households/{id}/records), told apart by `kind`; unused fields keep their defaults.
 */
export type RecordKind = 'kick' | 'birthPlan' | 'question' | 'name' | 'journal';
export type NameVote = 'love' | 'no';

export interface HouseholdRecord {
  id: string;
  kind: RecordKind;
  /** Main text: the question, the proposed name, the journal entry… */
  text: string;
  /** Secondary text: the doctor's answer, the entry title… */
  note: string;
  /** Question: already asked. */
  done: boolean;
  /** Sub-type: name 'boy' | 'girl' | 'any'; journal 'moment' | 'letter' | 'babymoon'. */
  tag: string | null;
  /** ISO date (yyyy-mm-dd) — journal entries. */
  date: string | null;
  /** Kick session: epoch ms. `end` is null while counting. */
  start: number | null;
  end: number | null;
  /** Kick session: movements counted. */
  count: number | null;
  /** Names: each member's vote, by uid. */
  votes: Record<string, NameVote>;
  /** Birth plan: field id → answer. */
  answers: Record<string, string>;
  createdAt: number | null;
  createdBy: string | null;
  updatedAt: number | null;
  updatedBy: string | null;
}

export type NewRecord = Partial<Omit<HouseholdRecord, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> & {
  kind: RecordKind;
};
export type RecordPatch = Partial<
  Omit<HouseholdRecord, 'id' | 'kind' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>
>;

/** Every field of a record with its default — the shape that is stored. */
export function recordDefaults(
  r: NewRecord,
): Omit<HouseholdRecord, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> {
  return {
    kind: r.kind,
    text: r.text ?? '',
    note: r.note ?? '',
    done: r.done ?? false,
    tag: r.tag ?? null,
    date: r.date ?? null,
    start: r.start ?? null,
    end: r.end ?? null,
    count: r.count ?? null,
    votes: r.votes ?? {},
    answers: r.answers ?? {},
  };
}
