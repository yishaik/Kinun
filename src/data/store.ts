/**
 * The DataStore is the ONLY boundary between the UI and persistence/auth.
 *
 * Implementations:
 * - FirebaseStore (src/data/firebaseStore.ts): Google sign-in + Firestore realtime sync + offline cache.
 * - LocalStore (src/data/localStore.ts): single-device demo mode backed by localStorage.
 *
 * Rules for implementations:
 * - `watch*` methods call back immediately-ish with the current state, then on every change.
 * - Writes are optimistic: listeners fire right away (Firestore does this from its local cache).
 * - Never leak backend types (Timestamp, DocumentSnapshot…) — map to src/lib/types.ts.
 */
import type {
  AppUser,
  Contraction,
  Household,
  HouseholdRecord,
  HouseholdPatch,
  Item,
  ItemPatch,
  MemberProfile,
  NewItem,
  NameVote,
  NewRecord,
  RecordKind,
  RecordPatch,
} from '../lib/types';

export type Unsubscribe = () => void;
export type ErrorHandler = (error: Error) => void;

export interface CreateHouseholdInput {
  name: string;
  dueDate: string | null;
  /** Extra Google account emails allowed in (e.g. the partner). */
  inviteEmails: string[];
  contentVersion: number;
}

export interface DataStore {
  readonly mode: 'firebase' | 'demo';

  // ── auth ──
  onAuthChanged(cb: (user: AppUser | null) => void): Unsubscribe;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;

  // ── households ──
  /** Households whose memberEmails contains this (lower-cased) email. */
  watchHouseholdsForEmail(email: string, cb: (list: Household[]) => void, onError?: ErrorHandler): Unsubscribe;
  watchHousehold(id: string, cb: (h: Household | null) => void, onError?: ErrorHandler): Unsubscribe;
  createHousehold(user: AppUser, input: CreateHouseholdInput): Promise<string>;
  updateHousehold(id: string, patch: HouseholdPatch): Promise<void>;
  /** Set/refresh one member's display profile without touching other members. */
  upsertMemberProfile(id: string, uid: string, profile: MemberProfile): Promise<void>;
  addMemberEmail(id: string, email: string): Promise<void>;
  removeMemberEmail(id: string, email: string): Promise<void>;
  /** Remember that a default-content entry was deleted on purpose. */
  dismissSeed(id: string, seedId: string): Promise<void>;

  // ── items ──
  watchItems(householdId: string, cb: (items: Item[]) => void, onError?: ErrorHandler): Unsubscribe;
  addItems(householdId: string, items: NewItem[], user: AppUser): Promise<string[]>;
  updateItem(householdId: string, itemId: string, patch: ItemPatch, user: AppUser): Promise<void>;
  deleteItem(householdId: string, itemId: string): Promise<void>;

  // ── contraction timer (shared between both phones) ──
  watchContractions(householdId: string, cb: (list: Contraction[]) => void, onError?: ErrorHandler): Unsubscribe;
  startContraction(householdId: string, user: AppUser, at?: number): Promise<string>;
  endContraction(householdId: string, contractionId: string, at?: number): Promise<void>;
  deleteContraction(householdId: string, contractionId: string): Promise<void>;
  clearContractions(householdId: string): Promise<void>;

  // ── records: kicks, birth plan, doctor questions, names, journal (shared) ──
  watchRecords(
    householdId: string,
    kind: RecordKind,
    cb: (list: HouseholdRecord[]) => void,
    onError?: ErrorHandler,
  ): Unsubscribe;
  /** Create a record. With `id`, creates or replaces the record with that id (e.g. the one birth plan). */
  addRecord(householdId: string, record: NewRecord, user: AppUser, id?: string): Promise<string>;
  updateRecord(householdId: string, recordId: string, patch: RecordPatch, user: AppUser): Promise<void>;
  /** Set (or clear, with null) one member's vote on a name, without touching the partner's vote. */
  setVote(householdId: string, recordId: string, uid: string, vote: NameVote | null): Promise<void>;
  deleteRecord(householdId: string, recordId: string): Promise<void>;
}

/** Normalize an email for comparisons and storage. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
