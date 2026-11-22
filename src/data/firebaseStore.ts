/**
 * FirebaseStore — Google sign-in (Firebase Auth) + Firestore with realtime listeners
 * and a persistent offline cache. Both partners see every change within a second,
 * and the app keeps working offline (writes sync when the connection returns).
 *
 * Data layout (see docs/DATA-MODEL.md and firestore.rules):
 *   households/{householdId}
 *   households/{householdId}/items/{itemId}
 *   households/{householdId}/contractions/{contractionId}
 *   households/{householdId}/records/{recordId}   (kicks, birth plan, questions, names, journal)
 */
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  initializeFirestore,
  memoryLocalCache,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { isIOS, isStandalone } from '../lib/platform';
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
import { recordDefaults } from '../lib/types';
import {
  normalizeEmail,
  type CreateHouseholdInput,
  type DataStore,
  type ErrorHandler,
  type Unsubscribe,
} from './store';

const BATCH_LIMIT = 400;

function millis(v: unknown): number | null {
  if (v && typeof v === 'object' && 'toMillis' in v && typeof (v as { toMillis: unknown }).toMillis === 'function') {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === 'number' ? v : null;
}

function toAppUser(u: User): AppUser {
  const email = normalizeEmail(u.email ?? '');
  return { uid: u.uid, email, name: u.displayName || email, photoURL: u.photoURL };
}

function toHousehold(snap: DocumentSnapshot<DocumentData>): Household | null {
  if (!snap.exists()) return null;
  const d = snap.data({ serverTimestamps: 'estimate' });
  return {
    id: snap.id,
    name: d.name ?? '',
    ownerUid: d.ownerUid ?? '',
    memberEmails: d.memberEmails ?? [],
    members: d.members ?? {},
    dueDate: d.dueDate ?? null,
    birthDate: d.birthDate ?? null,
    babyName: d.babyName ?? null,
    hospital: d.hospital ?? null,
    contentVersion: d.contentVersion ?? 0,
    dismissedSeedIds: d.dismissedSeedIds ?? [],
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
  };
}

function toItem(snap: QueryDocumentSnapshot<DocumentData>): Item {
  const d = snap.data({ serverTimestamps: 'estimate' });
  return {
    id: snap.id,
    kind: d.kind,
    title: d.title ?? '',
    notes: d.notes ?? '',
    category: d.category ?? '',
    phase: d.phase ?? 'pregnancy',
    done: d.done === true,
    order: typeof d.order === 'number' ? d.order : 0,
    links: Array.isArray(d.links) ? d.links : [],
    source: d.source ?? null,
    seedId: d.seedId ?? null,
    dueWeek: d.dueWeek ?? null,
    dueDaysAfterBirth: d.dueDaysAfterBirth ?? null,
    assignee: d.assignee ?? null,
    gearStatus: d.gearStatus ?? null,
    priority: d.priority ?? null,
    quantity: d.quantity ?? null,
    price: d.price ?? null,
    url: d.url ?? null,
    phone: d.phone ?? null,
    createdAt: millis(d.createdAt),
    createdBy: d.createdBy ?? null,
    updatedAt: millis(d.updatedAt),
    updatedBy: d.updatedBy ?? null,
    doneAt: millis(d.doneAt),
    doneBy: d.doneBy ?? null,
  };
}

function toContraction(snap: QueryDocumentSnapshot<DocumentData>): Contraction {
  const d = snap.data();
  return {
    id: snap.id,
    start: Number(d.start),
    end: d.end == null ? null : Number(d.end),
    createdBy: d.createdBy ?? null,
  };
}

function toRecord(snap: QueryDocumentSnapshot<DocumentData>): HouseholdRecord {
  const d = snap.data({ serverTimestamps: 'estimate' });
  const num = (v: unknown) => (typeof v === 'number' ? v : null);
  return {
    id: snap.id,
    kind: d.kind,
    text: d.text ?? '',
    note: d.note ?? '',
    done: d.done === true,
    tag: d.tag ?? null,
    date: d.date ?? null,
    start: num(d.start),
    end: num(d.end),
    count: num(d.count),
    votes: d.votes ?? {},
    answers: d.answers ?? {},
    createdAt: millis(d.createdAt),
    createdBy: d.createdBy ?? null,
    updatedAt: millis(d.updatedAt),
    updatedBy: d.updatedBy ?? null,
  };
}

export class FirebaseStore implements DataStore {
  readonly mode = 'firebase' as const;
  private readonly app: FirebaseApp;
  private readonly auth: Auth;
  private readonly db: Firestore;
  private redirectError: Error | null = null;
  private readonly authErrorListeners = new Set<ErrorHandler>();

  constructor(config: FirebaseOptions) {
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.auth.languageCode = 'he';
    let db: Firestore;
    try {
      db = initializeFirestore(this.app, {
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    } catch {
      db = initializeFirestore(this.app, { ignoreUndefinedProperties: true, localCache: memoryLocalCache() });
    }
    this.db = db;
    // Finish a redirect-based sign-in (mobile / home-screen app) and surface its errors.
    getRedirectResult(this.auth).catch((err: Error) => {
      this.redirectError = err;
      for (const l of this.authErrorListeners) l(err);
    });
  }

  // ───────── auth ─────────

  onAuthChanged(cb: (user: AppUser | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, (u) => cb(u && u.email ? toAppUser(u) : null));
  }

  /** Errors from the redirect sign-in flow (which can't throw to the caller). */
  onAuthError(cb: ErrorHandler): Unsubscribe {
    this.authErrorListeners.add(cb);
    if (this.redirectError) cb(this.redirectError);
    return () => this.authErrorListeners.delete(cb);
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // Popup everywhere (Android Chrome and installed Android PWAs handle it well, and the redirect
    // flow there could silently land back on the sign-in screen). Only iOS home-screen apps, where
    // popups don't work, use the redirect flow.
    if (isStandalone() && isIOS()) {
      await signInWithRedirect(this.auth, provider);
      return;
    }
    try {
      await signInWithPopup(this.auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(this.auth, provider);
        return;
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      throw err;
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  // ───────── households ─────────

  private householdRef(id: string) {
    return doc(this.db, 'households', id);
  }

  watchHouseholdsForEmail(email: string, cb: (list: Household[]) => void, onError?: ErrorHandler): Unsubscribe {
    const q = query(collection(this.db, 'households'), where('memberEmails', 'array-contains', normalizeEmail(email)));
    return onSnapshot(
      q,
      (snap) => cb(snap.docs.map((d) => toHousehold(d)).filter((h): h is Household => h !== null)),
      (err) => onError?.(err),
    );
  }

  watchHousehold(id: string, cb: (h: Household | null) => void, onError?: ErrorHandler): Unsubscribe {
    return onSnapshot(
      this.householdRef(id),
      (snap) => cb(toHousehold(snap)),
      (err) => onError?.(err),
    );
  }

  async createHousehold(user: AppUser, input: CreateHouseholdInput): Promise<string> {
    const ref = doc(collection(this.db, 'households'));
    const emails = [...new Set([user.email, ...input.inviteEmails].map(normalizeEmail))];
    await setDoc(ref, {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  async updateHousehold(id: string, patch: HouseholdPatch): Promise<void> {
    await updateDoc(this.householdRef(id), { ...patch, updatedAt: serverTimestamp() });
  }

  async upsertMemberProfile(id: string, uid: string, profile: MemberProfile): Promise<void> {
    await updateDoc(this.householdRef(id), { [`members.${uid}`]: profile });
  }

  async addMemberEmail(id: string, email: string): Promise<void> {
    await updateDoc(this.householdRef(id), {
      memberEmails: arrayUnion(normalizeEmail(email)),
      updatedAt: serverTimestamp(),
    });
  }

  async removeMemberEmail(id: string, email: string): Promise<void> {
    await updateDoc(this.householdRef(id), {
      memberEmails: arrayRemove(normalizeEmail(email)),
      updatedAt: serverTimestamp(),
    });
  }

  async dismissSeed(id: string, seedId: string): Promise<void> {
    await updateDoc(this.householdRef(id), { dismissedSeedIds: arrayUnion(seedId) });
  }

  // ───────── items ─────────

  private itemsCol(householdId: string) {
    return collection(this.db, 'households', householdId, 'items');
  }

  watchItems(householdId: string, cb: (items: Item[]) => void, onError?: ErrorHandler): Unsubscribe {
    return onSnapshot(
      this.itemsCol(householdId),
      (snap) => cb(snap.docs.map(toItem)),
      (err) => onError?.(err),
    );
  }

  async addItems(householdId: string, items: NewItem[], user: AppUser): Promise<string[]> {
    const ids: string[] = [];
    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
      const batch = writeBatch(this.db);
      for (const item of items.slice(i, i + BATCH_LIMIT)) {
        const ref = doc(this.itemsCol(householdId));
        ids.push(ref.id);
        batch.set(ref, {
          ...item,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
          doneAt: item.done ? serverTimestamp() : null,
          doneBy: item.done ? user.uid : null,
        });
      }
      await batch.commit();
    }
    return ids;
  }

  async updateItem(householdId: string, itemId: string, patch: ItemPatch, user: AppUser): Promise<void> {
    const extra =
      patch.done === undefined
        ? {}
        : { doneAt: patch.done ? serverTimestamp() : null, doneBy: patch.done ? user.uid : null };
    await updateDoc(doc(this.itemsCol(householdId), itemId), {
      ...patch,
      ...extra,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });
  }

  async deleteItem(householdId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(this.itemsCol(householdId), itemId));
  }

  // ───────── contractions ─────────

  private contractionsCol(householdId: string) {
    return collection(this.db, 'households', householdId, 'contractions');
  }

  watchContractions(householdId: string, cb: (list: Contraction[]) => void, onError?: ErrorHandler): Unsubscribe {
    return onSnapshot(
      this.contractionsCol(householdId),
      (snap) => cb(snap.docs.map(toContraction)),
      (err) => onError?.(err),
    );
  }

  async startContraction(householdId: string, user: AppUser, at?: number): Promise<string> {
    const ref = doc(this.contractionsCol(householdId));
    await setDoc(ref, { start: at ?? Date.now(), end: null, createdBy: user.uid });
    return ref.id;
  }

  async endContraction(householdId: string, contractionId: string, at?: number): Promise<void> {
    await updateDoc(doc(this.contractionsCol(householdId), contractionId), { end: at ?? Date.now() });
  }

  async deleteContraction(householdId: string, contractionId: string): Promise<void> {
    await deleteDoc(doc(this.contractionsCol(householdId), contractionId));
  }

  async clearContractions(householdId: string): Promise<void> {
    const snap = await getDocs(this.contractionsCol(householdId));
    for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(this.db);
      snap.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  // ───────── records ─────────

  private recordsCol(householdId: string) {
    return collection(this.db, 'households', householdId, 'records');
  }

  watchRecords(
    householdId: string,
    kind: RecordKind,
    cb: (list: HouseholdRecord[]) => void,
    onError?: ErrorHandler,
  ): Unsubscribe {
    return onSnapshot(
      query(this.recordsCol(householdId), where('kind', '==', kind)),
      (snap) => cb(snap.docs.map(toRecord)),
      (err) => onError?.(err),
    );
  }

  async addRecord(householdId: string, record: NewRecord, user: AppUser, id?: string): Promise<string> {
    const ref = id ? doc(this.recordsCol(householdId), id) : doc(this.recordsCol(householdId));
    await setDoc(ref, {
      ...recordDefaults(record),
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });
    return ref.id;
  }

  async updateRecord(householdId: string, recordId: string, patch: RecordPatch, user: AppUser): Promise<void> {
    await updateDoc(doc(this.recordsCol(householdId), recordId), {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });
  }

  async setVote(householdId: string, recordId: string, uid: string, vote: NameVote | null): Promise<void> {
    await updateDoc(doc(this.recordsCol(householdId), recordId), {
      [`votes.${uid}`]: vote ?? deleteField(),
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
  }

  async deleteRecord(householdId: string, recordId: string): Promise<void> {
    await deleteDoc(doc(this.recordsCol(householdId), recordId));
  }
}
