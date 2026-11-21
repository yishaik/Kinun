/**
 * LocalStore — a DataStore that keeps everything in localStorage on this device.
 *
 * Used for:
 * - demo mode (no Firebase configured, or `?demo=1` / `vite --mode demo`)
 * - unit tests and Playwright e2e tests (no network, deterministic)
 *
 * Two tabs of the same browser stay in sync through the `storage` event, which makes
 * it easy to see the "realtime" UX without a backend.
 */
import { safeStorage } from '../lib/platform';
import type {
  AppUser,
  Contraction,
  Household,
  HouseholdPatch,
  Item,
  ItemPatch,
  MemberProfile,
  NewItem,
} from '../lib/types';
import { normalizeEmail, type CreateHouseholdInput, type DataStore, type Unsubscribe } from './store';

export const DEMO_USER: AppUser = {
  uid: 'demo-user',
  email: 'demo@kinun.local',
  name: 'אורח/ת',
  photoURL: null,
};

interface LocalState {
  version: 1;
  user: AppUser | null;
  households: Record<string, Household>;
  items: Record<string, Record<string, Item>>;
  contractions: Record<string, Record<string, Contraction>>;
}

const emptyState = (): LocalState => ({ version: 1, user: null, households: {}, items: {}, contractions: {} });

export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '').slice(0, 20);
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class LocalStore implements DataStore {
  readonly mode = 'demo' as const;
  private state: LocalState;
  private listeners = new Set<() => void>();

  constructor(
    private readonly storageKey = 'kinun-demo-v1',
    private readonly now: () => number = () => Date.now(),
  ) {
    this.state = this.load();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey) {
          this.state = this.load();
          this.notify();
        }
      });
    }
  }

  // ───────── internals ─────────

  private load(): LocalState {
    const raw = safeStorage.get(this.storageKey);
    if (!raw) return emptyState();
    try {
      const parsed = JSON.parse(raw) as LocalState;
      return parsed?.version === 1 ? parsed : emptyState();
    } catch {
      return emptyState();
    }
  }

  private commit(mutator: (s: LocalState) => void): void {
    mutator(this.state);
    safeStorage.set(this.storageKey, JSON.stringify(this.state));
    this.notify();
  }

  private notify(): void {
    for (const l of [...this.listeners]) l();
  }

  private subscribe(fn: () => void): Unsubscribe {
    this.listeners.add(fn);
    queueMicrotask(() => {
      if (this.listeners.has(fn)) fn();
    });
    return () => {
      this.listeners.delete(fn);
    };
  }

  private requireHousehold(id: string): Household {
    const h = this.state.households[id];
    if (!h) throw new Error(`Household ${id} not found`);
    return h;
  }

  /** Test helper: wipe everything. */
  reset(): void {
    this.commit((s) => Object.assign(s, emptyState()));
  }

  // ───────── auth ─────────

  onAuthChanged(cb: (user: AppUser | null) => void): Unsubscribe {
    let last: string | undefined;
    return this.subscribe(() => {
      const key = JSON.stringify(this.state.user);
      if (key !== last) {
        last = key;
        cb(this.state.user ? clone(this.state.user) : null);
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    this.commit((s) => {
      s.user = { ...DEMO_USER };
    });
  }

  async signOut(): Promise<void> {
    this.commit((s) => {
      s.user = null;
    });
  }

  // ───────── households ─────────

  watchHouseholdsForEmail(email: string, cb: (list: Household[]) => void): Unsubscribe {
    const e = normalizeEmail(email);
    return this.subscribe(() =>
      cb(
        Object.values(this.state.households)
          .filter((h) => h.memberEmails.includes(e))
          .map(clone),
      ),
    );
  }

  watchHousehold(id: string, cb: (h: Household | null) => void): Unsubscribe {
    return this.subscribe(() => {
      const h = this.state.households[id];
      cb(h ? clone(h) : null);
    });
  }

  async createHousehold(user: AppUser, input: CreateHouseholdInput): Promise<string> {
    const id = newId();
    const now = this.now();
    const emails = [...new Set([user.email, ...input.inviteEmails].map(normalizeEmail))];
    this.commit((s) => {
      s.households[id] = {
        id,
        name: input.name,
        ownerUid: user.uid,
        memberEmails: emails,
        members: { [user.uid]: { name: user.name, email: user.email, photoURL: user.photoURL } },
        dueDate: input.dueDate,
        birthDate: null,
        babyName: null,
        hospital: null,
        contentVersion: input.contentVersion,
        dismissedSeedIds: [],
        createdAt: now,
        updatedAt: now,
      };
      s.items[id] = {};
      s.contractions[id] = {};
    });
    return id;
  }

  async updateHousehold(id: string, patch: HouseholdPatch): Promise<void> {
    this.requireHousehold(id);
    this.commit((s) => {
      Object.assign(s.households[id], clone(patch), { updatedAt: this.now() });
    });
  }

  async upsertMemberProfile(id: string, uid: string, profile: MemberProfile): Promise<void> {
    this.requireHousehold(id);
    this.commit((s) => {
      s.households[id].members[uid] = { ...profile };
    });
  }

  async addMemberEmail(id: string, email: string): Promise<void> {
    this.requireHousehold(id);
    const e = normalizeEmail(email);
    this.commit((s) => {
      const h = s.households[id];
      if (!h.memberEmails.includes(e)) h.memberEmails.push(e);
      h.updatedAt = this.now();
    });
  }

  async removeMemberEmail(id: string, email: string): Promise<void> {
    this.requireHousehold(id);
    const e = normalizeEmail(email);
    this.commit((s) => {
      const h = s.households[id];
      h.memberEmails = h.memberEmails.filter((x) => x !== e);
      h.updatedAt = this.now();
    });
  }

  async dismissSeed(id: string, seedId: string): Promise<void> {
    this.requireHousehold(id);
    this.commit((s) => {
      const h = s.households[id];
      if (!h.dismissedSeedIds.includes(seedId)) h.dismissedSeedIds.push(seedId);
    });
  }

  // ───────── items ─────────

  watchItems(householdId: string, cb: (items: Item[]) => void): Unsubscribe {
    return this.subscribe(() => cb(Object.values(this.state.items[householdId] ?? {}).map(clone)));
  }

  async addItems(householdId: string, items: NewItem[], user: AppUser): Promise<string[]> {
    this.requireHousehold(householdId);
    const now = this.now();
    const ids = items.map(() => newId());
    this.commit((s) => {
      const bucket = (s.items[householdId] ??= {});
      items.forEach((item, i) => {
        bucket[ids[i]] = {
          ...clone(item),
          id: ids[i],
          createdAt: now,
          createdBy: user.uid,
          updatedAt: now,
          updatedBy: user.uid,
          doneAt: item.done ? now : null,
          doneBy: item.done ? user.uid : null,
        };
      });
    });
    return ids;
  }

  async updateItem(householdId: string, itemId: string, patch: ItemPatch, user: AppUser): Promise<void> {
    const item = this.state.items[householdId]?.[itemId];
    if (!item) throw new Error(`Item ${itemId} not found`);
    const now = this.now();
    this.commit((s) => {
      const target = s.items[householdId][itemId];
      Object.assign(target, clone(patch), { updatedAt: now, updatedBy: user.uid });
      if (patch.done !== undefined) {
        target.doneAt = patch.done ? now : null;
        target.doneBy = patch.done ? user.uid : null;
      }
    });
  }

  async deleteItem(householdId: string, itemId: string): Promise<void> {
    this.commit((s) => {
      delete s.items[householdId]?.[itemId];
    });
  }

  // ───────── contractions ─────────

  watchContractions(householdId: string, cb: (list: Contraction[]) => void): Unsubscribe {
    return this.subscribe(() => cb(Object.values(this.state.contractions[householdId] ?? {}).map(clone)));
  }

  async startContraction(householdId: string, user: AppUser, at?: number): Promise<string> {
    const id = newId();
    this.commit((s) => {
      (s.contractions[householdId] ??= {})[id] = { id, start: at ?? this.now(), end: null, createdBy: user.uid };
    });
    return id;
  }

  async endContraction(householdId: string, contractionId: string, at?: number): Promise<void> {
    this.commit((s) => {
      const c = s.contractions[householdId]?.[contractionId];
      if (c) c.end = at ?? this.now();
    });
  }

  async deleteContraction(householdId: string, contractionId: string): Promise<void> {
    this.commit((s) => {
      delete s.contractions[householdId]?.[contractionId];
    });
  }

  async clearContractions(householdId: string): Promise<void> {
    this.commit((s) => {
      s.contractions[householdId] = {};
    });
  }
}
