import { Baby, ChevronLeft, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { EggProgress } from '../components/EggProgress';
import { useItemSheet } from '../components/ItemSheet';
import { CheckRow } from '../components/rows';
import { Sheet } from '../components/Sheet';
import { ProgressBar } from '../components/ui';
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

function Hero() {
  const household = useHousehold();
  const now = useNow();
  const date = new Date(now);

  if (household.birthDate) {
    const age = Math.max(0, babyAgeDays(household.birthDate, date));
    return (
      <div className="py-2">
        <EggProgress ratio={Math.min(1, age / 42)} label="ששת השבועות הראשונים">
          <span className="text-sm text-twig-soft">{household.babyName || 'התינוק/ת שלנו'}</span>
          <span className="font-display text-5xl leading-tight">{age}</span>
          <span className="text-sm text-twig-soft">{age === 1 ? 'יום' : 'ימים'} בעולם</span>
        </EggProgress>
        <p className="mt-3 text-center text-twig-soft">
          {ageText(age)}, מאז {formatIsoDate(household.birthDate)}
        </p>
      </div>
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
    <div className="py-2">
      <EggProgress ratio={st.progress} label="התקדמות ההריון">
        <span className="text-sm text-twig-soft">שבוע</span>
        <span className="font-display text-6xl leading-none tracking-tight" dir="ltr">
          {formatGestation(st)}
        </span>
        <span className="mt-1 text-[15px] font-semibold text-robin-deep">{dueLine}</span>
      </EggProgress>
      <p className="mt-3 text-center text-twig-soft">תאריך משוער: {formatIsoDate(household.dueDate)}</p>
    </div>
  );
}

function DueDatePrompt() {
  const actions = useActions();
  const [value, setValue] = useState('');
  return (
    <form
      className="shelf my-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValidIsoDate(value)) void actions.updateHousehold({ dueDate: value });
      }}
    >
      <h2 className="font-display text-xl">מתי התאריך המשוער?</h2>
      <p className="mt-1 text-twig-soft">כך נדע מה רלוונטי לכל שבוע ונסדר את המשימות לפי זמן.</p>
      <div className="mt-4 flex gap-2">
        <input
          type="date"
          className="field flex-1"
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

  return (
    <>
      <p className="text-lg text-twig-soft">
        {greeting(date)}, {firstName(user?.name ?? '')}
      </p>
      <Hero />

      {nearBirth && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link to="/labor" className="shelf flex items-center gap-3 p-4 font-semibold">
            <Timer className="size-6 text-brick" aria-hidden /> מצב לידה
          </Link>
          <button
            type="button"
            onClick={() => setBornOpen(true)}
            className="shelf flex items-center gap-3 p-4 text-start font-semibold"
          >
            <Baby className="size-6 text-robin" aria-hidden /> נולד/ה!
          </button>
        </div>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-baseline px-1">
          <h2 className="font-display text-xl">מה עכשיו</h2>
          <Link to="/tasks" className="ms-auto flex items-center text-[15px] font-semibold text-robin">
            כל המשימות <ChevronLeft className="size-4" aria-hidden />
          </Link>
        </div>
        {upcoming.length ? (
          <div className="shelf divide-y divide-line overflow-hidden">
            {upcoming.map(({ item }) => (
              <CheckRow key={item.id} item={item} household={household} members={members} onOpen={openItem} />
            ))}
          </div>
        ) : (
          <p className="shelf px-4 py-5 text-twig-soft">אין משימות דחופות כרגע. אפשר לנשום.</p>
        )}
        {earlier.length > 0 && (
          <Link to="/tasks" className="mt-3 block px-1 text-[15px] leading-snug text-twig-soft">
            {earlier.length === 1 ? 'משימה אחת' : `${earlier.length} משימות`} משלבים מוקדמים יותר עוד לא סומנו. אולי כבר
            טיפלתם בהן? <span className="font-semibold text-robin">לעבור ולסמן</span>
          </Link>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 px-1 font-display text-xl">איפה אנחנו עומדים</h2>
        <div className="shelf divide-y divide-line">
          {[
            { to: '/tasks', label: 'משימות', p: tasks },
            { to: '/gear', label: 'ציוד חובה', p: gearMust },
            { to: '/gear?tab=bag', label: 'תיק לידה', p: bag },
          ].map(({ to, label, p }) => (
            <Link key={to} to={to} className="block px-4 py-3">
              <span className="mb-1.5 flex items-baseline">
                <span className="font-semibold">{label}</span>
                <span className="ms-auto text-sm text-twig-soft">
                  {p.done} מתוך {p.total}
                </span>
              </span>
              <ProgressBar ratio={p.ratio} label={label} />
            </Link>
          ))}
        </div>
      </section>

      {activity.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 px-1 font-display text-xl">עדכונים אחרונים</h2>
          <ul className="shelf divide-y divide-line">
            {activity.map((i) => {
              const who = i.updatedBy ? household.members[i.updatedBy]?.name : undefined;
              return (
                <li key={i.id}>
                  <button type="button" onClick={() => openItem(i)} className="w-full px-4 py-3 text-start">
                    <span className={`block ${i.done ? 'text-twig-soft line-through' : ''}`}>{i.title}</span>
                    <span className="text-sm text-twig-soft">
                      {who ? `${firstName(who)}, ` : ''}
                      {timeAgo(i.updatedAt ?? now, now)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
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
