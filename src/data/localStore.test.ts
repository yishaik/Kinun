import { describe, expect, it, vi } from 'vitest';
import type { Household, HouseholdRecord, Item } from '../lib/types';
import { DEMO_USER, LocalStore } from './localStore';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('LocalStore (demo backend)', () => {
  it('signs in, creates a household and finds it by email', async () => {
    const store = new LocalStore('test-1');
    const users: unknown[] = [];
    store.onAuthChanged((u) => users.push(u));
    await flush();
    await store.signInWithGoogle();
    await flush();
    expect(users.at(-1)).toMatchObject({ uid: DEMO_USER.uid });

    const id = await store.createHousehold(DEMO_USER, {
      name: 'הבית',
      dueDate: '2027-01-01',
      inviteEmails: ['Partner@Gmail.com '],
      contentVersion: 1,
    });

    let found: Household[] = [];
    store.watchHouseholdsForEmail('partner@gmail.com', (l) => (found = l));
    await flush();
    expect(found.map((h) => h.id)).toEqual([id]);
    expect(found[0].memberEmails).toEqual(['demo@kinun.local', 'partner@gmail.com']);
  });

  it('adds, updates (tracking who/when) and deletes items with live updates', async () => {
    const store = new LocalStore('test-2', () => 1000);
    const id = await store.createHousehold(DEMO_USER, {
      name: 'h',
      dueDate: null,
      inviteEmails: [],
      contentVersion: 1,
    });
    const seen = vi.fn<(items: Item[]) => void>();
    store.watchItems(id, seen);
    const [itemId] = await store.addItems(
      id,
      [
        {
          kind: 'task',
          title: 'לארוז תיק',
          notes: '',
          category: 'hospital',
          phase: 'prebirth',
          done: false,
          order: 0,
          links: [],
        },
      ],
      DEMO_USER,
    );
    await store.updateItem(id, itemId, { done: true }, DEMO_USER);
    await flush();
    const latest = seen.mock.calls.at(-1)![0];
    expect(latest[0]).toMatchObject({ title: 'לארוז תיק', done: true, doneBy: DEMO_USER.uid, doneAt: 1000 });

    await store.deleteItem(id, itemId);
    await flush();
    expect(seen.mock.calls.at(-1)![0]).toEqual([]);
  });

  it('manages member emails and dismissed seeds', async () => {
    const store = new LocalStore('test-3');
    const id = await store.createHousehold(DEMO_USER, {
      name: 'h',
      dueDate: null,
      inviteEmails: [],
      contentVersion: 1,
    });
    await store.addMemberEmail(id, 'A@B.com');
    await store.addMemberEmail(id, 'a@b.com');
    await store.dismissSeed(id, 'task.x');
    await store.dismissSeed(id, 'task.x');
    let h: Household | null = null;
    store.watchHousehold(id, (x) => (h = x));
    await flush();
    expect(h!.memberEmails).toEqual(['demo@kinun.local', 'a@b.com']);
    expect(h!.dismissedSeedIds).toEqual(['task.x']);
    await store.removeMemberEmail(id, 'a@b.com');
    await flush();
    expect(h!.memberEmails).toEqual(['demo@kinun.local']);
  });

  it('records contractions', async () => {
    let t = 0;
    const store = new LocalStore('test-4', () => t);
    const id = await store.createHousehold(DEMO_USER, {
      name: 'h',
      dueDate: null,
      inviteEmails: [],
      contentVersion: 1,
    });
    t = 10_000;
    const cId = await store.startContraction(id, DEMO_USER);
    t = 70_000;
    await store.endContraction(id, cId);
    let list: { start: number; end: number | null }[] = [];
    store.watchContractions(id, (l) => (list = l));
    await flush();
    expect(list).toEqual([expect.objectContaining({ start: 10_000, end: 70_000 })]);
    await store.clearContractions(id);
    await flush();
    expect(list).toEqual([]);
  });

  it('persists to localStorage across instances', async () => {
    const a = new LocalStore('test-5');
    await a.signInWithGoogle();
    const id = await a.createHousehold(DEMO_USER, { name: 'נשמר', dueDate: null, inviteEmails: [], contentVersion: 1 });
    const b = new LocalStore('test-5');
    let h: Household | null = null;
    b.watchHousehold(id, (x) => (h = x));
    await flush();
    expect(h!.name).toBe('נשמר');
  });

  it('keeps records per kind, upserts by id and tracks each partner vote separately', async () => {
    const store = new LocalStore('test-records', () => 5000);
    const id = await store.createHousehold(DEMO_USER, {
      name: 'h',
      dueDate: null,
      inviteEmails: [],
      contentVersion: 1,
    });
    let names: HouseholdRecord[] = [];
    let questions: HouseholdRecord[] = [];
    store.watchRecords(id, 'name', (l) => (names = l));
    store.watchRecords(id, 'question', (l) => (questions = l));

    const n = await store.addRecord(id, { kind: 'name', text: 'נועם', tag: 'any' }, DEMO_USER);
    await store.addRecord(id, { kind: 'question', text: 'מתי מגיעים?' }, DEMO_USER);
    await flush();
    expect(names).toHaveLength(1);
    expect(names[0]).toMatchObject({
      text: 'נועם',
      note: '',
      done: false,
      votes: {},
      answers: {},
      createdBy: DEMO_USER.uid,
    });
    expect(questions.map((q) => q.text)).toEqual(['מתי מגיעים?']);

    await store.setVote(id, n, 'me', 'love');
    await store.setVote(id, n, 'partner', 'no');
    await store.setVote(id, n, 'partner', null);
    await flush();
    expect(names[0].votes).toEqual({ me: 'love' });

    await store.addRecord(id, { kind: 'birthPlan', answers: { music: 'כן' } }, DEMO_USER, 'birth-plan');
    await store.addRecord(id, { kind: 'birthPlan', answers: { music: 'לא' } }, DEMO_USER, 'birth-plan');
    let plans: HouseholdRecord[] = [];
    store.watchRecords(id, 'birthPlan', (l) => (plans = l));
    await flush();
    expect(plans).toHaveLength(1);
    expect(plans[0].answers).toEqual({ music: 'לא' });

    await store.deleteRecord(id, n);
    await flush();
    expect(names).toEqual([]);
  });

  it('loads a saved state from before records existed', async () => {
    localStorage.setItem(
      'test-old',
      JSON.stringify({ version: 1, user: null, households: {}, items: {}, contractions: {} }),
    );
    const store = new LocalStore('test-old');
    let list: HouseholdRecord[] | null = null;
    store.watchRecords('nope', 'kick', (l) => (list = l));
    await flush();
    expect(list).toEqual([]);
  });
});
