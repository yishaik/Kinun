/**
 * The MCP tools. They mirror what the app lets a person do with the lists — read, add, edit,
 * tick off — and deliberately NOT delete anything or touch labor mode / household settings.
 *
 * The service account bypasses Firestore security rules, so all validation lives here and must
 * stay in line with `itemIsValid` in firestore.rules and the types in src/lib/types.ts.
 */
import { CATEGORY_LABELS, PHASES, PHASE_ORDER } from '../../src/lib/labels';
import type { GearStatus, ItemKind, PhaseKey, Priority } from '../../src/lib/types';
import type { Plain } from './firestore';
import type { Repo, StoredItem } from './repo';

export const AGENT_UID = 'agent';

const KINDS: ItemKind[] = ['task', 'gear', 'bag', 'link'];
const PHASE_KEYS = PHASES.map((p) => p.key) as PhaseKey[];
const PRIORITIES: Priority[] = ['must', 'nice', 'optional'];
const GEAR_STATUSES: GearStatus[] = ['need', 'ordered', 'have', 'skip'];

export class ToolError extends Error {}

export interface ToolContext {
  repo: Repo;
  now: () => Date;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** Returns data that is JSON-serialised into the tool result. */
  run(args: Plain, ctx: ToolContext): Promise<unknown>;
}

// ───────── argument helpers ─────────

function str(args: Plain, key: string, opts: { required?: boolean; max: number }): string | undefined {
  const v = args[key];
  if (v === undefined || v === null) {
    if (opts.required) throw new ToolError(`"${key}" is required`);
    return undefined;
  }
  if (typeof v !== 'string') throw new ToolError(`"${key}" must be a string`);
  const t = v.trim();
  if (opts.required && !t) throw new ToolError(`"${key}" must not be empty`);
  if (v.length > opts.max) throw new ToolError(`"${key}" is too long (max ${opts.max})`);
  return opts.required ? t : v;
}

function oneOf<T extends string>(args: Plain, key: string, allowed: readonly T[], required = false): T | undefined {
  const v = args[key];
  if (v === undefined || v === null) {
    if (required) throw new ToolError(`"${key}" is required (one of: ${allowed.join(', ')})`);
    return undefined;
  }
  if (typeof v !== 'string' || !allowed.includes(v as T)) {
    throw new ToolError(`"${key}" must be one of: ${allowed.join(', ')}`);
  }
  return v as T;
}

function num(args: Plain, key: string, min: number, max: number): number | null | undefined {
  const v = args[key];
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    throw new ToolError(`"${key}" must be a number between ${min} and ${max}`);
  }
  return v;
}

function bool(args: Plain, key: string): boolean | undefined {
  const v = args[key];
  if (v === undefined) return undefined;
  if (typeof v !== 'boolean') throw new ToolError(`"${key}" must be true or false`);
  return v;
}

function httpUrl(raw: unknown, key: string): string {
  if (typeof raw !== 'string' || raw.length > 2000) throw new ToolError(`"${key}" must be a URL string`);
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new ToolError(`"${key}" is not a valid URL`);
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new ToolError(`"${key}" must be http(s)`);
  return raw;
}

function links(args: Plain): { label: string; url: string }[] | undefined {
  const v = args.links;
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || v.length > 20) throw new ToolError('"links" must be an array of up to 20 {label, url}');
  return v.map((l, i) => {
    const o = (l ?? {}) as Plain;
    const label = str(o, 'label', { required: true, max: 200 });
    if (!label) throw new ToolError(`links[${i}].label is required`);
    return { label, url: httpUrl(o.url, `links[${i}].url`) };
  });
}

function phone(args: Plain): string | null | undefined {
  const v = args.phone;
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  if (typeof v !== 'string' || !/^[\d*+\-() ]{2,30}$/.test(v)) throw new ToolError('"phone" must be a dialable number');
  return v;
}

function optUrl(args: Plain): string | null | undefined {
  const v = args.url;
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return httpUrl(v, 'url');
}

// ───────── shaping ─────────

