/**
 * Security rules tests (run against the Firestore emulator):
 *   npm run test:rules
 * Requires Java 21+ and the Firebase CLI (`npx firebase-tools` works). CI runs this automatically.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

interface TestUser {
  uid: string;
  email: string;
  verified?: boolean;
}

// Allowlisted accounts (see firestore.rules → allowlist() and src/lib/access.ts).
const owner: TestUser = { uid: 'owner', email: 'yishai.k@gmail.com' };
const partner: TestUser = { uid: 'partner', email: 'lisya.abulafya@gmail.com' };
const ownerSecond: TestUser = { uid: 'owner2', email: 'YishaiK@gmail.com' }; // upper-case on purpose
const stranger: TestUser = { uid: 'stranger', email: 'someone@gmail.com' };
const unverifiedPartner: TestUser = { uid: 'fake', email: 'lisya.abulafya@gmail.com', verified: false };

let env: RulesTestEnvironment;

function dbFor(user: TestUser | null): Firestore {
  if (!user) return env.unauthenticatedContext().firestore() as unknown as Firestore;
  return env
    .authenticatedContext(user.uid, { email: user.email, email_verified: user.verified ?? true })
    .firestore() as unknown as Firestore;
}

const householdData = {
  name: 'הבית שלנו',
  ownerUid: owner.uid,
  memberEmails: [owner.email, partner.email],
  members: {},
  dueDate: '2027-01-01',
  birthDate: null,
  babyName: null,
  hospital: null,
  contentVersion: 1,
  dismissedSeedIds: [],
};

const itemData = {
  kind: 'task',
  title: 'לארוז תיק',
  notes: '',
  category: 'hospital',
  phase: 'prebirth',
  done: false,
  order: 0,
  links: [],
};

async function seedHousehold() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore() as unknown as Firestore;
    await setDoc(doc(db, 'households/h1'), householdData);
    await setDoc(doc(db, 'households/h1/items/i1'), itemData);
    await setDoc(doc(db, 'households/h1/contractions/c1'), { start: 1, end: 2, createdBy: owner.uid });
  });
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-kinun',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('households', () => {
  it('lets a verified user create a household they own and belong to', async () => {
    await assertSucceeds(setDoc(doc(dbFor(owner), 'households/new'), householdData));
  });

  it('denies strangers entirely, even for a household of their own', async () => {
    const own = { ...householdData, ownerUid: stranger.uid, memberEmails: [stranger.email] };
    await assertFails(setDoc(doc(dbFor(stranger), 'households/s1'), own));
    await assertFails(setDoc(doc(dbFor(unverifiedPartner), 'households/s2'), { ...householdData, ownerUid: 'fake' }));
    await seedHousehold();
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore() as unknown as Firestore, 'households/s3'), own);
    });
    await assertFails(getDoc(doc(dbFor(stranger), 'households/s3')));
    await assertFails(
      getDocs(
        query(collection(dbFor(stranger), 'households'), where('memberEmails', 'array-contains', stranger.email)),
      ),
    );
  });

  it('lets an allowlisted account (any letter case) create a household', async () => {
    await assertSucceeds(
      setDoc(doc(dbFor(ownerSecond), 'households/second'), {
        ...householdData,
        ownerUid: ownerSecond.uid,
        memberEmails: ['yishaik@gmail.com', partner.email],
      }),
    );
  });

  it('rejects memberEmails with anyone outside the allowlist', async () => {
    await assertFails(
      setDoc(doc(dbFor(owner), 'households/out'), {
        ...householdData,
        memberEmails: [owner.email, 'doula@gmail.com'],
      }),
    );
    await seedHousehold();
    await assertFails(
      updateDoc(doc(dbFor(partner), 'households/h1'), {
        memberEmails: [owner.email, partner.email, 'doula@gmail.com'],
      }),
    );
  });

  it('rejects unknown household fields', async () => {
    await assertFails(setDoc(doc(dbFor(owner), 'households/extra'), { ...householdData, isAdmin: true }));
  });

  it('rejects creating a household for someone else or without yourself in it', async () => {
    await assertFails(setDoc(doc(dbFor(stranger), 'households/x'), householdData));
    await assertFails(setDoc(doc(dbFor(owner), 'households/y'), { ...householdData, memberEmails: [partner.email] }));
    await assertFails(setDoc(doc(dbFor(null), 'households/z'), householdData));
  });

  it('lets members read and query; everyone else is denied', async () => {
    await seedHousehold();
    await assertSucceeds(getDoc(doc(dbFor(partner), 'households/h1')));
    await assertSucceeds(
      getDocs(query(collection(dbFor(partner), 'households'), where('memberEmails', 'array-contains', partner.email))),
    );
    await assertFails(getDoc(doc(dbFor(stranger), 'households/h1')));
    await assertFails(getDocs(collection(dbFor(stranger), 'households')));
    await assertFails(getDoc(doc(dbFor(unverifiedPartner), 'households/h1')));
    await assertFails(getDoc(doc(dbFor(null), 'households/h1')));
  });

  it('lets members update details and invite, but not change the owner', async () => {
    await seedHousehold();
    const db = dbFor(partner);
    await assertSucceeds(updateDoc(doc(db, 'households/h1'), { dueDate: '2027-01-05' }));
    await assertSucceeds(
      updateDoc(doc(db, 'households/h1'), { memberEmails: [owner.email, partner.email, 'yishaik@gmail.com'] }),
    );
    await assertFails(updateDoc(doc(db, 'households/h1'), { ownerUid: partner.uid }));
    await assertFails(updateDoc(doc(dbFor(stranger), 'households/h1'), { dueDate: '2027-02-01' }));
  });

  it('only the owner can delete the household', async () => {
    await seedHousehold();
    await assertFails(deleteDoc(doc(dbFor(partner), 'households/h1')));
    await assertSucceeds(deleteDoc(doc(dbFor(owner), 'households/h1')));
  });
});

describe('items and contractions', () => {
  it('members can read, add, edit and delete items', async () => {
    await seedHousehold();
    const db = dbFor(partner);
    await assertSucceeds(getDocs(collection(db, 'households/h1/items')));
    await assertSucceeds(setDoc(doc(db, 'households/h1/items/i2'), { ...itemData, title: 'סלקל' }));
    await assertSucceeds(updateDoc(doc(db, 'households/h1/items/i1'), { done: true }));
    await assertSucceeds(deleteDoc(doc(db, 'households/h1/items/i2')));
  });

  it('rejects invalid items', async () => {
    await seedHousehold();
    const db = dbFor(owner);
    await assertFails(setDoc(doc(db, 'households/h1/items/bad'), { ...itemData, kind: 'virus' }));
    await assertFails(setDoc(doc(db, 'households/h1/items/bad2'), { ...itemData, title: '' }));
    await assertFails(updateDoc(doc(db, 'households/h1/items/i1'), { done: 'yes' }));
    await assertFails(setDoc(doc(db, 'households/h1/items/bad3'), { ...itemData, hack: 1 }));
    await assertFails(updateDoc(doc(db, 'households/h1/items/i1'), { surprise: 'x' }));
  });

  it('accepts every field the app writes on an item', async () => {
    await seedHousehold();
    const full = {
      ...itemData,
      source: 'https://example.org',
      seedId: 'task.x',
      dueWeek: 36,
      dueDaysAfterBirth: null,
      assignee: 'both',
      gearStatus: null,
      priority: 'must',
      quantity: '2',
      price: 120,
      url: null,
      phone: null,
      createdAt: 1,
      createdBy: owner.uid,
      updatedAt: 1,
      updatedBy: owner.uid,
      doneAt: null,
      doneBy: null,
    };
    await assertSucceeds(setDoc(doc(dbFor(owner), 'households/h1/items/full'), full));
  });

  it('strangers cannot touch items or contractions', async () => {
    await seedHousehold();
    const db = dbFor(stranger);
    await assertFails(getDocs(collection(db, 'households/h1/items')));
    await assertFails(setDoc(doc(db, 'households/h1/items/i9'), itemData));
    await assertFails(getDocs(collection(db, 'households/h1/contractions')));
  });

  it('members share the contraction timer', async () => {
    await seedHousehold();
    const db = dbFor(partner);
    await assertSucceeds(
      setDoc(doc(db, 'households/h1/contractions/c2'), { start: 10, end: null, createdBy: partner.uid }),
    );
    await assertSucceeds(updateDoc(doc(db, 'households/h1/contractions/c2'), { end: 70 }));
    await assertSucceeds(getDocs(collection(db, 'households/h1/contractions')));
  });

  it('rejects invalid contractions', async () => {
    await seedHousehold();
    const db = dbFor(partner);
    const c = (id: string) => doc(db, `households/h1/contractions/${id}`);
    await assertFails(setDoc(c('x1'), { start: 'now', end: null, createdBy: partner.uid }));
    await assertFails(setDoc(c('x2'), { start: 10, end: 'later', createdBy: partner.uid }));
    await assertFails(setDoc(c('x3'), { start: 10, end: null, createdBy: partner.uid, note: 'hi' }));
    await assertFails(setDoc(c('x4'), { end: null, createdBy: partner.uid }));
    await assertFails(updateDoc(doc(db, 'households/h1/contractions/c1'), { end: 'x' }));
  });

  it('strangers cannot write contractions even with a valid shape', async () => {
    await seedHousehold();
    await assertFails(
      setDoc(doc(dbFor(stranger), 'households/h1/contractions/z'), { start: 1, end: null, createdBy: stranger.uid }),
    );
  });
});
