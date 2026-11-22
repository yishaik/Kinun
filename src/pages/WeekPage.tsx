/** "השבוע שלכם" — the weekly card in full, with prev/next to browse other weeks. */
import { Baby, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { useItemSheet } from '../components/ItemSheet';
import { MedicalNote, SourceLink } from '../components/info';
import { CheckRow } from '../components/rows';
import { EmptyState, PageTitle, Section } from '../components/ui';
import { useHousehold, useSession } from '../data/session';
import { useMembers, useNow } from '../lib/hooks';
import { pregnancyStatus } from '../lib/pregnancy';
import { FIRST_WEEK, LAST_WEEK, weekInfo, weekTasks } from '../lib/week';

export function WeekPage() {
  const household = useHousehold();
  const { items } = useSession();
  const members = useMembers(household);
  const { openItem, sheet } = useItemSheet();
  const now = useNow();
  const [params, setParams] = useSearchParams();

  const current = household.dueDate ? pregnancyStatus(household.dueDate, new Date(now)).week : null;
  const requested = Number(params.get('w'));
  const week =
    Number.isInteger(requested) && requested >= FIRST_WEEK && requested <= 42 ? requested : (current ?? FIRST_WEEK);
  const info = weekInfo(week);
  const tasks = weekTasks(items, week, 8);
  const go = (w: number) => setParams(w === current ? {} : { w: String(w) }, { replace: true });

  return (
    <>
      <PageTitle eyebrow={week === current ? 'השבוע שלכם' : current != null ? `אתם בשבוע ${current}` : undefined}>
        שבוע {week}
      </PageTitle>

      <div className="mb-5 flex items-center gap-2 px-1">
        <button
          type="button"
          className="btn-outline px-3"
          onClick={() => go(week - 1)}
          disabled={week <= FIRST_WEEK}
          aria-label="השבוע הקודם"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
        {current != null && week !== current && (
          <button type="button" className="btn-quiet flex-1" onClick={() => go(current)}>
            חזרה לשבוע הנוכחי
          </button>
        )}
        <button
          type="button"
          className="btn-outline ms-auto px-3"
          onClick={() => go(week + 1)}
          disabled={week >= Math.max(LAST_WEEK, 42)}
          aria-label="השבוע הבא"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      </div>

      {!info ? (
        <EmptyState title="הכרטיסים מתחילים בשבוע 4" body="הוסיפו תאריך משוער בהגדרות כדי לראות את השבוע שלכם." />
      ) : (
        <>
          {week > LAST_WEEK && (
            <p className="mb-3 px-1 text-subhead text-twig-soft">
              אחרי שבוע {LAST_WEEK} מוצג המידע של שבוע {LAST_WEEK}.
            </p>
          )}
          <section className="widget mb-4 p-4" aria-labelledby="wk-baby">
            <h2 id="wk-baby" className="mb-1.5 flex items-center gap-2 text-headline text-leaf-ink">
              <Baby className="size-5" aria-hidden /> התינוק/ת
            </h2>
            <p className="text-body leading-relaxed">{info.baby}</p>
          </section>
          <section className="widget mb-2 p-4" aria-labelledby="wk-mom">
            <h2 id="wk-mom" className="mb-1.5 flex items-center gap-2 text-headline text-lagoon">
              <Heart className="size-5" aria-hidden /> אצל היולדת
            </h2>
            <p className="text-body leading-relaxed">{info.mom}</p>
          </section>
          <p className="mb-6 px-1">
            <SourceLink url={info.source} label="להמשך קריאה במכבי" />
          </p>
        </>
      )}

      <Section title="לעשות השבוע" collapsible={false} footer="משימות מהרשימה שלכם שמתוזמנות לשבוע הזה או לבא אחריו.">
        {tasks.length ? (
          tasks.map((t) => <CheckRow key={t.id} item={t} household={household} members={members} onOpen={openItem} />)
        ) : (
          <p className="px-4 py-3 text-twig-soft">
            אין משימות מתוזמנות לשבוע הזה.{' '}
            <Link to="/tasks" className="text-robin">
              לכל המשימות
            </Link>
          </p>
        )}
      </Section>

      <MedicalNote>
        מידע כללי מתוך המדריך השבועי של מכבי שירותי בריאות. כל הריון שונה — בשאלות פנו לצוות המטפל.
      </MedicalNote>
      {sheet}
    </>
  );
}
