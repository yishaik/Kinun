/** "מונה תנועות" — count baby movements up to 10, shared live between both phones, with history. */
import { Footprints, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MedicalNote, SourceLink } from '../components/info';
import { PageTitle, Section } from '../components/ui';
import { SRC } from '../content/sources';
import { useActions, useHousehold, useRecords } from '../data/session';
import { formatClock } from '../lib/contractions';
import { formatTime, telHref } from '../lib/format';
import { useNow } from '../lib/hooks';
import { activeKickSession, KICK_GOAL, kickStatus, MET_30, pastKickSessions, reachesMet30 } from '../lib/kicks';
import type { KickStatus } from '../lib/kicks';
import type { HouseholdRecord } from '../lib/types';

const dayFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });

const STATUS_TEXT: Record<KickStatus, { text: string; tone: string } | null> = {
  counting: null,
  reassuring: { text: 'יש 3 תנועות ומעלה בחצי שעה, או 6 בשעה — זה הטווח שמצופה.', tone: 'bg-leaf-soft text-leaf-ink' },
  goal: { text: `הגעתם ל-${KICK_GOAL} תנועות. אפשר לסיים.`, tone: 'bg-leaf-soft text-leaf-ink' },
  continue: {
    text: 'פחות מ-3 תנועות בחצי השעה הראשונה: ממשיכים לספור עוד 30 דקות.',
    tone: 'bg-straw-soft text-straw-ink',
  },
  urgent: {
    text: 'פחות מ-6 תנועות בשעה — פונים מיד למיון יולדות.',
    tone: 'bg-brick-soft text-brick-ink',
  },
};

export function KicksPage() {
  const household = useHousehold();
  const actions = useActions();
  const { records } = useRecords('kick');
  const now = useNow(1000);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const active = activeKickSession(records);
  const past = pastKickSessions(records);

  const start = () => actions.addRecord({ kind: 'kick', start: Date.now(), end: null, count: 0 });
  const tap = (s: HouseholdRecord) => {
    const count = (s.count ?? 0) + 1;
    const elapsed = Date.now() - (s.start ?? Date.now());
    const patch: Parameters<typeof actions.updateRecord>[1] = { count };
    if (s.tag !== MET_30 && reachesMet30(count, elapsed)) patch.tag = MET_30;
    if (count >= KICK_GOAL) patch.end = Date.now();
    actions.updateRecord(s.id, patch);
  };
  const finish = (s: HouseholdRecord) => actions.updateRecord(s.id, { end: Date.now() });

  const elapsed = active ? Math.max(0, now - (active.start ?? now)) : 0;
  const status = active ? kickStatus(active.count ?? 0, elapsed, active.tag === MET_30) : null;
  const hint = status ? STATUS_TEXT[status] : null;

  return (
    <>
      <PageTitle>מונה תנועות</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        בשכיבה על צד שמאל, אחרי ארוחה קלה. כל תנועה — לחיצה אחת. סופרים עד {KICK_GOAL}.
      </p>

      <section className="widget mb-6 p-5 text-center" aria-label="ספירה">
        {active ? (
          <>
            <p className="tabular text-footnote text-twig-soft">
              התחיל ב-{formatTime(active.start ?? now)} ·{' '}
              <span aria-label="זמן שעבר">{formatClock(elapsed / 1000)}</span>
            </p>
            <p className="tabular my-2 text-[4rem] leading-none font-bold" aria-live="polite">
              {active.count ?? 0}
              <span className="text-title2 font-semibold text-twig-soft"> / {KICK_GOAL}</span>
            </p>
            <button
              type="button"
              onClick={() => tap(active)}
              className="btn-primary mx-auto my-3 size-40 rounded-full text-title2"
              aria-label={`תנועה. נספרו ${active.count ?? 0}`}
            >
              <Footprints className="size-8" aria-hidden />
              תנועה
            </button>
            {hint && (
              <p className={`mt-2 rounded-xl px-3 py-2 text-subhead font-semibold ${hint.tone}`} role="status">
                {hint.text}
              </p>
            )}
            {status === 'urgent' && household.hospital?.phone && (
              <a href={telHref(household.hospital.phone)} className="btn-danger mt-3 w-full">
                <Phone className="size-5" aria-hidden /> חיוג לחדר הלידה
              </a>
            )}
            <button type="button" onClick={() => finish(active)} className="btn-quiet mt-3 w-full">
              סיום הספירה
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-body text-twig">מוכנים? מתחילים, ולוחצים על כל תנועה.</p>
            <button type="button" onClick={start} className="btn-primary w-full">
              <Footprints className="size-5" aria-hidden /> התחלת ספירה
            </button>
          </>
        )}
      </section>

      <section className="mb-7 rounded-2xl bg-fill px-4 py-3">
        <h2 className="text-headline">מה מצופה</h2>
        <p className="mt-1 text-subhead text-twig">
          בחצי שעה מצופות 3–5 תנועות. פחות מ-3? ממשיכים עוד 30 דקות. אם אין 6 תנועות בשעה — פונים מיד למיון יולדות.
          ירידה בתנועות, שינוי בדפוס שלהן או בכלל לא מרגישים — פונים, גם בלי לספור.
        </p>
        <SourceLink url={SRC.mohObstetricEr} />
      </section>

      {past.length > 0 && (
        <Section title="ספירות קודמות" collapsible={false} inset="1rem">
          {past.map((s) => {
            const mins = Math.max(1, Math.round(((s.end ?? 0) - (s.start ?? 0)) / 60_000));
            return (
              <div key={s.id} className="flex min-h-11 items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-body">
                    {s.count ?? 0} תנועות ב-{mins} דק׳
                  </span>
                  <span className="block text-footnote text-twig-soft">
                    {dayFmt.format(new Date(s.start ?? 0))} · {formatTime(s.start ?? 0)}
                  </span>
                </span>
                {confirmId === s.id ? (
                  <button
                    type="button"
                    className="btn-danger min-h-9 px-3 text-footnote"
                    onClick={() => {
                      actions.deleteRecord(s.id);
                      setConfirmId(null);
                    }}
                  >
                    מחיקה
                  </button>
                ) : (
                  <button
                    type="button"
                    className="press flex size-11 items-center justify-center text-twig-soft"
                    aria-label="מחיקת הספירה"
                    onClick={() => setConfirmId(s.id)}
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                )}
              </div>
            );
          })}
        </Section>
      )}
      <MedicalNote />
    </>
  );
}
