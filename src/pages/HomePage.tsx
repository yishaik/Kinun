import { Baby, CalendarHeart, ChevronLeft, Timer, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useItemSheet } from '../components/ItemSheet';
import { CheckRow } from '../components/rows';
import { Sheet } from '../components/Sheet';
import { Chevron, PageTitle, Ring, Section } from '../components/ui';
import { useActions, useHousehold, useSession } from '../data/session';
import { useToast } from '../data/toast';
import { firstName, formatIsoDate, greeting, timeAgo } from '../lib/format';
import { useMembers, useNow } from '../lib/hooks';
import { PHASE_ORDER } from '../lib/labels';
import {
  babyAgeDays,
  currentPhase,
  formatGestation,
  isValidIsoDate,
  pregnancyStatus,
  todayIso,
} from '../lib/pregnancy';
import { earlierStageTasks, progressOf, recentActivity, upcomingTasks } from '../lib/progress';
import { weekInfo, weekTasks } from '../lib/week';
import type { Item } from '../lib/types';

const dayFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

function daysText(n: number): string {
  if (n === 1) return 'יום אחד';
  if (n === 2) return 'יומיים';
  return `${n} ימים`;
}

function ageText(days: number): string {
  if (days < 7) return days === 0 ? 'נולד/ה היום' : daysText(days);
  const w = Math.floor(days / 7);
  const d = days % 7;
  const weeks = w === 1 ? 'שבוע' : w === 2 ? 'שבועיים' : `${w} שבועות`;
  return d ? `${weeks} ו${daysText(d)}` : weeks;
}

const TRIMESTER_LABEL = { 1: 'שליש ראשון', 2: 'שליש שני', 3: 'שליש שלישי' } as const;

function Hero() {
  const household = useHousehold();
  const now = useNow();
  const date = new Date(now);

  if (household.birthDate) {
    const age = Math.max(0, babyAgeDays(household.birthDate, date));
    return (
      <section className="widget mb-6 flex items-center gap-5 p-5" aria-label="התינוק/ת">
        <div className="min-w-0 flex-1">
          <p className="text-footnote font-semibold text-robin">{household.babyName || 'התינוק/ת שלנו'}</p>
          <p className="mt-1 text-[3.25rem] leading-none font-bold tracking-tight tabular">
            <bdi>{age}</bdi>
          </p>
          <p className="mt-2 text-headline">{age === 1 ? 'יום' : 'ימים'} בעולם</p>
          <p className="mt-0.5 text-footnote text-twig-soft">
            {ageText(age)}, מאז {formatIsoDate(household.birthDate)}
          </p>
        </div>
        <Ring ratio={Math.min(1, age / 42)} size={112} stroke={12} tone="leaf" sunCap label="ששת השבועות הראשונים">
          <span className="text-title3 tabular">
            <bdi>{Math.min(6, Math.floor(age / 7))}/6</bdi>
          </span>
          <span className="text-caption text-twig-soft">שבועות</span>
        </Ring>
      </section>
    );
  }

  if (!household.dueDate) return <DueDatePrompt />;

  const st = pregnancyStatus(household.dueDate, date);
  const dueLine =
    st.daysToDue > 0
      ? `עוד ${daysText(st.daysToDue)}`
      : st.daysToDue === 0
        ? 'היום התאריך המשוער'
        : `${daysText(-st.daysToDue)} אחרי התאריך`;
  return (
    <section className="widget mb-6 flex items-center gap-5 p-5" aria-label="ההריון">
      <div className="min-w-0 flex-1">
        <p className="text-footnote font-semibold text-robin">שבוע · {TRIMESTER_LABEL[st.trimester]}</p>
        <p className="mt-1 text-[3.25rem] leading-none font-bold tracking-tight tabular">
          <bdi dir="ltr">{formatGestation(st)}</bdi>
        </p>
        <p className="mt-2 text-headline">{dueLine}</p>
        <p className="mt-0.5 text-footnote text-twig-soft">תאריך משוער: {formatIsoDate(household.dueDate)}</p>
      </div>
      <Ring ratio={st.progress} size={112} stroke={12} sunCap label="התקדמות ההריון">
        <span className="text-title3 tabular">
          <bdi>{Math.round(st.progress * 100)}%</bdi>
        </span>
        <span className="text-caption text-twig-soft">מ-40 שבועות</span>
      </Ring>
    </section>
  );
}