function view(it: StoredItem) {
  const d = it.data;
  const kind = d.kind as ItemKind;
  return {
    id: it.id,
    kind,
    title: d.title,
    notes: d.notes ?? '',
    category: d.category,
    categoryLabel: CATEGORY_LABELS[kind]?.[String(d.category)] ?? d.category,
    phase: d.phase,
    done: d.done === true,
    gearStatus: d.gearStatus ?? null,
    priority: d.priority ?? null,
    quantity: d.quantity ?? null,
    price: d.price ?? null,
    dueWeek: d.dueWeek ?? null,
    dueDaysAfterBirth: d.dueDaysAfterBirth ?? null,
    url: d.url ?? null,
    phone: d.phone ?? null,
    links: Array.isArray(d.links) ? d.links : [],
    source: d.source ?? null,
  };
}

function sortKey(it: StoredItem): [number, number, number] {
  const d = it.data;
  return [
    KINDS.indexOf(d.kind as ItemKind),
    PHASE_ORDER[d.phase as PhaseKey] ?? 99,
    typeof d.order === 'number' ? d.order : 0,
  ];
}

function bySortKey(a: StoredItem, b: StoredItem) {
  const [a1, a2, a3] = sortKey(a);
  const [b1, b2, b3] = sortKey(b);
  return a1 - b1 || a2 - b2 || a3 - b3;
}

// ───────── tools ─────────

const kindProp = {
  type: 'string',
  enum: KINDS,
  description: 'task = משימה, gear = ציוד, bag = תיק לידה, link = קישור',
};
const idProp = { type: 'string', description: 'Item id from list_items' };

const itemFieldProps = {
  title: { type: 'string', description: 'Hebrew, short, sentence case (max 300 chars)' },
  notes: { type: 'string', description: 'Free text (max 5000 chars)' },
  category: { type: 'string', description: 'Category key from list_categories, or free text for a custom category' },
  phase: { type: 'string', enum: PHASE_KEYS },
  priority: { type: 'string', enum: PRIORITIES, description: 'gear and bag items' },
  quantity: { type: 'string', description: 'Free text such as "2" or "6–8"' },
  price: { type: ['number', 'null'], description: 'Price in ₪ (gear)' },
  gearStatus: {
    type: 'string',
    enum: GEAR_STATUSES,
    description: 'need = צריך, ordered = בדרך, have = יש, skip = לא צריך',
  },
  dueWeek: { type: ['number', 'null'], description: 'Task: finish by this pregnancy week (0–42)' },
  dueDaysAfterBirth: { type: ['number', 'null'], description: 'Task: finish within N days after the birth' },
  url: { type: ['string', 'null'], description: 'Link items: http(s) address' },
  phone: { type: ['string', 'null'], description: 'Link items: dialable number such as *5400' },
  links: {
    type: 'array',
    description: 'Helpful links shown on the item',
    items: {
      type: 'object',
      properties: { label: { type: 'string' }, url: { type: 'string' } },
      required: ['label', 'url'],
    },
  },
};

