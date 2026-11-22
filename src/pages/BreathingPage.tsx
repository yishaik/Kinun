/** "תרגילי נשימה" — a visual pacer: in, hold, and a long slow breath out. */
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { MedicalNote, SourceLink } from '../components/info';
import { PageTitle, Segmented } from '../components/ui';
import { SRC } from '../content/sources';
import { PACES, PHASE_LABEL, paceLabel, phaseAt, type BreathPhase } from '../lib/breathing';
import { useNow } from '../lib/hooks';

const SCALE: Record<BreathPhase, number> = { in: 1, hold: 1, out: 0.55 };

export function BreathingPage() {
  const [paceId, setPaceId] = useState(PACES[0].id);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useNow(200);
  const pace = PACES.find((p) => p.id === paceId) ?? PACES[0];
  const state = startedAt == null ? null : phaseAt(now - startedAt, pace);
  const phase = state?.phase ?? 'out';
  const seconds = phase === 'in' ? pace.inSec : phase === 'hold' ? pace.holdSec : pace.outSec;

  return (
    <>
      <PageTitle>תרגילי נשימה</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        שאיפה טובה שממלאת את הריאות, החזקה לכמה שניות, ונשיפה איטית וארוכה — כמו דרך קשית. כדאי לתרגל עוד בהריון, ובלידה
        לנשום כך בין הצירים.
      </p>
      <p className="mb-5 px-1">
        <SourceLink url={SRC.mohPainRelief} />
      </p>

      <section className="widget mb-6 flex flex-col items-center p-6" aria-label="תרגיל נשימה">
        <div className="relative flex size-64 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 scale-[var(--s)] rounded-full bg-lagoon/25 transition-transform ease-in-out motion-reduce:scale-100 motion-reduce:transition-none"
            style={{
              ['--s' as string]: state ? SCALE[phase] : 0.55,
              transitionDuration: state ? `${seconds}s` : '0.3s',
            }}
          />
          <span
            aria-hidden
            className="absolute inset-8 scale-[var(--s)] rounded-full bg-lagoon/40 transition-transform ease-in-out motion-reduce:scale-100 motion-reduce:transition-none"
            style={{
              ['--s' as string]: state ? SCALE[phase] : 0.55,
              transitionDuration: state ? `${seconds}s` : '0.3s',
            }}
          />
          <span className="relative text-center" aria-live="polite" aria-atomic>
            <span className="block text-title2">{state ? PHASE_LABEL[phase] : 'מוכנים?'}</span>
            {state && <span className="tabular block text-title1 font-bold">{state.secondsLeft}</span>}
          </span>
        </div>
        {state && <p className="tabular mt-2 text-footnote text-twig-soft">{state.cycles} נשימות מלאות</p>}

        <div className="mt-5 w-full">
          <Segmented
            label="קצב (שניות: שאיפה·החזקה·נשיפה)"
            value={paceId}
            onChange={(v) => {
              setPaceId(v);
              if (startedAt != null) setStartedAt(Date.now());
            }}
            options={PACES.map((p) => ({ value: p.id, label: paceLabel(p) }))}
          />
          <p className="mt-1 text-center text-caption text-twig-soft">
            קצב (שניות): שאיפה · החזקה · נשיפה. בחרו מה שנוח.
          </p>
        </div>

        <button
          type="button"
          className={`${startedAt == null ? 'btn-primary' : 'btn-outline'} mt-5 w-full`}
          onClick={() => setStartedAt(startedAt == null ? Date.now() : null)}
        >
          {startedAt == null ? (
            <>
              <Play className="size-5" aria-hidden /> התחלה
            </>
          ) : (
            <>
              <Pause className="size-5" aria-hidden /> עצירה
            </>
          )}
        </button>
      </section>
      <MedicalNote />
    </>
  );
}