function DueDatePrompt() {
  const actions = useActions();
  const [value, setValue] = useState('');
  return (
    <form
      className="widget mb-6 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValidIsoDate(value)) void actions.updateHousehold({ dueDate: value });
      }}
    >
      <h2 className="text-title3">מתי התאריך המשוער?</h2>
      <p className="mt-1 text-subhead text-twig-soft">כך נדע מה רלוונטי לכל שבוע ונסדר את המשימות לפי זמן.</p>
      <div className="mt-4 flex gap-2">
        <input
          type="date"
          className="field flex-1 bg-fill!"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="תאריך לידה משוער"
        />
        <button type="submit" className="btn-primary" disabled={!isValidIsoDate(value)}>
          שמירה
        </button>
      </div>
    </form>
  );
}

/** "השבוע שלכם" teaser: the baby excerpt for this week + how many tasks are due. Links to /week. */
function WeekCard({ week, items }: { week: number; items: Item[] }) {
  const info = weekInfo(week);
  if (!info) return null;
  const due = weekTasks(items, week, 99).length;
  return (
    <Link to="/week" className="widget press mb-3 block p-4" aria-label={`השבוע שלכם, שבוע ${week}`}>
      <span className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[9px] bg-leaf text-on-leaf">
          <CalendarHeart className="size-[18px]" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="text-headline">השבוע שלכם</span>
        <span className="ms-auto flex items-center gap-0.5 text-subhead text-robin">
          שבוע {week} <ChevronLeft className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
      </span>
      <span className="mt-2 line-clamp-3 block text-subhead leading-relaxed text-twig">{info.baby}</span>
      <span className="mt-2 block text-footnote text-twig-soft">
        {due ? `${due === 1 ? 'משימה אחת' : `${due} משימות`} לשבוע הזה` : 'גם מה קורה אצל היולדת ומה לעשות השבוע'}
      </span>
    </Link>
  );
}

function WarningsRow() {
  return (
    <Link to="/warnings" className="widget press mb-7 flex min-h-11 items-center gap-3 px-4 py-3">
      <span className="flex size-8 items-center justify-center rounded-[9px] bg-brick text-on-danger">
        <TriangleAlert className="size-[18px]" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-headline">סימני אזהרה</span>
        <span className="block text-footnote text-twig-soft">מתי לחדר הלידה ומתי למד״א 101</span>
      </span>
      <ChevronLeft className="size-4 text-twig-faint" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

export function BabyBornSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const actions = useActions();
  const { toast } = useToast();
  const [date, setDate] = useState(todayIso());
  const [name, setName] = useState('');
  return (
    <Sheet
      open={open}
      title="התינוק/ת נולד/ה!"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn-primary w-full"
          disabled={!isValidIsoDate(date)}
          onClick={() => {
            void actions.updateHousehold({ birthDate: date, babyName: name.trim() || null });
            toast('מזל טוב! הרשימות עברו לשלב שאחרי הלידה.', 'success');
            onClose();
          }}
        >
          שמירה
        </button>
      }
    >
      <p className="mb-4 text-twig-soft">האפליקציה תעבור לשלב שאחרי הלידה, והמשימות יתוזמנו לפי תאריך הלידה.</p>
      <label className="label" htmlFor="born-date">
        תאריך הלידה
      </label>
      <input id="born-date" type="date" className="field mb-4" value={date} onChange={(e) => setDate(e.target.value)} />
      <label className="label" htmlFor="born-name">
        שם (אפשר גם אחר כך)
      </label>
      <input id="born-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
    </Sheet>
  );
}

