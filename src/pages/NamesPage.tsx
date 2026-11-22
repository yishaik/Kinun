/** "רשימת שמות" — each partner proposes names and marks love / no; names you both love float up. */
import { Heart, Plus, ThumbsDown, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Avatar, EmptyState, FilterChips, PageTitle, Section } from '../components/ui';
import { useActions, useHousehold, useRecords, useSession } from '../data/session';
import { firstName } from '../lib/format';
import { useMembers, type MemberEntry } from '../lib/hooks';
import { groupNames, hasName, NAME_TAGS, type NameTag } from '../lib/names';
import type { HouseholdRecord } from '../lib/types';

type Filter = 'all' | NameTag;

export function NamesPage() {
  const household = useHousehold();
  const members = useMembers(household);
  const actions = useActions();
  const { user } = useSession();
  const { records, loaded } = useRecords('name');
  const [text, setText] = useState('');
  const [tag, setTag] = useState<NameTag>('any');
  const [filter, setFilter] = useState<Filter>('all');
  const uids = useMemo(() => members.map((m) => m.uid), [members]);

  const shown = filter === 'all' ? records : records.filter((r) => r.tag === filter || r.tag === 'any');
  const groups = groupNames(shown, uids);
  const duplicate = text.trim() !== '' && hasName(records, text);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim().replace(/\s+/g, ' ');
    if (!t || duplicate || !user) return;
    actions.addRecord({ kind: 'name', text: t, tag, votes: { [user.uid]: 'love' } });
    setText('');
  };

  return (
    <>
      <PageTitle>רשימת שמות</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        כל אחד מציע שמות ומסמן ❤️ או 👎. שם שמציעים מסומן אוטומטית כ״אוהב/ת״ אצל מי שהציע.
      </p>

      <form onSubmit={add} className="mb-3">
        <div className="flex gap-2">
          <label htmlFor="new-name" className="sr-only">
            שם חדש
          </label>
          <input
            id="new-name"
            className="field min-w-0 flex-1"
            placeholder="שם שאתם אוהבים"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            aria-describedby={duplicate ? 'name-dup' : undefined}
          />
          <button type="submit" className="btn-primary shrink-0 px-4" disabled={!text.trim() || duplicate}>
            <Plus className="size-5" aria-hidden /> הוספה
          </button>
        </div>
        {duplicate && (
          <p id="name-dup" className="mt-1 px-1 text-footnote text-brick-ink">
            השם כבר ברשימה.
          </p>
        )}
        <div className="mt-2">
          <FilterChips
            label="השם מתאים ל"
            value={tag}
            onChange={setTag}
            options={NAME_TAGS.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>
      </form>

      {records.length > 0 && (
        <div className="mb-6">
          <FilterChips
            label="סינון"
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'הכל' }, ...NAME_TAGS.filter((t) => t.value !== 'any')]}
          />
        </div>
      )}

      {loaded && records.length === 0 && <EmptyState title="עוד אין שמות" body="הציעו את השם הראשון." />}

      {groups.both.length > 0 && (
        <Section title="שנינו אוהבים 💚" collapsible={false} inset="1rem">
          {groups.both.map((r) => (
            <NameRow key={r.id} r={r} members={members} />
          ))}
        </Section>
      )}
      {groups.pending.length > 0 && (
        <Section title="מחכים להצבעה" collapsible={false} inset="1rem">
          {groups.pending.map((r) => (
            <NameRow key={r.id} r={r} members={members} />
          ))}
        </Section>
      )}
      {groups.no.length > 0 && (
        <Section title="פחות" defaultOpen={false} inset="1rem">
          {groups.no.map((r) => (
            <NameRow key={r.id} r={r} members={members} />
          ))}
        </Section>
      )}
    </>
  );
}

function NameRow({ r, members }: { r: HouseholdRecord; members: MemberEntry[] }) {
  const actions = useActions();
  const { user } = useSession();
  const mine = user ? r.votes[user.uid] : undefined;
  const tagLabel = NAME_TAGS.find((t) => t.value === r.tag)?.label;
  return (
    <div className="flex min-h-14 items-center gap-2 ps-4 pe-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-headline">{r.text}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-footnote text-twig-soft">
          {tagLabel && <span>{tagLabel}</span>}
          {members.map((m) => {
            const v = r.votes[m.uid];
            if (!v) return null;
            return (
              <span key={m.uid} className="inline-flex items-center gap-1">
                <Avatar name={m.name} photoURL={m.photoURL} size={16} />
                {firstName(m.name)} {v === 'love' ? '❤️' : '👎'}
              </span>
            );
          })}
        </p>
      </div>
      <button
        type="button"
        aria-pressed={mine === 'love'}
        aria-label={`אוהב/ת את ${r.text}`}
        onClick={() => actions.vote(r, 'love')}
        className={`press flex size-11 items-center justify-center rounded-full ${mine === 'love' ? 'bg-brick-soft text-brick-ink' : 'text-twig-soft'}`}
      >
        <Heart className="size-5" fill={mine === 'love' ? 'currentColor' : 'none'} aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={mine === 'no'}
        aria-label={`לא אוהב/ת את ${r.text}`}
        onClick={() => actions.vote(r, 'no')}
        className={`press flex size-11 items-center justify-center rounded-full ${mine === 'no' ? 'bg-fill-strong text-twig' : 'text-twig-soft'}`}
      >
        <ThumbsDown className="size-5" aria-hidden />
      </button>
      {r.createdBy === user?.uid && (
        <button
          type="button"
          aria-label={`מחיקת השם ${r.text}`}
          onClick={() => actions.deleteRecord(r.id)}
          className="press flex size-11 items-center justify-center text-twig-faint"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
