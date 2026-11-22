/** "שלבי הלידה" — stage by stage, with the pain-relief options. */
import { MedicalNote, SourceLink } from '../components/info';
import { PageTitle } from '../components/ui';
import { LABOR_STAGES, PAIN_RELIEF } from '../content/laborStages';
import { SRC } from '../content/sources';
import { Link } from 'react-router';

export function LaborStagesPage() {
  return (
    <>
      <PageTitle>שלבי הלידה</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        כל לידה שונה ואי אפשר לדעת מראש כמה זמן תימשך. זה מה שקורה בדרך כלל בכל שלב.{' '}
        <Link to="/glossary" className="text-robin underline underline-offset-4">
          מילון מונחים
        </Link>
      </p>

      <ol className="mb-4 space-y-3" aria-label="שלבי הלידה">
        {LABOR_STAGES.map((s, i) => (
          <li key={s.id} className="widget p-4" aria-labelledby={`stage-${s.id}`}>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="tabular flex size-8 shrink-0 items-center justify-center rounded-full bg-leaf text-callout font-semibold text-on-leaf"
              >
                {i}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={`stage-${s.id}`} className="text-headline">
                  {s.title}
                </h2>
                <p className="text-footnote font-semibold text-leaf-ink">{s.range}</p>
                <p className="mt-2 text-subhead text-twig">{s.what}</p>
                {s.feel && (
                  <p className="mt-2 text-subhead text-twig">
                    <span className="font-semibold">מה מרגישים: </span>
                    {s.feel}
                  </p>
                )}
                {s.helps && (
                  <p className="mt-2 text-subhead text-twig">
                    <span className="font-semibold">מה עוזר: </span>
                    {s.helps}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mb-7 px-1">
        <SourceLink url={SRC.mohLaborStages} />
      </p>

      <h2 className="mb-1 px-1 text-title2">הקלה על כאב</h2>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        אפשר לשלב כמה אמצעים. מה זמין משתנה בין בתי החולים — כדאי לשאול בסיור.
      </p>
      {PAIN_RELIEF.map((g) => (
        <section key={g.id} className="mb-6" aria-labelledby={`pain-${g.id}`}>
          <h3 id={`pain-${g.id}`} className="px-4 pb-2 text-title3">
            {g.title}
          </h3>
          <ul className="shelf ios-list overflow-hidden" style={{ ['--sep-inset' as string]: '1rem' }}>
            {g.options.map((o) => (
              <li key={o.name} className="px-4 py-3">
                <p className="text-body font-semibold leading-snug">{o.name}</p>
                <p className="mt-1 text-subhead text-twig">{o.what}</p>
                {o.note && <p className="mt-1 text-subhead text-twig-soft">{o.note}</p>}
              </li>
            ))}
          </ul>
          <div className="list-footer">
            <SourceLink url={g.source} />
          </div>
        </section>
      ))}
      <MedicalNote />
    </>
  );
}
