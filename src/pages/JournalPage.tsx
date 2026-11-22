/** "יומן רגעים לפני" — dated moments, a letter to the baby from each of you, and babymoon ideas. Text only. */
import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CheckCircle, EmptyState, PageTitle, Section, Segmented } from '../components/ui';
import { useActions, useHousehold, useRecords, useSession } from '../data/session';
import { firstName, formatIsoDate } from '../lib/format';
import { useMembers } from '../lib/hooks';
import { byTag, letterOf, sortedMoments, todayIso, type JournalTag } from '../lib/journal';
import type { HouseholdRecord } from '../lib/types';

const BABYMOON_IDEAS = [
  'סופ״ש רגוע בצימר',
  'צילומי הריון',
  'ארוחה במסעדה שאתם אוהבים',
  'יום ספא או עיסוי',
  'פיקניק בשקיעה',
  'ערב סרטים בבית',
  'טיול קצר בטבע',
  'לכתוב יחד רשימת חלומות למשפחה',
];

export function JournalPage() {
  const [tab, setTab] = useState<JournalTag>('moment');
  const { records, loaded } = useRecords('journal');
  return (
    <>
      <PageTitle>יומן רגעים</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        מה שתרצו לזכור מהתקופה הזו. נשמר ומשותף לשניכם. (תמונות לא נשמרות כאן — רק טקסט.)
      </p>
      <div className="mb-6">
        <Segmented
          label="יומן"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'moment', label: 'רגעים' },
            { value: 'letter', label: 'מכתב לתינוק' },
            { value: 'babymoon', label: 'בייבימון' },
          ]}
        />
      </div>
      {loaded && tab === 'moment' && <Moments records={records} />}
      {loaded && tab === 'letter' && <Letters records={records} />}
      {loaded && tab === 'babymoon' && <Babymoon records={records} />}
    </>
  );
}

