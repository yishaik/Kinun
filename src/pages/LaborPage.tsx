/**
 * Labor mode — a calm dark screen for the night of the birth:
 * one big contraction button (shared live between both phones), call/navigate shortcuts,
 * the "when to go" guidance, and the short labor checklist.
 */
import { Baby, Car, Navigation, Phone, Siren, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle, Chevron, PageTitle } from '../components/ui';
import { SRC } from '../content';
import { useActions, useHousehold, useSession } from '../data/session';
import {
  durationSec,
  formatClock,
  intervalsSec,
  sortByStart,
  statsForWindow,
  suggestCalling,
} from '../lib/contractions';
import { formatTime, hostOf, telHref } from '../lib/format';
import { useNow } from '../lib/hooks';
import { navigationLinks } from '../lib/platform';
import { progressOf } from '../lib/progress';
import type { Contraction } from '../lib/types';
import { BabyBornSheet } from './HomePage';

const FALLBACK_GUIDANCE =
  'צירים סדירים וכואבים כל 5 דקות במשך שעתיים (בלידה ראשונה) או שעה (בלידה חוזרת). ירידת מים — להגיע תוך 1–2 שעות. דימום, או ירידה בתנועות העובר — לפנות מיד. בכל ספק — מתקשרים לחדר הלידה.';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-night-2 px-3 py-3 text-center">
      <div className="text-title2 font-semibold tabular" dir="ltr">
        {value}
      </div>
      <div className="mt-0.5 text-caption leading-tight text-night-soft">{label}</div>
    </div>
  );
}

