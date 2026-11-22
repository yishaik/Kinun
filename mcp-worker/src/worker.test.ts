// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { decodeFields, encodeFields, FirestoreClient, signJwt, type Plain } from './firestore';
import { handleRequest } from './index';
import { handleRpc } from './mcp';
import type { Repo, StoredItem } from './repo';
import { TOOLS, type ToolContext } from './tools';

const NOW = new Date('2026-11-22T08:00:00Z');

class MemoryRepo implements Repo {
  items = new Map<string, Plain>();
  private n = 0;
  constructor(seed: Plain[] = []) {
    seed.forEach((d) => this.items.set(`s${this.n++}`, d));
  }
  async getHousehold(): Promise<Plain> {
    return { id: 'h1', name: 'הבית שלנו', dueDate: '2026-12-20', birthDate: null, babyName: null, hospital: null };
  }
  async listItems(): Promise<StoredItem[]> {
    return [...this.items].map(([id, data]) => ({ id, data }));
  }
  async getItem(id: string) {
    const data = this.items.get(id);
    return data ? { id, data } : null;
  }
  async addItem(data: Plain) {
    const id = `n${this.n++}`;
    this.items.set(id, data);
    return id;
  }
  async patchItem(id: string, patch: Plain) {
    this.items.set(id, { ...this.items.get(id)!, ...patch });
  }
}

const gear = (over: Plain = {}): Plain => ({
  kind: 'gear',
  title: 'עריסה',
  notes: '',
  category: 'sleep',
  phase: 'prebirth',
  done: false,
  order: 3,
  gearStatus: 'need',
  priority: 'must',
  ...over,
});

const ctx = (repo: Repo): ToolContext => ({ repo, now: () => NOW });
const tool = (name: string) => TOOLS.find((t) => t.name === name)!;

describe('firestore codec', () => {
  it('round-trips plain data, ints, doubles, nulls, arrays, maps and timestamps', () => {
    const data = {
      a: 'x',
      b: 2,
      c: 2.5,
      d: true,
      e: null,
      f: [1, 'y'],
      g: { h: 'i' },
      t: new Date('2026-01-01T00:00:00Z'),
    };
    const decoded = decodeFields(encodeFields(data) as never);
    expect(decoded).toEqual({ ...data, t: Date.parse('2026-01-01T00:00:00Z') });
  });
  it('encodes integers as integerValue strings', () => {
    expect(encodeFields({ n: 7 })).toEqual({ n: { integerValue: '7' } });
  });
});

describe('service-account JWT', () => {
  it('signs a verifiable RS256 token with the right claims', async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify'],
    );
    const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    const pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...der))}\n-----END PRIVATE KEY-----\n`;
    const jwt = await signJwt({ client_email: 'sa@p.iam.gserviceaccount.com', private_key: pem }, 1000);
    const [h, c, s] = jwt.split('.');
    const dec = (x: string) => JSON.parse(atob(x.replace(/-/g, '+').replace(/_/g, '/')));
    expect(dec(h)).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(dec(c)).toMatchObject({
      iss: 'sa@p.iam.gserviceaccount.com',
      scope: 'https://www.googleapis.com/auth/datastore',
      iat: 1000,
      exp: 4600,
    });
    const sig = Uint8Array.from(
      atob(s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (s.length % 4)) % 4)),
      (ch) => ch.charCodeAt(0),
    );
    expect(
      await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pair.publicKey, sig, new TextEncoder().encode(`${h}.${c}`)),
    ).toBe(true);
  });

  it('patchDoc only touches the given fields and requires the doc to exist', async () => {
    const urls: string[] = [];
    const pair = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify'],
    );
    const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    const pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...der))}\n-----END PRIVATE KEY-----`;
    const fake = (async (url: string | URL | Request) => {
      urls.push(String(url));
      return new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }), { status: 200 });
    }) as typeof fetch;
    const fs = new FirestoreClient('p', { client_email: 'e', private_key: pem }, fake, () => 0);
    await fs.patchDoc('households/h/items/i', { done: true, doneAt: new Date(0) });
    const patchUrl = urls.find((u) => u.includes('/documents/'))!;
    expect(patchUrl).toContain('updateMask.fieldPaths=done');
    expect(patchUrl).toContain('updateMask.fieldPaths=doneAt');
    expect(patchUrl).toContain('currentDocument.exists=true');
  });
});