function Moments({ records }: { records: HouseholdRecord[] }) {
  const actions = useActions();
  const household = useHousehold();
  const members = useMembers(household);
  const [date, setDate] = useState(todayIso());
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const list = sortedMoments(records);

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !title.trim()) return;
    actions.addRecord({
      kind: 'journal',
      tag: 'moment',
      date: date || todayIso(),
      note: title.trim(),
      text: text.trim(),
    });
    setTitle('');
    setText('');
  };

  return (
    <>
      <form onSubmit={add} className="widget mb-7 space-y-3 p-4" aria-label="רגע חדש">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <label htmlFor="moment-date" className="text-subhead font-semibold">
            תאריך
          </label>
          <input
            id="moment-date"
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label htmlFor="moment-title" className="text-subhead font-semibold">
            כותרת
          </label>
          <input
            id="moment-title"
            className="field"
            placeholder="הבעיטה הראשונה"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <label htmlFor="moment-text" className="sr-only">
          מה קרה
        </label>
        <textarea
          id="moment-text"
          rows={3}
          className="field w-full"
          placeholder="מה קרה, מה הרגשנו…"
          maxLength={10000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary w-full" disabled={!text.trim() && !title.trim()}>
          <Plus className="size-5" aria-hidden /> שמירת הרגע
        </button>
      </form>

      {list.length === 0 ? (
        <EmptyState title="עוד אין רגעים" body="הרגע הראשון מחכה לכם." />
      ) : (
        <ol className="space-y-3" aria-label="רגעים">
          {list.map((r) => {
            const by = members.find((m) => m.uid === r.createdBy);
            return (
              <li key={r.id} className="widget p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-footnote font-semibold text-leaf-ink">
                      {r.date ? formatIsoDate(r.date) : ''}
                      {by ? ` · ${firstName(by.name)}` : ''}
                    </p>
                    {r.note && <h3 className="mt-0.5 text-headline">{r.note}</h3>}
                    {r.text && <p className="mt-1 text-body whitespace-pre-line">{r.text}</p>}
                  </div>
                  <DeleteButton
                    label={`מחיקת הרגע ${r.note || ''}`.trim()}
                    onDelete={() => actions.deleteRecord(r.id)}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

function Letters({ records }: { records: HouseholdRecord[] }) {
  const actions = useActions();
  const { user } = useSession();
  const household = useHousehold();
  const members = useMembers(household);
  const mine = user ? letterOf(records, user.uid) : null;
  const [draft, setDraft] = useState<string | null>(null);
  const others = byTag(records, 'letter').filter((r) => r.createdBy !== user?.uid && r.text.trim());

  const save = () => {
    if (draft == null) return;
    const t = draft.trim();
    if (mine) {
      if (t !== mine.text) actions.updateRecord(mine.id, { text: t });
    } else if (t) actions.addRecord({ kind: 'journal', tag: 'letter', text: t, date: todayIso() });
    setDraft(null);
  };

  return (
    <>
      <section className="widget mb-7 p-4">
        <label htmlFor="my-letter" className="text-headline">
          המכתב שלי לתינוק
        </label>
        <p className="mt-0.5 text-footnote text-twig-soft">
          מה הייתם רוצים שהוא או היא יקראו יום אחד? נשמר כשיוצאים מהשדה.
        </p>
        <textarea
          id="my-letter"
          rows={10}
          className="field mt-3 w-full leading-relaxed"
          placeholder="תינוק/ת יקר/ה,"
          maxLength={10000}
          value={draft ?? mine?.text ?? ''}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
        />
      </section>
      {others.map((r) => {
        const by = members.find((m) => m.uid === r.createdBy);
        return (
          <section key={r.id} className="widget mb-5 p-4">
            <h2 className="text-headline">המכתב של {by ? firstName(by.name) : 'בן/בת הזוג'}</h2>
            <p className="mt-2 text-body leading-relaxed whitespace-pre-line">{r.text}</p>
          </section>
        );
      })}
    </>
  );
}

function Babymoon({ records }: { records: HouseholdRecord[] }) {
  const actions = useActions();
  const [text, setText] = useState('');
  const list = byTag(records, 'babymoon').sort(
    (a, b) => Number(a.done) - Number(b.done) || (a.createdAt ?? 0) - (b.createdAt ?? 0),
  );
  const have = new Set(list.map((r) => r.text));
  const add = (t: string) => actions.addRecord({ kind: 'journal', tag: 'babymoon', text: t.trim() });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          add(text);
          setText('');
        }}
        className="mb-6 flex gap-2"
      >
        <label htmlFor="new-babymoon" className="sr-only">
          רעיון לבייבימון
        </label>
        <input
          id="new-babymoon"
          className="field min-w-0 flex-1"
          placeholder="מה בא לכם לעשות לפני הלידה?"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 px-4" disabled={!text.trim()}>
          <Plus className="size-5" aria-hidden /> הוספה
        </button>
      </form>

      {list.length > 0 && (
        <Section title="הרשימה שלנו" collapsible={false} inset="3.25rem">
          {list.map((r) => (
            <div key={r.id} className="flex min-h-11 items-center gap-3 ps-4 pe-2">
              <CheckCircle
                checked={r.done}
                onToggle={() => actions.updateRecord(r.id, { done: !r.done })}
                label={r.done ? `סימון כלא נעשה: ${r.text}` : `סימון כנעשה: ${r.text}`}
              />
              <span className={`min-w-0 flex-1 py-2.5 text-body ${r.done ? 'text-twig-soft line-through' : ''}`}>
                {r.text}
              </span>
              <DeleteButton label={`מחיקת ${r.text}`} onDelete={() => actions.deleteRecord(r.id)} />
            </div>
          ))}
        </Section>
      )}

      <section className="mb-7" aria-labelledby="bm-ideas">
        <h2 id="bm-ideas" className="px-4 pb-2 text-title3">
          רעיונות
        </h2>
        <div className="flex flex-wrap gap-2 px-1">
          {BABYMOON_IDEAS.filter((i) => !have.has(i)).map((i) => (
            <button
              key={i}
              type="button"
              className="press min-h-9 rounded-full border border-line bg-paper px-3 text-subhead"
              onClick={() => add(i)}
              aria-label={`הוספה: ${i}`}
            >
              + {i}
            </button>
          ))}
        </div>
        <p className="list-footer">מתכננים נסיעה או טיסה? כדאי לבדוק קודם עם הרופא/ה או האחות שמלווים את ההריון.</p>
      </section>
    </>
  );
}

function DeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <button
      type="button"
      className="btn-danger min-h-9 shrink-0 px-3 text-footnote"
      onClick={onDelete}
      onBlur={() => setConfirm(false)}
    >
      מחיקה
    </button>
  ) : (
    <button
      type="button"
      className="press flex size-11 shrink-0 items-center justify-center text-twig-soft"
      aria-label={label}
      onClick={() => setConfirm(true)}
    >
      <Trash2 className="size-5" aria-hidden />
    </button>
  );
}
