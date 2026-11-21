import { useMemo, useState } from 'react';
import { useItemSheet } from '../components/ItemSheet';
import { CheckRow } from '../components/rows';
import { EmptyState, Fab, FilterChips, PageTitle, Section } from '../components/ui';
import { useHousehold, useSession } from '../data/session';
import { useMembers, useNow } from '../lib/hooks';
import { PHASE_ORDER, PHASES } from '../lib/labels';
import { currentPhase, taskDue } from '../lib/pregnancy';
import type { Item } from '../lib/types';

type AssigneeFilter = 'all' | 'mine' | 'both' | 'unassigned';

export function TasksPage() {
  const household = useHousehold();
  const { items, user } = useSession();
  const members = useMembers(household);
  const now = useNow();
  const { openItem, openNew, sheet } = useItemSheet();
  const [filter, setFilter] = useState<AssigneeFilter>('all');
  const [showDone, setShowDone] = useState(false);

  const phase = currentPhase(household, new Date(now));
  const tasks = useMemo(() => items.filter((i) => i.kind === 'task'), [items]);

  const uid = user?.uid;
  const { byPhase, doneCount } = useMemo(() => {
    const matches = (i: Item) =>
      filter === 'all' ||
      (filter === 'mine' && (i.assignee === uid || i.assignee === 'both')) ||
      (filter === 'both' && i.assignee === 'both') ||
      (filter === 'unassigned' && !i.assignee);
    const dueDay = (i: Item) => taskDue(i, household)?.day ?? Number.POSITIVE_INFINITY;
    const groups = PHASES.map((p) => {
      const all = tasks.filter((t) => t.phase === p.key && matches(t));
      const visible = all
        .filter((t) => showDone || !t.done)
        .sort((a, b) => Number(a.done) - Number(b.done) || dueDay(a) - dueDay(b) || a.order - b.order);
      return { phase: p, all, visible, done: all.filter((t) => t.done).length };
    });
    return { byPhase: groups, doneCount: tasks.filter((t) => t.done && matches(t)).length };
  }, [tasks, household, filter, showDone, uid]);

  const anyVisible = byPhase.some((g) => g.visible.length > 0);

  return (
    <>
      <PageTitle
        aside={
          <button
            type="button"
            className="btn-quiet px-3 text-[15px]"
            aria-pressed={showDone}
            onClick={() => setShowDone((v) => !v)}
          >
            {showDone ? 'להסתיר שבוצעו' : `להציג שבוצעו (${doneCount})`}
          </button>
        }
      >
        משימות
      </PageTitle>

      <div className="mb-5">
        <FilterChips
          label="סינון לפי אחריות"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'הכול' },
            { value: 'mine', label: 'שלי' },
            { value: 'both', label: 'של שנינו' },
            { value: 'unassigned', label: 'לא משויך' },
          ]}
        />
      </div>

      {byPhase.map(({ phase: p, all, visible, done }) =>
        visible.length === 0 ? null : (
          <Section
            key={p.key}
            title={p.label}
            hint={p.key === phase ? 'עכשיו' : undefined}
            count={{ done, total: all.length }}
            defaultOpen={PHASE_ORDER[p.key] <= PHASE_ORDER[phase] + 1}
          >
            {visible.map((t) => (
              <CheckRow key={t.id} item={t} household={household} members={members} onOpen={openItem} />
            ))}
          </Section>
        ),
      )}

      {!anyVisible && (
        <EmptyState
          title={tasks.length ? 'אין כאן משימות פתוחות' : 'עוד אין משימות'}
          body={
            tasks.length ? 'אפשר להציג גם את מה שכבר בוצע, או לשנות את הסינון.' : 'הוסיפו משימה ראשונה עם הכפתור למטה.'
          }
        />
      )}

      <Fab
        label="הוספת משימה"
        onClick={() => openNew({ kind: 'task', phase, assignee: filter === 'mine' ? (user?.uid ?? null) : null })}
      />
      {sheet}
    </>
  );
}