export const TOOLS: ToolDef[] = [
  {
    name: 'get_overview',
    description:
      "Start here. Today's date, the couple's household details (due date, birth date, baby name, hospital) and how many items of each kind are done.",
    inputSchema: { type: 'object', properties: {} },
    async run(_args, { repo, now }) {
      const [h, items] = await Promise.all([repo.getHousehold(), repo.listItems()]);
      const counts = Object.fromEntries(
        KINDS.map((k) => {
          const of = items.filter((i) => i.data.kind === k);
          return [k, { total: of.length, done: of.filter((i) => i.data.done === true).length }];
        }),
      );
      const hospital = h.hospital as Plain | null;
      return {
        today: now().toISOString().slice(0, 10),
        household: h.name,
        dueDate: h.dueDate ?? null,
        birthDate: h.birthDate ?? null,
        babyName: h.babyName ?? null,
        hospital: hospital ? { name: hospital.name, phone: hospital.phone, address: hospital.address } : null,
        counts,
      };
    },
  },
  {
    name: 'list_categories',
    description:
      'The category keys (with Hebrew names) for each kind of item, and the phases. Use these keys when adding items.',
    inputSchema: { type: 'object', properties: {} },
    async run() {
      return {
        categories: Object.fromEntries(KINDS.map((k) => [k, CATEGORY_LABELS[k]])),
        phases: PHASES.map((p) => ({ key: p.key, label: p.label, hint: p.hint })),
        gearStatuses: { need: 'צריך', ordered: 'בדרך', have: 'יש', skip: 'לא צריך' },
      };
    },
  },
  {
    name: 'list_items',
    description:
      'List items (tasks, gear, hospital-bag items, links) in the order the app shows them. All filters are optional and combine with AND.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: kindProp,
        category: { type: 'string' },
        phase: { type: 'string', enum: PHASE_KEYS },
        done: { type: 'boolean' },
        gearStatus: { type: 'string', enum: GEAR_STATUSES },
        query: { type: 'string', description: 'Case-insensitive text to find in the title or notes' },
        limit: { type: 'number', description: 'Default 100, max 300' },
      },
    },
    async run(args, { repo }) {
      const kind = oneOf(args, 'kind', KINDS);
      const phase = oneOf(args, 'phase', PHASE_KEYS);
      const status = oneOf(args, 'gearStatus', GEAR_STATUSES);
      const category = str(args, 'category', { max: 100 });
      const query = str(args, 'query', { max: 200 })?.trim().toLowerCase();
      const done = bool(args, 'done');
      const limit = Math.min(300, Math.max(1, num(args, 'limit', 1, 300) ?? 100));
      const all = await repo.listItems();
      const hits = all
        .filter((i) => (kind ? i.data.kind === kind : true))
        .filter((i) => (category ? i.data.category === category : true))
        .filter((i) => (phase ? i.data.phase === phase : true))
        .filter((i) => (status ? i.data.gearStatus === status : true))
        .filter((i) => (done === undefined ? true : (i.data.done === true) === done))
        .filter((i) => (query ? `${i.data.title ?? ''}\n${i.data.notes ?? ''}`.toLowerCase().includes(query) : true))
        .sort(bySortKey);
      return { total: hits.length, returned: Math.min(limit, hits.length), items: hits.slice(0, limit).map(view) };
    },
  },
  {
    name: 'get_item',
    description: 'One item with all its fields.',
    inputSchema: { type: 'object', properties: { id: idProp }, required: ['id'] },
    async run(args, { repo }) {
      const id = str(args, 'id', { required: true, max: 64 })!;
      const it = await repo.getItem(id);
      if (!it) throw new ToolError(`No item with id ${id}`);
      return view(it);
    },
  },
  {
    name: 'add_item',
    description:
      "Add an item to one of the lists. Check list_items first so you don't add a duplicate. Write titles in Hebrew. Fields the kind doesn't use are ignored.",
    inputSchema: {
      type: 'object',
      properties: { kind: kindProp, ...itemFieldProps },
      required: ['kind', 'title'],
    },
    async run(args, { repo, now }) {
      const kind = oneOf(args, 'kind', KINDS, true)!;
      const title = str(args, 'title', { required: true, max: 300 })!;
      const stamp = now();
      const gear = kind === 'gear';
      const status = gear ? (oneOf(args, 'gearStatus', GEAR_STATUSES) ?? 'need') : null;
      const done = gear ? status === 'have' || status === 'skip' : false;
      const siblings = (await repo.listItems()).filter((i) => i.data.kind === kind);
      const order = siblings.reduce((m, i) => Math.max(m, typeof i.data.order === 'number' ? i.data.order : 0), 0) + 1;
      const doc: Plain = {
        kind,
        title,
        notes: str(args, 'notes', { max: 5000 }) ?? '',
        category: str(args, 'category', { max: 100 })?.trim() || Object.keys(CATEGORY_LABELS[kind])[0],
        phase: oneOf(args, 'phase', PHASE_KEYS) ?? (kind === 'bag' ? 'labor' : gear ? 'prebirth' : 'pregnancy'),
        done,
        order,
        links: links(args) ?? [],
        source: null,
        seedId: null,
        assignee: null,
        gearStatus: status,
        priority: kind === 'task' || kind === 'link' ? null : (oneOf(args, 'priority', PRIORITIES) ?? null),
        quantity: kind === 'gear' || kind === 'bag' ? (str(args, 'quantity', { max: 100 }) ?? null) : null,
        price: gear ? (num(args, 'price', 0, 1_000_000) ?? null) : null,
        dueWeek: kind === 'task' ? (num(args, 'dueWeek', 0, 42) ?? null) : null,
        dueDaysAfterBirth: kind === 'task' ? (num(args, 'dueDaysAfterBirth', 0, 3650) ?? null) : null,
        url: kind === 'link' ? (optUrl(args) ?? null) : null,
        phone: kind === 'link' ? (phone(args) ?? null) : null,
        createdAt: stamp,
        createdBy: AGENT_UID,
        updatedAt: stamp,
        updatedBy: AGENT_UID,
        doneAt: done ? stamp : null,
        doneBy: done ? AGENT_UID : null,
      };
      const id = await repo.addItem(doc);
      return { id, added: view({ id, data: doc }) };
    },
  },
  {
    name: 'update_item',
    description:
      'Change fields of an existing item (only the fields you pass). The kind cannot change. For gear, gearStatus also sets the done state.',
    inputSchema: {
      type: 'object',
      properties: { id: idProp, ...itemFieldProps, done: { type: 'boolean' } },
      required: ['id'],
    },
    async run(args, { repo, now }) {
      const id = str(args, 'id', { required: true, max: 64 })!;
      const existing = await repo.getItem(id);
      if (!existing) throw new ToolError(`No item with id ${id}`);
      const kind = existing.data.kind as ItemKind;
      const patch: Plain = {};
      const set = (k: string, v: unknown) => {
        if (v !== undefined) patch[k] = v;
      };
      set('title', str(args, 'title', { max: 300 })?.trim() || undefined);
      set('notes', str(args, 'notes', { max: 5000 }));
      set('category', str(args, 'category', { max: 100 })?.trim() || undefined);
      set('phase', oneOf(args, 'phase', PHASE_KEYS));
      set('links', links(args));
      if (kind === 'gear' || kind === 'bag') {
        set('priority', oneOf(args, 'priority', PRIORITIES));
        set('quantity', str(args, 'quantity', { max: 100 }));
      }
      if (kind === 'gear') set('price', num(args, 'price', 0, 1_000_000));
      if (kind === 'task') {
        set('dueWeek', num(args, 'dueWeek', 0, 42));
        set('dueDaysAfterBirth', num(args, 'dueDaysAfterBirth', 0, 3650));
      }
      if (kind === 'link') {
        set('url', optUrl(args));
        set('phone', phone(args));
      }

      let done = bool(args, 'done');
      if (kind === 'gear') {
        const status = oneOf(args, 'gearStatus', GEAR_STATUSES);
        if (status) {
          patch.gearStatus = status;
          done = status === 'have' || status === 'skip';
        } else if (done !== undefined) {
          patch.gearStatus = done ? 'have' : 'need';
        }
      }
      const stamp = now();
      if (done !== undefined) {
        patch.done = done;
        patch.doneAt = done ? stamp : null;
        patch.doneBy = done ? AGENT_UID : null;
      }
      if (Object.keys(patch).length === 0) throw new ToolError('Nothing to update: pass at least one field');
      patch.updatedAt = stamp;
      patch.updatedBy = AGENT_UID;
      await repo.patchItem(id, patch);
      return { id, updated: view({ id, data: { ...existing.data, ...patch } }) };
    },
  },
  {
    name: 'mark_done',
    description:
      'Tick an item off or undo it. For tasks and bag items: done / not done. For gear: done = "have" (יש), not done = "need" (צריך). Use update_item with gearStatus for "ordered" or "skip".',
    inputSchema: {
      type: 'object',
      properties: { id: idProp, done: { type: 'boolean', description: 'Default true' } },
      required: ['id'],
    },
    async run(args, ctx) {
      const done = bool(args, 'done') ?? true;
      const tool = TOOLS.find((t) => t.name === 'update_item')!;
      return tool.run({ id: args.id, done }, ctx);
    },
  },
];

export const READ_ONLY_TOOLS = new Set(['get_overview', 'list_categories', 'list_items', 'get_item']);
