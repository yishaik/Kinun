/**
 * Session state for the whole app: the DataStore, the signed-in user, the active household
 * and its items — plus `useActions()`, the only place UI code should call to change data.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONTENT_VERSION } from '../content';
import { isGearDone } from '../lib/labels';
import { safeStorage } from '../lib/platform';
import { buildSeedItems, missingSeedItems } from '../lib/seed';
import type { AppUser, GearStatus, Household, HouseholdPatch, Item, ItemPatch, NewItem } from '../lib/types';
import { normalizeEmail, type DataStore } from './store';
import { useToast } from './toast';

const SELECTED_KEY = 'kinun:selectedHousehold';
const EMPTY_ITEMS: Item[] = [];

export type SessionStatus = 'auth-loading' | 'signed-out' | 'households-loading' | 'no-household' | 'ready';

interface SessionValue {
  store: DataStore;
  status: SessionStatus;
  user: AppUser | null;
  households: Household[];
  household: Household | null;
  items: Item[];
  itemsLoaded: boolean;
  /** Last error from loading data (shown on screen). */
  loadError: string | null;
  selectHousehold(id: string): void;
}

const SessionContext = createContext<SessionValue | null>(null);

function describeError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code === 'permission-denied') return 'אין הרשאה לנתונים האלה. ודאו שכתובת ה-Gmail שלכם נוספה למשק הבית.';
  if (code === 'unavailable') return 'אין חיבור לשרת כרגע — השינויים יסונכרנו כשהחיבור יחזור.';
  if (code === 'failed-precondition') return 'נדרשת הגדרה נוספת ב-Firebase (בדקו שה-Firestore נוצר).';
  return (err as Error)?.message || 'שגיאה לא ידועה';
}

