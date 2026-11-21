import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useItemSheet } from '../components/ItemSheet';
import { CheckRow } from '../components/rows';
import { EmptyState, Fab, FilterChips, PageTitle, ProgressBar, Section, Segmented } from '../components/ui';
import { useHousehold, useSession } from '../data/session';
import { useMembers } from '../lib/hooks';
import { categoryLabel, orderedCategories } from '../lib/labels';
import { progressOf, sortItems } from '../lib/progress';
import type { ItemKind } from '../lib/types';

type Tab = 'gear' | 'bag';
type GearFilter = 'missing' | 'all' | 'must';

export function GearPage() {
  const household = useHousehold();
  const { items } = useSession();
  const members = useMembers(household);
  const { openItem, openNew, sheet } = useItemSheet();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'bag' ? 'bag' : 'gear';
  const [filter, setFilter] = useState<GearFilter>('all');

  const kind: ItemKind = tab;
  const list = useMemo(() => items.filter((i) => i.kind === kind), [items, kind]);
  const visible = useMemo(
    () =>
      list.filter((i) =>
        tab === 'bag' ? true : filter === 'all' ? true : filter === 'must' ? i.priority === 'must' : !i.done,
      ),
    [list, tab, filter],
  );
  const groups = orderedCategories(
    kind,
    visible.map((i) => i.category),
  ).map((cat) => ({
    cat,
    items: sortItems(visible.filter((i) => i.category === cat)),
    all: list.filter((i) => i.category === cat),
  }));

  const progress = tab === 'gear' ? progressOf(items, 'gear', (i) => i.priority === 'must') : progressOf(items, 'bag');
  const remainingCost = list
    .filter((i) => !i.done && typeof i.price === 'number')
    .reduce((sum, i) => sum + (i.price ?? 0), 0);

  return (
    <>
      <PageTitle>ציוד</PageTitle>
      <div className="mb-4">
        <Segmented
          label="רשימה"
          value={tab}
          onChange={(v) => setParams(v === 'bag' ? { tab: 'bag' } : {}, { replace: true })}
          options={[
            { value: 'gear', label: 'ציוד לתינוק ולבית' },
            { value: 'bag', label: 'תיק לידה' },
          ]}
        />
      </div>

      <div className="shelf mb-5 px-4 py-3">
        <div className="mb-1.5 flex items-baseline">
          <span className="font-semibold">{tab === 'gear' ? 'פריטי חובה שיש לנו' : 'ארוז בתיק'}</span>
          <span className="ms-auto text-sm text-twig-soft">
            {progress.done} מתוך {progress.total}
          </span>
        </div>
        <ProgressBar ratio={progress.ratio} label={tab === 'gear' ? 'פריטי חובה' : 'תיק לידה'} />
        {tab === 'gear' && remainingCost > 0 && (
          <p className="mt-2 text-sm text-twig-soft">
            עלות משוערת של מה שעוד חסר: ₪{remainingCost.toLocaleString('he-IL')}
          </p>
        )}
        {tab === 'bag' && <p className="mt-2 text-sm text-twig-soft">מומלץ שהתיק יהיה מוכן סביב שבוע 36.</p>}
      </div>

      {tab === 'gear' && (
        <div className="mb-5">
          <FilterChips
            label="סינון ציוד"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'הכול' },
              { value: 'missing', label: 'מה שחסר' },
              { value: 'must', label: 'רק חובה' },
            ]}
          />
        </div>
      )}

      {groups.map(({ cat, items: rows, all }) => (
        <Section
          key={cat}
          title={categoryLabel(kind, cat)}
          count={{ done: all.filter((i) => i.done).length, total: all.length }}
        >
          {rows.map((i) => (
            <CheckRow key={i.id} item={i} household={household} members={members} onOpen={openItem} />
          ))}
        </Section>
      ))}

      {groups.length === 0 && (
        <EmptyState
          title={list.length ? 'אין פריטים חסרים' : 'הרשימה ריקה'}
          body={
            list.length
              ? 'כל מה שסימנתם כחובה כבר אצלכם. אפשר לעבור ל"הכול" כדי לראות הכול.'
              : 'הוסיפו פריט עם הכפתור למטה.'
          }
        />
      )}

      <Fab label={tab === 'gear' ? 'הוספת ציוד' : 'הוספת פריט לתיק'} onClick={() => openNew({ kind })} />
      {sheet}
    </>
  );
}
