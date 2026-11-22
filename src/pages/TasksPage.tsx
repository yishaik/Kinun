import { useMemo, useState } from 'react';
import { CategoryMark } from '../components/CategoryMark';
import { useItemSheet } from '../components/ItemSheet';
import { PeekDecor, TASK_PEEKS } from '../components/PeekDecor';
import { CheckRow } from '../components/rows';
import { EmptyState, Fab, FilterChips, PageTitle, Section, Segmented } from '../components/ui';
import { useHousehold, useSession } from '../data/session';
import { useMembers, useNow } from '../lib/hooks';
import { categoryLabel, orderedCategories, PHASE_ORDER, PHASES } from '../lib/labels';
import { currentPhase, taskDue } from '../lib/pregnancy';
import type { Item } from '../lib/types';

type AssigneeFilter = 'all' | 'mine' | 'both' | 'unassigned';
type GroupBy = 'category' | 'phase';

export function TasksPage() {
  const household = useHousehold();
  const { items, user } = useSession();
  const members = useMembers(household);
  const now = useNow();
  const { openItem, openNew, sheet } = useItemSheet();
  const [filter, setFilter] = useState<AssigneeFilter>('all');
  const [showDone, setShowDone] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('category');

  const phase = currentPhase(household, new Date(now));
  const tasks = useMemo(() => items.filter((i) => i.kind === 'task'), [items]);

  const uid = user?.uid;
  const { byPhase, byCategory, doneCount } = useMemo(() => {
    const matches = (i: Item) =>
      filter === 'all' ||
      (filter === 'mine' && (i.assignee === uid || i.assignee === 'both')) ||
      (filter === 'both' && i.assignee === 'both') ||
      (filter === 'unassigned' && !i.assignee);
    const dueDay = (i: Item) => taskDue(i, household)?.day ?? Number.POSITIVE_INFINITY;
    const matched = tasks.filter(matches);
    const visibleOf = (all: Item[]) =>
      all
        .filter((t) => showDone || !t.done)
        .sort((a, b) => Number(a.done) - Number(b.done) || dueDay(a) - dueDay(b) || a.order - b.order);

    const groups = PHASES.map((p) => {
      const all = matched.filter((t) => t.phase === p.key);
      return { phase: p, all, visible: visibleOf(all), done: all.filter((t) => t.done).length };
    });

    const categories = orderedCategories(
      'task',
      matched.map((t) => t.category),
    ).map((cat) => {
      const all = matched.filter((t) => t.category === cat);
      return { cat, all, visible: visibleOf(all), done: all.filter((t) => t.done).length };
    });

    return { byPhase: groups, byCategory: categories, doneCount: matched.filter((t) => t.done).length };
  }, [tasks, household, filter, showDone, uid]);

  const anyVisible = (groupBy === 'phase' ? byPhase : byCategory).some((g) => g.visible.length > 0);

  return (
    <>
      <PageTitle
        aside={
          <button
            type="button"
            className="press min-h-9 rounded-full px-1 text-subhead text-robin"
            aria-pressed={showDone}
            onClick={() => setShowDone((v) => !v)}
          >
            {showDone ? 'להסתיר שבוצעו' : `להציג שבוצעו (${doneCount})`}
          </button>
        }
      >
        משימות
      </PageTitle>

      <div className="mb-4">
        <Segmented
          label="קיבוץ"
          value={groupBy}
          onChange={setGroupBy}
          options={[
            { value: 'category', label: 'לפי קטגוריה' },
            { value: 'phase', label: 'לפי שלב' },
          ]}
        />
      </div>

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

      {groupBy === 'phase' &&
        byPhase.map(({ phase: p, all, visible, done }) =>
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

      {groupBy === 'category' &&
        byCategory.map(({ cat, all, visible, done }) =>
          visible.length === 0 ? null : (
            <Section
              key={cat}
              title={categoryLabel('task', cat)}
              mark={<CategoryMark kind="task" category={cat} />}
              peek={TASK_PEEKS[cat] ? <PeekDecor kind={TASK_PEEKS[cat]} /> : undefined}
              count={{ done, total: all.length }}
              defaultOpen
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