describe('tools', () => {
  it('has no delete tool and marks the rest non-destructive', () => {
    expect(TOOLS.map((t) => t.name).some((n) => /delete|remove/i.test(n))).toBe(false);
  });

  it('adds gear with the app defaults and the done invariant', async () => {
    const repo = new MemoryRepo([gear({ order: 3 })]);
    const res = (await tool('add_item').run({ kind: 'gear', title: 'פטמות לבקבוקים' }, ctx(repo))) as { id: string };
    const stored = repo.items.get(res.id)!;
    expect(stored).toMatchObject({
      kind: 'gear',
      title: 'פטמות לבקבוקים',
      category: 'sleep',
      phase: 'prebirth',
      gearStatus: 'need',
      done: false,
      order: 4,
      createdBy: 'agent',
      doneAt: null,
    });
    const have = (await tool('add_item').run({ kind: 'gear', title: 'מוצץ', gearStatus: 'have' }, ctx(repo))) as {
      id: string;
    };
    expect(repo.items.get(have.id)).toMatchObject({ done: true, doneBy: 'agent' });
  });

  it('adds a task with due week and ignores fields the kind does not use', async () => {
    const repo = new MemoryRepo();
    const { id } = (await tool('add_item').run(
      { kind: 'task', title: 'לקבוע סיור', dueWeek: 34, quantity: '3', gearStatus: 'have' },
      ctx(repo),
    )) as { id: string };
    expect(repo.items.get(id)).toMatchObject({
      dueWeek: 34,
      quantity: null,
      gearStatus: null,
      done: false,
      phase: 'pregnancy',
    });
  });

  it.each([
    [{ kind: 'nope', title: 'x' }, /kind/],
    [{ kind: 'task', title: '   ' }, /title/],
    [{ kind: 'task', title: 'x'.repeat(301) }, /too long/],
    [{ kind: 'task', title: 'x', notes: 'n'.repeat(5001) }, /too long/],
    [{ kind: 'task', title: 'x', phase: 'later' }, /phase/],
    [{ kind: 'task', title: 'x', dueWeek: 99 }, /dueWeek/],
    [{ kind: 'link', title: 'x', url: 'javascript:alert(1)' }, /http/],
    [{ kind: 'task', title: 'x', links: [{ label: 'a', url: 'ftp://x.y' }] }, /http/],
    [{ kind: 'link', title: 'x', phone: 'call me' }, /phone/],
  ])('rejects invalid input %j', async (args, msg) => {
    await expect(tool('add_item').run(args as Plain, ctx(new MemoryRepo()))).rejects.toThrow(msg);
  });

  it('update_item changes only the given fields and keeps gear done in sync', async () => {
    const repo = new MemoryRepo([gear()]);
    await tool('update_item').run({ id: 's0', gearStatus: 'ordered', price: 899 }, ctx(repo));
    expect(repo.items.get('s0')).toMatchObject({
      gearStatus: 'ordered',
      done: false,
      price: 899,
      title: 'עריסה',
      updatedBy: 'agent',
    });
    await tool('update_item').run({ id: 's0', gearStatus: 'have' }, ctx(repo));
    expect(repo.items.get('s0')).toMatchObject({ gearStatus: 'have', done: true, doneBy: 'agent' });
  });

  it('mark_done maps gear to have/need and ticks tasks', async () => {
    const repo = new MemoryRepo([
      gear(),
      { kind: 'task', title: 't', notes: '', category: 'home', phase: 'pregnancy', done: false, order: 1 },
    ]);
    await tool('mark_done').run({ id: 's0' }, ctx(repo));
    expect(repo.items.get('s0')).toMatchObject({ gearStatus: 'have', done: true });
    await tool('mark_done').run({ id: 's0', done: false }, ctx(repo));
    expect(repo.items.get('s0')).toMatchObject({ gearStatus: 'need', done: false, doneAt: null });
    await tool('mark_done').run({ id: 's1' }, ctx(repo));
    expect(repo.items.get('s1')).toMatchObject({ done: true });
  });

  it('update_item refuses unknown ids, empty patches and bad ids', async () => {
    const repo = new MemoryRepo([gear()]);
    await expect(tool('update_item').run({ id: 'zzz', title: 'x' }, ctx(repo))).rejects.toThrow(/No item/);
    await expect(tool('update_item').run({ id: 's0' }, ctx(repo))).rejects.toThrow(/Nothing to update/);
    await expect(tool('get_item').run({ id: '../x' }, ctx(repo))).rejects.toThrow(/No item/);
  });

  it('list_items filters and sorts; get_overview counts', async () => {
    const repo = new MemoryRepo([
      gear({ title: 'ב', order: 2 }),
      gear({ title: 'א', order: 1, done: true, gearStatus: 'have' }),
      {
        kind: 'task',
        title: 'משימה',
        notes: 'סיור בליס',
        category: 'hospital',
        phase: 'pregnancy',
        done: false,
        order: 1,
      },
    ]);
    const all = (await tool('list_items').run({}, ctx(repo))) as { items: { title: string }[] };
    expect(all.items.map((i) => i.title)).toEqual(['משימה', 'א', 'ב']);
    const open = (await tool('list_items').run({ kind: 'gear', done: false }, ctx(repo))) as { total: number };
    expect(open.total).toBe(1);
    const q = (await tool('list_items').run({ query: 'ליס' }, ctx(repo))) as { items: { title: string }[] };
    expect(q.items.map((i) => i.title)).toEqual(['משימה']);
    const ov = (await tool('get_overview').run({}, ctx(repo))) as {
      today: string;
      counts: Record<string, { total: number; done: number }>;
    };
    expect(ov.today).toBe('2026-11-22');
    expect(ov.counts.gear).toEqual({ total: 2, done: 1 });
  });
});

