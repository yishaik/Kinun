/**
 * Labor mode — a calm dark screen for the night of the birth:
 * one big contraction button (shared live between both phones), call/navigate shortcuts,
 * the "when to go" guidance, and the short labor checklist.
 */
import { Baby, Car, Navigation, Phone, Siren, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from '../components/ui';
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
      <div className="font-display text-2xl leading-tight" dir="ltr">
        {value}
      </div>
      <div className="text-[13px] text-night-text/70">{label}</div>
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

  return (
    <div className="text-night-text">
      <h1 className="mb-4 font-display text-3xl">לידה</h1>

      {/* Hospital shortcuts */}
      <section className="mb-6 rounded-[var(--radius-shelf)] bg-night-2 p-4">
        {hospital?.name ? (
          <>
            <p className="font-display text-xl">{hospital.name}</p>
            {hospital.address && <p className="text-sm text-night-text/70">{hospital.address}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {hospital.phone ? (
                <a href={telHref(hospital.phone)} className="btn col-span-2 bg-straw text-twig">
                  <Phone className="size-5" aria-hidden /> חיוג לחדר הלידה
                </a>
              ) : (
                <Link to="/settings" className="btn col-span-2 border border-night-text/30">
                  הוספת טלפון חדר לידה
                </Link>
              )}
              {nav && (
                <>
                  <a href={nav.waze} target="_blank" rel="noreferrer" className="btn border border-night-text/30">
                    <Navigation className="size-4" aria-hidden /> Waze
                  </a>
                  <a href={nav.google} target="_blank" rel="noreferrer" className="btn border border-night-text/30">
                    <Car className="size-4" aria-hidden /> Google Maps
                  </a>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className="flex-1 text-night-text/80">
              עוד לא בחרתם בית חולים. הוסיפו אותו כדי לקבל כאן כפתורי חיוג וניווט.
            </p>
            <Link to="/settings" className="btn shrink-0 bg-straw text-twig">
              הגדרה
            </Link>
          </div>
        )}
        <a
          href="tel:101"
          className="mt-3 flex items-center justify-center gap-2 text-[15px] font-semibold text-night-text/80"
        >
          <Siren className="size-4" aria-hidden /> חירום: מד״א 101
        </a>
      </section>

      {/* Contraction timer */}
      <section className="mb-6 text-center" aria-label="טיימר צירים">
        <button
          type="button"
          onClick={onTimer}
          aria-live="polite"
          className={`mx-auto flex size-56 flex-col items-center justify-center rounded-full text-center shadow-xl transition-colors ${
            active ? 'breathe bg-brick text-white' : 'bg-straw text-twig'
          }`}
        >
          <span className="font-display text-2xl">{active ? 'הציר נגמר' : 'ציר התחיל'}</span>
          {active ? (
            <span className="mt-1 font-display text-4xl" dir="ltr">
              {formatClock((now - active.start) / 1000)}
            </span>
          ) : last ? (
            <span className="mt-1 text-[15px]">
              מאז הציר האחרון{' '}
              <span dir="ltr" className="font-semibold">
                {formatClock((now - last.start) / 1000)}
              </span>
            </span>
          ) : (
            <span className="mt-1 text-[15px]">לחצו בתחילת כל ציר</span>
          )}
        </button>
        <p className="mt-3 text-sm text-night-text/60">הטיימר משותף — שניכם רואים אותו בזמן אמת.</p>
      </section>

      <section className="mb-4 grid grid-cols-3 gap-2" aria-label="סיכום השעה האחרונה">
        <Stat label="צירים בשעה האחרונה" value={String(hour.count)} />
        <Stat label="מרווח ממוצע" value={hour.avgIntervalSec != null ? formatClock(hour.avgIntervalSec) : '—'} />
        <Stat label="משך ממוצע" value={hour.avgDurationSec != null ? formatClock(hour.avgDurationSec) : '—'} />
      </section>

      {hint && (
        <p role="status" className="mb-4 rounded-2xl bg-straw-soft px-4 py-3 text-twig">
          בשעה האחרונה הצירים תכופים, בערך כל {Math.round((hour.avgIntervalSec ?? 0) / 60)} דקות. זה זמן טוב להתקשר לחדר
          הלידה ולהתייעץ.
        </p>
      )}

      {sorted.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center">
            <h2 className="font-display text-xl">צירים אחרונים</h2>
            <button
              type="button"
              className="ms-auto flex items-center gap-1 rounded-full px-3 py-2 text-sm text-night-text/80 hover:bg-night-2"
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
          <table className="w-full text-[15px]">
            <thead className="text-night-text/60">
              <tr>
                <th className="py-1 text-start font-normal">התחלה</th>
                <th className="py-1 text-start font-normal">משך</th>
                <th className="py-1 text-start font-normal">מרווח</th>
                <th className="w-8">
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
                  <tr key={c.id} className="border-t border-night-2">
                    <td className="py-2" dir="ltr">
                      {formatTime(c.start)}
                    </td>
                    <td className="py-2" dir="ltr">
                      {c.end == null ? '…' : formatClock(durationSec(c) ?? 0)}
                    </td>
                    <td className="py-2" dir="ltr">
                      {interval != null ? formatClock(interval) : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        aria-label="מחיקת הציר"
                        className="rounded-full p-1.5 text-night-text/50 hover:bg-night-2"
                        onClick={() => void actions.deleteContraction(c.id)}
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mb-6 rounded-[var(--radius-shelf)] bg-night-2 p-4">
        <h2 className="mb-2 font-display text-xl">מתי נוסעים?</h2>
        <p className="leading-relaxed">{guidanceItem?.notes || FALLBACK_GUIDANCE}</p>
        <p className="mt-2 text-sm text-night-text/60">
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
        <section className="mb-6">
          <h2 className="mb-2 font-display text-xl">לפני שיוצאים</h2>
          <ul className="divide-y divide-night rounded-[var(--radius-shelf)] bg-night-2">
            {laborTasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                <div className="pt-0.5">
                  <CheckCircle
                    tone="night"
                    checked={t.done}
                    onToggle={() => void actions.toggleDone(t)}
                    label={`בוצע: ${t.title}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={t.done ? 'text-night-text/50 line-through' : ''}>{t.title}</p>
                  {t.notes && !t.done && <p className="mt-0.5 text-sm text-night-text/70">{t.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/gear?tab=bag" className="mb-4 flex items-center rounded-[var(--radius-shelf)] bg-night-2 px-4 py-3">
        <span className="font-semibold">תיק לידה</span>
        <span className="ms-auto text-night-text/70">
          {bag.done} מתוך {bag.total} ארוזים
        </span>
      </Link>

      {!household.birthDate && (
        <button type="button" className="btn mb-2 w-full border border-night-text/30" onClick={() => setBornOpen(true)}>
          <Baby className="size-5" aria-hidden /> התינוק/ת נולד/ה!
        </button>
      )}
      <BabyBornSheet open={bornOpen} onClose={() => setBornOpen(false)} />
    </div>
  );
}