export function LaborPage() {
  const household = useHousehold();
  const { store, items } = useSession();
  const actions = useActions();
  const now = useNow(1000);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [bornOpen, setBornOpen] = useState(false);

  useEffect(() => store.watchContractions(household.id, setContractions), [store, household.id]);
  useEffect(() => {
    if (!confirmClear) return;
    const t = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmClear]);

  const sorted = sortByStart(contractions);
  const intervals = intervalsSec(sorted);
  const active = [...sorted].reverse().find((c) => c.end == null) ?? null;
  const last = sorted.at(-1) ?? null;
  const hour = statsForWindow(contractions, now, 60 * 60 * 1000);
  const hint = suggestCalling(hour);

  const hospital = household.hospital;
  const nav = hospital?.address || hospital?.name ? navigationLinks(hospital.address || hospital.name) : null;
  const guidanceItem = items.find((i) => i.seedId === 'task.labor-when-to-go');
  const laborTasks = items.filter(
    (i) => i.kind === 'task' && i.phase === 'labor' && i.seedId !== 'task.labor-when-to-go',
  );
  const bag = progressOf(items, 'bag');

  const onTimer = () => {
    if (active) void actions.endContraction(active.id);
    else void actions.startContraction();
  };

  const elapsed = active ? (now - active.start) / 1000 : last ? (now - last.start) / 1000 : 0;

  return (
    <div className="text-night-text">
      <PageTitle>לידה</PageTitle>

      {/* Contraction timer — iOS stopwatch look: big digits, one big round button */}
      <section className="mb-6 text-center" aria-label="טיימר צירים">
        <p className="text-subhead text-night-soft">
          {active ? 'משך הציר' : last ? 'מאז תחילת הציר האחרון' : 'טיימר צירים'}
        </p>
        <p
          className={`text-[4.5rem] leading-[1.1] font-extralight tracking-tight tabular ${active ? 'text-brick' : ''}`}
          dir="ltr"
          aria-hidden
        >
          {formatClock(elapsed)}
        </p>
        <button
          type="button"
          onClick={onTimer}
          aria-live="polite"
          className={`press mx-auto mt-4 flex size-52 flex-col items-center justify-center rounded-full p-[5px] ring-[3px] ring-offset-4 ring-offset-night transition-colors ${
            active ? 'breathe bg-brick/25 text-brick ring-brick/25' : 'bg-leaf/20 text-leaf ring-leaf/20'
          }`}
        >
          <span className="text-title1">{active ? 'הציר נגמר' : 'ציר התחיל'}</span>
          {active ? (
            <span className="mt-1 text-subhead tabular" dir="ltr">
              {formatClock((now - active.start) / 1000)}
            </span>
          ) : (
            <span className="mt-1 text-subhead text-night-soft">
              {last ? 'לחצו בתחילת הציר הבא' : 'לחצו בתחילת כל ציר'}
            </span>
          )}
        </button>
        <p className="mt-5 text-footnote text-night-soft">הטיימר משותף — שניכם רואים אותו בזמן אמת.</p>
      </section>

      <section className="mb-4 grid grid-cols-3 gap-2" aria-label="סיכום השעה האחרונה">
        <Stat label="צירים בשעה האחרונה" value={String(hour.count)} />
        <Stat label="מרווח ממוצע" value={hour.avgIntervalSec != null ? formatClock(hour.avgIntervalSec) : '—'} />
        <Stat label="משך ממוצע" value={hour.avgDurationSec != null ? formatClock(hour.avgDurationSec) : '—'} />
      </section>

      {hint && (
        <p role="status" className="mb-4 rounded-2xl bg-straw/20 px-4 py-3 text-subhead text-straw-ink">
          בשעה האחרונה הצירים תכופים, בערך כל {Math.round((hour.avgIntervalSec ?? 0) / 60)} דקות. זה זמן טוב להתקשר לחדר
          הלידה ולהתייעץ.
        </p>
      )}

      {/* Hospital shortcuts */}
      <section className="mb-7 rounded-[var(--radius-widget)] bg-night-2 p-4">
        {hospital?.name ? (
          <>
            <p className="text-headline">{hospital.name}</p>
            {hospital.address && <p className="text-footnote text-night-soft">{hospital.address}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {hospital.phone ? (
                <a href={telHref(hospital.phone)} className="btn col-span-2 bg-leaf text-on-leaf">
                  <Phone className="size-5" fill="currentColor" strokeWidth={0} aria-hidden /> חיוג לחדר הלידה
                </a>
              ) : (
                <Link to="/settings" className="btn col-span-2 bg-night-3 text-robin">
                  הוספת טלפון חדר לידה
                </Link>
              )}
              {nav && (
                <>
                  <a href={nav.waze} target="_blank" rel="noreferrer" className="btn bg-night-3 text-night-text">
                    <Navigation className="size-4" aria-hidden /> Waze
                  </a>
                  <a href={nav.google} target="_blank" rel="noreferrer" className="btn bg-night-3 text-night-text">
                    <Car className="size-4" aria-hidden /> Google Maps
                  </a>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className="flex-1 text-subhead text-night-soft">
              עוד לא בחרתם בית חולים. הוסיפו אותו כדי לקבל כאן כפתורי חיוג וניווט.
            </p>
            <Link to="/settings" className="btn shrink-0 bg-night-3 text-robin">
              הגדרה
            </Link>
          </div>
        )}
        <a
          href="tel:101"
          className="mt-3 flex min-h-11 items-center justify-center gap-2 text-subhead font-semibold text-brick-ink"
        >
          <Siren className="size-4" aria-hidden /> חירום: מד״א 101
        </a>
        <Link
          to="/warnings"
          className="flex min-h-11 items-center justify-center gap-1 text-subhead text-night-soft underline underline-offset-4"
        >
          סימני אזהרה: מתי לחדר הלידה ומתי ל-101
        </Link>
        <Link
          to="/stages"
          className="flex min-h-11 items-center justify-center gap-1 text-subhead text-night-soft underline underline-offset-4"
        >
          שלבי הלידה והקלה על כאב
        </Link>
        <Link
          to="/breathing"
          className="flex min-h-11 items-center justify-center gap-1 text-subhead text-night-soft underline underline-offset-4"
        >
          תרגיל נשימה
        </Link>
      </section>

      {sorted.length > 0 && (
        <section className="mb-7">
          <div className="mb-2 flex items-center px-4">
            <h2 className="text-title3">צירים אחרונים</h2>
            <button
              type="button"
              className="press ms-auto -me-2 flex min-h-9 items-center gap-1 rounded-full px-2 text-subhead text-brick-ink"
              onClick={() => {
                if (confirmClear) {
                  void actions.clearContractions();
                  setConfirmClear(false);
                } else setConfirmClear(true);
              }}
            >
              <Trash2 className="size-4" aria-hidden /> {confirmClear ? 'ללחוץ שוב למחיקת הכול' : 'ניקוי'}
            </button>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-shelf)] bg-night-2">
            <table className="w-full text-subhead tabular">
              <thead className="text-footnote text-night-soft">
                <tr>
                  <th className="py-2 ps-4 text-start font-normal">התחלה</th>
                  <th className="py-2 text-start font-normal">משך</th>
                  <th className="py-2 text-start font-normal">מרווח</th>
                  <th className="w-11">
                    <span className="sr-only">מחיקה</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted
                  .map((c, i) => ({ c, interval: intervals[i] }))
                  .reverse()
                  .slice(0, 15)
                  .map(({ c, interval }) => (
                    <tr key={c.id} className="border-t-[0.5px] border-night-3">
                      <td className="py-2.5 ps-4 text-start" dir="ltr">
                        {formatTime(c.start)}
                      </td>
                      <td className="py-2.5 text-start" dir="ltr">
                        {c.end == null ? '…' : formatClock(durationSec(c) ?? 0)}
                      </td>
                      <td className="py-2.5 text-start" dir="ltr">
                        {interval != null ? formatClock(interval) : '—'}
                      </td>
                      <td>
                        <button
                          type="button"
                          aria-label="מחיקת הציר"
                          className="flex size-11 items-center justify-center rounded-full text-night-soft"
                          onClick={() => void actions.deleteContraction(c.id)}
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mb-7 rounded-[var(--radius-widget)] bg-night-2 p-4">
        <h2 className="mb-1.5 text-headline">מתי נוסעים?</h2>
        <p className="text-subhead leading-relaxed text-night-text/90">{guidanceItem?.notes || FALLBACK_GUIDANCE}</p>
        <p className="mt-2 text-footnote text-night-soft">
          מקור:{' '}
          <a
            href={guidanceItem?.source || SRC.maccabiPregnancyEr}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            {hostOf(guidanceItem?.source || SRC.maccabiPregnancyEr)}
          </a>
          . ההנחיות של בית החולים והצוות קודמות.
        </p>
      </section>

      {laborTasks.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-2 px-4 text-title3">לפני שיוצאים</h2>
          <ul className="overflow-hidden rounded-[var(--radius-shelf)] bg-night-2 [--color-line:var(--color-night-3)] [--sep-inset:3.25rem] ios-list">
            {laborTasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3 ps-4 pe-3">
                <div className="pt-[11px]">
                  <CheckCircle
                    tone="night"
                    checked={t.done}
                    onToggle={() => void actions.toggleDone(t)}
                    label={`בוצע: ${t.title}`}
                  />
                </div>
                <div className="min-w-0 flex-1 py-[11px]">
                  <p className={t.done ? 'text-night-soft' : ''}>{t.title}</p>
                  {t.notes && !t.done && <p className="mt-0.5 text-footnote text-night-soft">{t.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        to="/gear?tab=bag"
        className="press mb-4 flex min-h-11 items-center gap-2 rounded-[var(--radius-shelf)] bg-night-2 px-4 py-3"
      >
        <span className="text-body">תיק לידה</span>
        <span className="ms-auto text-subhead text-night-soft tabular">
          {bag.done} מתוך {bag.total} ארוזים
        </span>
        <Chevron />
      </Link>

      {!household.birthDate && (
        <button type="button" className="btn mb-2 w-full bg-night-2 text-leaf" onClick={() => setBornOpen(true)}>
          <Baby className="size-5" aria-hidden /> התינוק/ת נולד/ה!
        </button>
      )}
      <BabyBornSheet open={bornOpen} onClose={() => setBornOpen(false)} />
    </div>
  );
}
