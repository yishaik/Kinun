/**
 * Detail + edit sheet for any item (task / gear / bag / link).
 * Existing items open in "view" mode (notes, links, source, quick actions);
 * new items open straight in "edit" mode.
 */
import { ExternalLink, Pencil, Phone, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useActions, useSession } from '../data/session';
import { useToast } from '../data/toast';
import { hostOf, telHref } from '../lib/format';
import { useMembers } from '../lib/hooks';
import {
  CATEGORY_LABELS,
  GEAR_STATUS_CYCLE,
  GEAR_STATUS_LABEL,
  KIND_LABEL,
  PHASE_LABEL,
  PHASES,
  PRIORITY_LABEL,
  categoryLabel,
  isGearDone,
} from '../lib/labels';
import { nextOrder } from '../lib/seed';
import type { GearStatus, Item, ItemKind, ItemLink, NewItem, PhaseKey, Priority } from '../lib/types';
import { AssigneeBadge, dueBadge } from './itemMeta';
import { Sheet } from './Sheet';
import { Chip, Segmented } from './ui';

const CUSTOM = '__custom__';
const POST_BIRTH: PhaseKey[] = ['hospital', 'firstWeeks', 'firstMonths'];

interface FormState {
  title: string;
  notes: string;
  category: string;
  customCategory: string;
  phase: PhaseKey;
  dueWeek: string;
  dueDaysAfterBirth: string;
  assignee: string;
  optional: boolean;
  priority: Priority | '';
  gearStatus: GearStatus;
  quantity: string;
  price: string;
  url: string;
  phone: string;
  links: ItemLink[];
}

function toForm(src: Partial<NewItem>, kind: ItemKind): FormState {
  const known = Object.keys(CATEGORY_LABELS[kind]);
  const category = src.category ?? known[0];
  const isKnown = known.includes(category);
  return {
    title: src.title ?? '',
    notes: src.notes ?? '',
    category: isKnown ? category : CUSTOM,
    customCategory: isKnown ? '' : category,
    phase: src.phase ?? (kind === 'bag' ? 'labor' : 'pregnancy'),
    dueWeek: src.dueWeek != null ? String(src.dueWeek) : '',
    dueDaysAfterBirth: src.dueDaysAfterBirth != null ? String(src.dueDaysAfterBirth) : '',
    assignee: src.assignee ?? '',
    optional: src.priority === 'optional',
    priority: (src.priority as Priority | null) ?? (kind === 'gear' ? 'nice' : ''),
    gearStatus: src.gearStatus ?? 'need',
    quantity: src.quantity ?? '',
    price: src.price != null ? String(src.price) : '',
    url: src.url ?? '',
    phone: src.phone ?? '',
    links: src.links ? src.links.map((l) => ({ ...l })) : [],
  };
}

function numOrNull(v: string): number | null {
  const n = Number(v.trim());
  return v.trim() === '' || Number.isNaN(n) ? null : n;
}

function fromForm(f: FormState, kind: ItemKind): Partial<NewItem> {
  const category = f.category === CUSTOM ? f.customCategory.trim() || 'אחר' : f.category;
  const base: Partial<NewItem> = {
    title: f.title.trim(),
    notes: f.notes.trim(),
    category,
    links: f.links.map((l) => ({ label: l.label.trim() || hostOf(l.url), url: l.url.trim() })).filter((l) => l.url),
    assignee: f.assignee || null,
  };
  if (kind === 'task') {
    const post = POST_BIRTH.includes(f.phase);
    return {
      ...base,
      phase: f.phase,
      dueWeek: post || f.phase === 'labor' ? null : numOrNull(f.dueWeek),
      dueDaysAfterBirth: post ? numOrNull(f.dueDaysAfterBirth) : null,
      priority: f.optional ? 'optional' : null,
    };
  }
  if (kind === 'gear') {
    return {
      ...base,
      gearStatus: f.gearStatus,
      done: isGearDone(f.gearStatus),
      priority: f.priority || null,
      quantity: f.quantity.trim() || null,
      price: numOrNull(f.price),
    };
  }
  if (kind === 'bag') {
    return { ...base, priority: f.priority || null, quantity: f.quantity.trim() || null };
  }
  return { ...base, url: f.url.trim() || null, phone: f.phone.trim() || null };
}