export function HomePage() {
  const household = useHousehold();
  const { items, user } = useSession();
  const members = useMembers(household);
  const now = useNow();
  const { openItem, sheet } = useItemSheet();
  const [bornOpen, setBornOpen] = useState(false);

  const date = new Date(now);
  const phase = currentPhase(household, date);
  const upcoming = upcomingTasks(items, household, {
    now: date,
    horizonDays: 21,
    limit: 6,
    currentPhaseOrder: PHASE_ORDER[phase],
  });
  const earlier = earlierStageTasks(items, household);
  const tasks = progressOf(items, 'task');
  const gearMust = progressOf(items, 'gear', (i) => i.priority === 'must');
  const bag = progressOf(items, 'bag');
  const activity = recentActivity(
    items.filter((i) => (i.updatedAt ?? 0) - (i.createdAt ?? 0) > 2000),
    5,
  );
  const week = household.dueDate ? pregnancyStatus(household.dueDate, date).week : 0;
  const nearBirth = !household.birthDate && week >= 36;

  const stats = [
    { to: '/tasks', label: 'משימות', p: tasks },
    { to: '/gear', label: 'ציוד חובה', p: gearMust },
    { to: '/gear?tab=bag', label: 'תיק לידה', p: bag },
  ];

  return (
    <>
      <PageTitle eyebrow={dayFmt.format(date)}>
        {greeting(date)}
        {user?.name ? `, ${firstName(user.name)}` : ''}
      </PageTitle>
      <Hero />
      {!household.birthDate && household.dueDate && (
        <>
          <WeekCard week={week} items={items} />
          <WarningsRow />
        </>
      )}

      {nearBirth && (
        <div className="mb-7 grid grid-cols-2 gap-3">
          <Link to="/labor" className="widget press flex flex-col gap-3 p-4">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brick text-on-danger">
              <Timer className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-headline">מצב לידה</span>
          </Link>
          <button
            type="button"
            onClick={() => setBornOpen(true)}
            className="widget press flex flex-col gap-3 p-4 text-start"
          >
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-leaf text-on-leaf">
              <Baby className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-headline">נולד/ה!</span>
          </button>
        </div>
      )}

      <Section
        title="מה עכשיו"
        collapsible={false}
        aside={
          <Link to="/tasks" className="flex items-center gap-0.5 text-subhead text-robin">
            כל המשימות <ChevronLeft className="size-4" strokeWidth={2.5} aria-hidden />
          </Link>
        }
        footer={
          earlier.length > 0 ? (
            <Link to="/tasks" className="block">
              {earlier.length === 1 ? 'משימה אחת' : `${earlier.length} משימות`} משלבים מוקדמים יותר עוד לא סומנו. אולי
              כבר טיפלתם בהן? <span className="font-semibold text-robin">לעבור ולסמן</span>
            </Link>
          ) : undefined
        }
      >
        {upcoming.length ? (
          upcoming.map(({ item }) => (
            <CheckRow key={item.id} item={item} household={household} members={members} onOpen={openItem} />
          ))
        ) : (
          <p className="px-4 py-3 text-twig-soft">אין משימות דחופות כרגע. אפשר לנשום.</p>
        )}
      </Section>

      <section className="mb-7">
        <h2 className="mb-2 px-4 text-title3">איפה אנחנו עומדים</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ to, label, p }) => (
            <Link key={to} to={to} className="widget press flex flex-col items-center gap-2 px-2 py-4 text-center">
              <Ring ratio={p.ratio} size={56} stroke={7} tone={p.total > 0 && p.done === p.total ? 'leaf' : 'robin'}>
                <span className="text-footnote font-semibold tabular">{Math.round(p.ratio * 100)}%</span>
              </Ring>
              <span className="text-subhead font-semibold">{label}</span>
              <span className="-mt-1.5 text-footnote text-twig-soft tabular">
                {p.done} מתוך {p.total}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {activity.length > 0 && (
        <Section title="עדכונים אחרונים" collapsible={false} inset="1rem">
          {activity.map((i) => {
            const who = i.updatedBy ? household.members[i.updatedBy]?.name : undefined;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => openItem(i)}
                className="row-tap flex min-h-11 w-full items-center gap-2 ps-4 pe-3 text-start"
              >
                <span className="min-w-0 flex-1 py-[11px]">
                  <span className={`block ${i.done ? 'text-twig-soft' : ''}`}>{i.title}</span>
                  <span className="text-footnote text-twig-soft">
                    {who ? `${firstName(who)} · ` : ''}
                    {timeAgo(i.updatedAt ?? now, now)}
                  </span>
                </span>
                <Chevron />
              </button>
            );
          })}
        </Section>
      )}

      {!household.birthDate && !nearBirth && week >= 24 && (
        <button type="button" onClick={() => setBornOpen(true)} className="btn-quiet mx-auto mb-4 flex">
          <Baby className="size-4" aria-hidden /> התינוק/ת כבר נולד/ה?
        </button>
      )}

      <BabyBornSheet open={bornOpen} onClose={() => setBornOpen(false)} />
      {sheet}
    </>
  );
}
