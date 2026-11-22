/** Printable birth plan: a clean A4 document of the answered fields (print CSS hides the app chrome). */
import { Pencil, Printer } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '../components/ui';
import { useHousehold } from '../data/session';
import { printableSections } from '../lib/birthPlan';
import { formatIsoDate } from '../lib/format';
import { useBirthPlan } from './BirthPlanPage';

export function BirthPlanPrintPage() {
  const household = useHousehold();
  const { answers, loaded } = useBirthPlan();
  const sections = printableSections(answers);
  const name = answers.fullName?.trim();

  return (
    <>
      <div className="mb-4 grid grid-cols-[1fr_auto] gap-3 print:hidden">
        <button
          type="button"
          className="btn-primary min-w-0"
          onClick={() => window.print()}
          disabled={!sections.length}
        >
          <Printer className="size-5" aria-hidden /> הדפסה / שמירה כ-PDF
        </button>
        <Link to="/birth-plan" className="btn-outline">
          <Pencil className="size-4" aria-hidden /> עריכה
        </Link>
      </div>

      {loaded && sections.length === 0 ? (
        <EmptyState title="התוכנית עוד ריקה" body="מלאו כמה העדפות ואז חזרו לכאן להדפסה." />
      ) : (
        <article className="print-sheet widget p-5 text-twig print:rounded-none print:bg-transparent print:p-0 print:shadow-none">
          <header className="mb-4 border-b border-line pb-3">
            <h1 className="text-title1">תוכנית לידה{name ? ` — ${name}` : ''}</h1>
            <p className="mt-1 text-subhead text-twig-soft">
              {[
                answers.idNumber?.trim() && `ת״ז ${answers.idNumber.trim()}`,
                household.dueDate && `תאריך לידה משוער: ${formatIsoDate(household.dueDate)}`,
                household.hospital?.name && `בית חולים: ${household.hospital.name}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </header>
          {sections
            .map((s) =>
              s.id === 'intro' ? { ...s, rows: s.rows.filter((r) => !['fullName', 'idNumber'].includes(r.id)) } : s,
            )
            .filter((s) => s.rows.length)
            .map((s) => (
              <section key={s.id} className="mb-4">
                <h2 className="mb-1 text-headline">{s.title}</h2>
                <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 gap-y-1 text-subhead">
                  {s.rows.map((r) => (
                    <div key={r.id} className="contents">
                      <dt className="text-twig-soft">{r.label}</dt>
                      <dd className="whitespace-pre-line">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          <p className="mt-6 border-t border-line pt-3 text-footnote text-twig-soft">
            אלה ההעדפות שלי. אני יודעת שהלידה יכולה להתפתח אחרת, ואשמח שתפעלו ברוחן ככל האפשר. תודה!
          </p>
        </article>
      )}
    </>
  );
}