function defaultsFor(kind: ItemKind): NewItem {
  return {
    kind,
    title: '',
    notes: '',
    category: Object.keys(CATEGORY_LABELS[kind])[0],
    phase: kind === 'bag' ? 'labor' : kind === 'gear' ? 'prebirth' : 'pregnancy',
    done: false,
    order: 0,
    links: [],
    source: null,
    seedId: null,
    assignee: null,
    gearStatus: kind === 'gear' ? 'need' : null,
  };
}

export function ItemSheet({
  item,
  draft,
  onClose,
}: {
  /** Existing item to show/edit. */
  item: Item | null;
  /** Defaults for a new item (kind required). Ignored when `item` is set. */
  draft: (Partial<NewItem> & { kind: ItemKind }) | null;
  onClose: () => void;
}) {
  const open = Boolean(item || draft);
  const kind: ItemKind = item?.kind ?? draft?.kind ?? 'task';
  const isNew = !item;
  const [mode, setMode] = useState<'view' | 'edit'>(isNew ? 'edit' : 'view');
  const [form, setForm] = useState<FormState>(() => toForm(item ?? draft ?? {}, kind));
  const { household, items } = useSession();
  const actions = useActions();
  const { toast } = useToast();
  const members = useMembers(household);

  // Note: the parent remounts this component (via `key`) for each opened item, so
  // initial state above is always fresh — see useItemSheet() below.

  const customCategories = useMemo(() => {
    const known = Object.keys(CATEGORY_LABELS[kind]);
    return [...new Set(items.filter((i) => i.kind === kind && !known.includes(i.category)).map((i) => i.category))];
  }, [items, kind]);

  if (!open || !household) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) {
      toast('צריך כותרת', 'error');
      return;
    }
    const patch = fromForm(form, kind);
    if (item) {
      void actions.updateItem(item.id, patch);
      toast('נשמר', 'success');
    } else {
      const sameKind = items.filter((i) => i.kind === kind);
      void actions.addItem({ ...defaultsFor(kind), ...draft, ...patch, order: nextOrder(sameKind) } as NewItem);
      toast('נוסף', 'success');
    }
    onClose();
  };

  const remove = () => {
    if (!item) return;
    void actions.deleteItem(item);
    toast('נמחק', 'info', { label: 'ביטול', onClick: () => void actions.restoreItem(item) });
    onClose();
  };

  const title = isNew
    ? `${KIND_LABEL[kind]} חדש${kind === 'task' ? 'ה' : ''}`
    : mode === 'edit'
      ? 'עריכה'
      : item!.title;

  // ───────── view mode ─────────
  if (item && mode === 'view') {
    const due = item.kind === 'task' ? dueBadge(item, household) : null;
    return (
      <Sheet
        open={open}
        title={title}
        onClose={onClose}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setMode('edit')}>
              <Pencil className="size-4" aria-hidden /> עריכה
            </button>
            <button type="button" className="btn-quiet text-brick hover:bg-brick-soft" onClick={remove}>
              <Trash2 className="size-4" aria-hidden /> מחיקה
            </button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Chip>{categoryLabel(item.kind, item.category)}</Chip>
          {item.kind === 'task' && <Chip tone="muted">{PHASE_LABEL[item.phase]}</Chip>}
          {due && <Chip tone={due.tone}>{due.text}</Chip>}
          {item.priority && item.kind !== 'link' && <Chip tone="muted">{PRIORITY_LABEL[item.priority]}</Chip>}
          {item.quantity && <Chip tone="muted">כמות: {item.quantity}</Chip>}
          {item.price != null && <Chip tone="muted">₪{item.price}</Chip>}
          <AssigneeBadge assignee={item.assignee} members={members} />
        </div>

        {item.notes && <p className="mb-5 whitespace-pre-line text-[17px] leading-relaxed">{item.notes}</p>}

        {item.kind === 'gear' && (
          <div className="mb-5">
            <Segmented
              label="סטטוס"
              value={item.gearStatus ?? 'need'}
              options={GEAR_STATUS_CYCLE.map((s) => ({ value: s, label: GEAR_STATUS_LABEL[s] }))}
              onChange={(s) => void actions.setGearStatus(item, s)}
            />
          </div>
        )}
        {(item.kind === 'task' || item.kind === 'bag') && (
          <button
            type="button"
            className={`${item.done ? 'btn-outline' : 'btn-primary'} mb-5 w-full`}
            onClick={() => {
              void actions.toggleDone(item);
              onClose();
            }}
          >
            {item.done ? 'החזרה לרשימה' : item.kind === 'bag' ? 'סימון כארוז' : 'סימון כבוצע'}
          </button>
        )}

        {(item.phone || item.url || item.links.length > 0) && (
          <div className="mb-5 flex flex-col gap-2">
            {item.phone && (
              <a href={telHref(item.phone)} className="btn-primary w-full">
                <Phone className="size-4" aria-hidden /> חיוג {item.phone}
              </a>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className="btn-outline w-full">
                <ExternalLink className="size-4" aria-hidden /> פתיחה ב-{hostOf(item.url)}
              </a>
            )}
            {item.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="shelf flex items-center gap-3 px-4 py-3"
              >
                <ExternalLink className="size-4 shrink-0 text-robin" aria-hidden />
                <span className="flex-1">
                  <span className="block font-semibold">{l.label}</span>
                  <span className="block text-sm text-twig-soft">{hostOf(l.url)}</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {item.source && (
          <p className="text-sm text-twig-soft">
            מקור:{' '}
            <a href={item.source} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {hostOf(item.source)}
            </a>
            . המידע נבדק ב-2026 — כדאי לוודא מול המקור.
          </p>
        )}
      </Sheet>
    );
  }

  // ───────── edit mode ─────────
  const knownCats = Object.entries(CATEGORY_LABELS[kind]);
  const postBirth = POST_BIRTH.includes(form.phase);

  return (
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" className="btn-primary flex-1" onClick={save}>
            {isNew ? 'הוספה' : 'שמירה'}
          </button>
          <button type="button" className="btn-outline" onClick={() => (isNew ? onClose() : setMode('view'))}>
            ביטול
          </button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div>
          <label className="label" htmlFor="f-title">
            כותרת
          </label>
          <input
            id="f-title"
            data-autofocus
            className="field"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder={kind === 'link' ? 'למשל: רופאת הילדים' : 'מה צריך?'}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="f-notes">
            הערות
          </label>
          <textarea
            id="f-notes"
            className="field min-h-24"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={form.category === CUSTOM ? 'col-span-2' : ''}>
            <label className="label" htmlFor="f-cat">
              קטגוריה
            </label>
            <select
              id="f-cat"
              className="field"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {knownCats.map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
              {customCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={CUSTOM}>קטגוריה חדשה…</option>
            </select>
            {form.category === CUSTOM && (
              <input
                className="field mt-2"
                aria-label="שם הקטגוריה"
                placeholder="שם הקטגוריה"
                value={form.customCategory}
                onChange={(e) => set('customCategory', e.target.value)}
              />
            )}
          </div>

          {kind === 'task' && (
            <div>
              <label className="label" htmlFor="f-phase">
                שלב
              </label>
              <select
                id="f-phase"
                className="field"
                value={form.phase}
                onChange={(e) => set('phase', e.target.value as PhaseKey)}
              >
                {PHASES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {kind === 'task' && form.phase !== 'labor' && (
            <div>
              <label className="label" htmlFor="f-due">
                {postBirth ? 'ימים אחרי הלידה' : 'עד שבוע הריון'}
              </label>
              <input
                id="f-due"
                className="field"
                inputMode="numeric"
                value={postBirth ? form.dueDaysAfterBirth : form.dueWeek}
                onChange={(e) => set(postBirth ? 'dueDaysAfterBirth' : 'dueWeek', e.target.value.replace(/[^\d]/g, ''))}
                placeholder="ללא"
              />
            </div>
          )}

          {kind !== 'link' && (
            <div>
              <label className="label" htmlFor="f-assignee">
                באחריות
              </label>
              <select
                id="f-assignee"
                className="field"
                value={form.assignee}
                onChange={(e) => set('assignee', e.target.value)}
              >
                <option value="">לא משויך</option>
                <option value="both">שנינו</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {kind === 'gear' && (
            <div>
              <label className="label" htmlFor="f-status">
                סטטוס
              </label>
              <select
                id="f-status"
                className="field"
                value={form.gearStatus}
                onChange={(e) => set('gearStatus', e.target.value as GearStatus)}
              >
                {GEAR_STATUS_CYCLE.map((s) => (
                  <option key={s} value={s}>
                    {GEAR_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(kind === 'gear' || kind === 'bag') && (
            <>
              <div>
                <label className="label" htmlFor="f-priority">
                  עדיפות
                </label>
                <select
                  id="f-priority"
                  className="field"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as Priority | '')}
                >
                  <option value="">—</option>
                  {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="f-qty">
                  כמות
                </label>
                <input
                  id="f-qty"
                  className="field"
                  value={form.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  placeholder="למשל 2–3"
                />
              </div>
            </>
          )}

          {kind === 'gear' && (
            <div>
              <label className="label" htmlFor="f-price">
                מחיר (₪)
              </label>
              <input
                id="f-price"
                className="field"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))}
              />
            </div>
          )}
        </div>

        {kind === 'task' && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="size-5 accent-[var(--color-robin)]"
              checked={form.optional}
              onChange={(e) => set('optional', e.target.checked)}
            />
            <span>אופציונלי (לא לכולם)</span>
          </label>
        )}

        {kind === 'link' && (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="label" htmlFor="f-url">
                כתובת אתר
              </label>
              <input
                id="f-url"
                className="field"
                type="url"
                dir="ltr"
                value={form.url}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="label" htmlFor="f-phone">
                טלפון
              </label>
              <input
                id="f-phone"
                className="field"
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
          </div>
        )}

        <fieldset>
          <legend className="label">קישורים</legend>
          <div className="flex flex-col gap-2">
            {form.links.map((l, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="grid flex-1 grid-cols-1 gap-1">
                  <input
                    className="field"
                    aria-label="שם הקישור"
                    placeholder="שם"
                    value={l.label}
                    onChange={(e) =>
                      set(
                        'links',
                        form.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    className="field"
                    aria-label="כתובת הקישור"
                    dir="ltr"
                    type="url"
                    placeholder="https://"
                    value={l.url}
                    onChange={(e) =>
                      set(
                        'links',
                        form.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  aria-label="הסרת קישור"
                  className="mt-2 rounded-full p-2 text-twig-soft hover:bg-line"
                  onClick={() =>
                    set(
                      'links',
                      form.links.filter((_, j) => j !== i),
                    )
                  }
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-quiet self-start px-2"
              onClick={() => set('links', [...form.links, { label: '', url: '' }])}
            >
              <Plus className="size-4" aria-hidden /> הוספת קישור
            </button>
          </div>
        </fieldset>
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

/**
 * Convenience hook for pages: `const { openItem, openNew, sheet } = useItemSheet();`
 * then render `{sheet}` once. Each open remounts the sheet so its form state is fresh.
 */
export function useItemSheet(): {
  openItem: (item: Item) => void;
  openNew: (draft: Partial<NewItem> & { kind: ItemKind }) => void;
  sheet: ReactNode;
} {
  const [state, setState] = useState<{
    itemId: string | null;
    draft: (Partial<NewItem> & { kind: ItemKind }) | null;
    n: number;
  }>({
    itemId: null,
    draft: null,
    n: 0,
  });
  const { items } = useSession();
  const openItem = useCallback((item: Item) => setState((s) => ({ itemId: item.id, draft: null, n: s.n + 1 })), []);
  const openNew = useCallback(
    (draft: Partial<NewItem> & { kind: ItemKind }) => setState((s) => ({ itemId: null, draft, n: s.n + 1 })),
    [],
  );
  const close = useCallback(() => setState((s) => ({ itemId: null, draft: null, n: s.n })), []);
  // Always show the live version of the item (partner edits appear instantly).
  const item = state.itemId ? (items.find((i) => i.id === state.itemId) ?? null) : null;
  const sheet =
    item || state.draft ? (
      <ItemSheet key={state.n} item={item} draft={item ? null : state.draft} onClose={close} />
    ) : null;
  return { openItem, openNew, sheet };
}