export function SessionProvider({ store, children }: { store: DataStore; children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  // Subscription results are stored together with the key they belong to, so stale data
  // from a previous user/household is never shown (no state resets inside effects).
  const [householdsState, setHouseholdsState] = useState<{ email: string; list: Household[] } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => safeStorage.get(SELECTED_KEY));
  const [householdState, setHouseholdState] = useState<{ id: string; household: Household | null } | null>(null);
  const [itemsState, setItemsState] = useState<{ id: string; items: Item[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Auth
  useEffect(() => {
    const unsub = store.onAuthChanged((u) => {
      setUser(u);
      setAuthReady(true);
    });
    const authErrors = (store as DataStore & { onAuthError?: (cb: (e: Error) => void) => () => void }).onAuthError?.(
      (e) => toast(`ההתחברות נכשלה: ${describeError(e)}`, 'error'),
    );
    return () => {
      unsub();
      authErrors?.();
    };
  }, [store, toast]);

  // Households for this user
  useEffect(() => {
    if (!user) return;
    const email = user.email;
    return store.watchHouseholdsForEmail(
      email,
      (list) => {
        setHouseholdsState({ email, list });
        setLoadError(null);
      },
      (err) => setLoadError(describeError(err)),
    );
  }, [store, user]);
  const households = user && householdsState?.email === user.email ? householdsState.list : null;

  // Pick the active household
  const activeId = useMemo(() => {
    if (!households?.length) return null;
    if (selectedId && households.some((h) => h.id === selectedId)) return selectedId;
    return [...households].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))[0].id;
  }, [households, selectedId]);

  // Active household + items
  useEffect(() => {
    if (!activeId) return;
    const onErr = (err: Error) => setLoadError(describeError(err));
    const unsubH = store.watchHousehold(activeId, (h) => setHouseholdState({ id: activeId, household: h }), onErr);
    const unsubI = store.watchItems(activeId, (list) => setItemsState({ id: activeId, items: list }), onErr);
    return () => {
      unsubH();
      unsubI();
    };
  }, [store, activeId]);
  const household = activeId && householdState?.id === activeId ? householdState.household : null;
  const itemsLoaded = Boolean(activeId && itemsState?.id === activeId);
  const items = itemsLoaded && itemsState ? itemsState.items : EMPTY_ITEMS;

  // Keep my display profile on the household fresh (so my partner sees my name/photo).
  const profileSynced = useRef<string | null>(null);
  useEffect(() => {
    if (!user || !household || profileSynced.current === household.id) return;
    const current = household.members[user.uid];
    profileSynced.current = household.id;
    if (current && current.name === user.name && current.photoURL === user.photoURL && current.email === user.email)
      return;
    store
      .upsertMemberProfile(household.id, user.uid, { name: user.name, email: user.email, photoURL: user.photoURL })
      .catch(() => {
        /* non-critical */
      });
  }, [store, user, household]);

  const selectHousehold = useCallback((id: string) => {
    safeStorage.set(SELECTED_KEY, id);
    setSelectedId(id);
  }, []);

  const status: SessionStatus = !authReady
    ? 'auth-loading'
    : !user
      ? 'signed-out'
      : households === null
        ? 'households-loading'
        : households.length === 0
          ? 'no-household'
          : 'ready';

  const value = useMemo<SessionValue>(
    () => ({
      store,
      status,
      user,
      households: households ?? [],
      household,
      items,
      itemsLoaded,
      loadError,
      selectHousehold,
    }),
    [store, status, user, households, household, items, itemsLoaded, loadError, selectHousehold],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

/** The active household — only use under screens that render when status === 'ready'. */
export function useHousehold(): Household {
  const { household } = useSession();
  if (!household) throw new Error('No active household');
  return household;
}

/**
 * All data-changing operations, bound to the current user and household.
 * Writes are fire-and-forget for snappy UI (listeners update optimistically);
 * failures surface as toasts.
 */
export function useActions() {
  const { store, user, household, items } = useSession();
  const { toast } = useToast();

  return useMemo(() => {
    const hid = household?.id ?? '';
    const fail = (err: unknown) => toast(`השמירה נכשלה: ${describeError(err)}`, 'error');
    const run = <T,>(p: Promise<T>) => {
      p.catch(fail);
      return p;
    };
    const requireUser = (): AppUser => {
      if (!user) throw new Error('Not signed in');
      return user;
    };

    return {
      async createHousehold(input: { name: string; dueDate: string | null; partnerEmail: string | null }) {
        const u = requireUser();
        const id = await store.createHousehold(u, {
          name: input.name,
          dueDate: input.dueDate,
          inviteEmails: input.partnerEmail ? [normalizeEmail(input.partnerEmail)] : [],
          contentVersion: CONTENT_VERSION,
        });
        safeStorage.set(SELECTED_KEY, id);
        await store.addItems(id, buildSeedItems(), u);
        return id;
      },

      updateHousehold(patch: HouseholdPatch) {
        return run(store.updateHousehold(hid, patch));
      },

      addMemberEmail(email: string) {
        return run(store.addMemberEmail(hid, email));
      },

      removeMemberEmail(email: string) {
        return run(store.removeMemberEmail(hid, email));
      },

      addItem(item: NewItem) {
        return run(store.addItems(hid, [item], requireUser()));
      },

      updateItem(id: string, patch: ItemPatch) {
        return run(store.updateItem(hid, id, patch, requireUser()));
      },

      toggleDone(item: Item) {
        return run(store.updateItem(hid, item.id, { done: !item.done }, requireUser()));
      },

      setGearStatus(item: Item, gearStatus: GearStatus) {
        return run(store.updateItem(hid, item.id, { gearStatus, done: isGearDone(gearStatus) }, requireUser()));
      },

      deleteItem(item: Item) {
        const p = store.deleteItem(hid, item.id);
        if (item.seedId) store.dismissSeed(hid, item.seedId).catch(() => undefined);
        return run(p);
      },

      /** Re-create an item that was just deleted (used by the "undo" toast). */
      restoreItem(item: Item) {
        const {
          id: _id,
          createdAt: _c,
          createdBy: _cb,
          updatedAt: _u,
          updatedBy: _ub,
          doneAt: _da,
          doneBy: _db,
          ...fields
        } = item;
        void _id;
        void _c;
        void _cb;
        void _u;
        void _ub;
        void _da;
        void _db;
        const p = store.addItems(hid, [fields], requireUser());
        if (item.seedId && household) {
          const remaining = household.dismissedSeedIds.filter((s) => s !== item.seedId);
          store.updateHousehold(hid, { dismissedSeedIds: remaining }).catch(() => undefined);
        }
        return run(p);
      },

      /** Default content added in newer app versions that this household doesn't have. */
      pendingContent(): NewItem[] {
        return household ? missingSeedItems(items, household.dismissedSeedIds) : [];
      },

      async applyPendingContent() {
        if (!household) return 0;
        const missing = missingSeedItems(items, household.dismissedSeedIds);
        if (missing.length) await store.addItems(hid, missing, requireUser());
        await store.updateHousehold(hid, { contentVersion: CONTENT_VERSION });
        return missing.length;
      },

      /** Bring back default entries that were deleted earlier. */
      async restoreDismissedContent() {
        if (!household) return 0;
        const restore = missingSeedItems(items, []).filter((s) => household.dismissedSeedIds.includes(s.seedId ?? ''));
        if (restore.length) await store.addItems(hid, restore, requireUser());
        await store.updateHousehold(hid, { dismissedSeedIds: [] });
        return restore.length;
      },

      startContraction() {
        return run(store.startContraction(hid, requireUser()));
      },
      endContraction(id: string) {
        return run(store.endContraction(hid, id));
      },
      deleteContraction(id: string) {
        return run(store.deleteContraction(hid, id));
      },
      clearContractions() {
        return run(store.clearContractions(hid));
      },

      signOut() {
        return run(store.signOut());
      },
    };
  }, [store, user, household, items, toast]);
}

export type Actions = ReturnType<typeof useActions>;