describe('mcp protocol', () => {
  const c = ctx(new MemoryRepo([gear()]));
  it('initialize negotiates the version and advertises tools', async () => {
    const r = (await handleRpc(
      { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } },
      c,
    )) as {
      result: { protocolVersion: string; capabilities: { tools: unknown } };
    };
    expect(r.result.protocolVersion).toBe('2025-03-26');
    expect(r.result.capabilities.tools).toBeDefined();
  });
  it('tools/list returns every tool with a schema', async () => {
    const r = (await handleRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, c)) as {
      result: { tools: { name: string }[] };
    };
    expect(r.result.tools.map((t) => t.name)).toEqual(TOOLS.map((t) => t.name));
  });
  it('tools/call returns text content, and validation errors as isError results', async () => {
    const good = (await handleRpc(
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_items', arguments: {} } },
      c,
    )) as {
      result: { content: { text: string }[] };
    };
    expect(JSON.parse(good.result.content[0].text).total).toBe(1);
    const bad = (await handleRpc(
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'add_item', arguments: { kind: 'x', title: 'y' } },
      },
      c,
    )) as { result: { isError: boolean } };
    expect(bad.result.isError).toBe(true);
  });
  it('notifications get no response; unknown methods and tools are errors', async () => {
    expect(await handleRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, c)).toBeNull();
    expect(await handleRpc({ jsonrpc: '2.0', id: 5, method: 'nope' }, c)).toMatchObject({ error: { code: -32601 } });
    expect(
      await handleRpc({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'delete_item' } }, c),
    ).toMatchObject({
      error: { code: -32602 },
    });
  });
});

describe('http auth', () => {
  const TOKEN = 'a'.repeat(32);
  const env = { MCP_TOKEN: TOKEN };
  const repo = new MemoryRepo([gear()]);
  const rpc = { jsonrpc: '2.0', id: 1, method: 'ping' };
  const post = (path: string, headers: Record<string, string> = {}) =>
    handleRequest(
      new Request(`https://x.dev${path}`, { method: 'POST', headers, body: JSON.stringify(rpc) }),
      env,
      repo,
    );

  it('refuses without a token, with a wrong token and in the wrong place', async () => {
    expect((await post('/mcp')).status).toBe(401);
    expect((await post('/mcp', { authorization: 'Bearer nope' })).status).toBe(401);
    expect((await post('/mcp/nope')).status).toBe(401);
    expect((await post('/other', { authorization: `Bearer ${TOKEN}` })).status).toBe(404);
  });
  it('accepts the bearer header or the path token', async () => {
    expect((await post('/mcp', { authorization: `Bearer ${TOKEN}` })).status).toBe(200);
    expect((await post(`/mcp/${TOKEN}`)).status).toBe(200);
  });
  it('fails closed when the token is missing or weak', async () => {
    for (const MCP_TOKEN of [undefined, '', 'short']) {
      const res = await handleRequest(
        new Request('https://x.dev/mcp/short', {
          method: 'POST',
          headers: { authorization: 'Bearer short' },
          body: '{}',
        }),
        { MCP_TOKEN },
        repo,
      );
      expect(res.status).toBe(503);
    }
  });
  it('rejects GET and bad JSON after auth', async () => {
    const h = { authorization: `Bearer ${TOKEN}` };
    expect((await handleRequest(new Request('https://x.dev/mcp', { headers: h }), env, repo)).status).toBe(405);
    expect(
      (await handleRequest(new Request('https://x.dev/mcp', { method: 'POST', headers: h, body: '{' }), env, repo))
        .status,
    ).toBe(400);
  });
});
