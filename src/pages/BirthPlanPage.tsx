/** "תוכנית לידה" — a shared form (both partners can fill it) that turns into a printable page. */
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { SourceLink } from '../components/info';
import { PageTitle } from '../components/ui';
import { BIRTH_PLAN, BIRTH_PLAN_ID, BIRTH_PLAN_SOURCE, MULTI_SEPARATOR, type PlanField } from '../content/birthPlan';
import { useActions, useRecords } from '../data/session';
import { answeredCount, toggleMulti } from '../lib/birthPlan';

export function useBirthPlan() {
  const { records, loaded } = useRecords('birthPlan');
  const plan = records.find((r) => r.id === BIRTH_PLAN_ID) ?? null;
  return { plan, answers: plan?.answers ?? {}, loaded };
}

export function BirthPlanPage() {
  const actions = useActions();
  const { plan, answers, loaded } = useBirthPlan();
  const total = BIRTH_PLAN.reduce((n, s) => n + s.fields.length, 0);

  const save = (id: string, value: string) => {
    if ((answers[id] ?? '') === value) return;
    const next = { ...answers, [id]: value };
    if (!value) delete next[id];
    if (plan) actions.updateRecord(plan.id, { answers: next });
    else actions.addRecord({ kind: 'birthPlan', answers: next }, BIRTH_PLAN_ID);
  };

  return (
    <>
      <PageTitle>תוכנית לידה</PageTitle>
      <p className="mb-2 px-1 text-subhead text-twig-soft">
        ההעדפות שלכם לפי שלבי הלידה, במבנה שמשרד הבריאות מציע. כל מה שתמלאו נשמר ומשותף לשניכם; מה שנשאר ריק לא יודפס.
      </p>
      <p className="mb-4 px-1">
        <SourceLink url={BIRTH_PLAN_SOURCE} />
      </p>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/birth-plan/print" className="btn-primary flex-1">
          <Printer className="size-5" aria-hidden /> תצוגה להדפסה
        </Link>
        <span className="tabular text-footnote text-twig-soft">
          {answeredCount(answers)}/{total} מולאו
        </span>
      </div>

      {loaded &&
        BIRTH_PLAN.map((section) => (
          <section key={section.id} className="mb-7" aria-labelledby={`plan-${section.id}`}>
            <h2 id={`plan-${section.id}`} className="px-4 pb-1 text-title3">
              {section.title}
            </h2>
            {section.intro && <p className="px-4 pb-2 text-footnote text-twig-soft">{section.intro}</p>}
            <div className="shelf ios-list overflow-hidden" style={{ ['--sep-inset' as string]: '1rem' }}>
              {section.fields.map((f) => (
                <PlanFieldRow key={f.id} field={f} value={answers[f.id] ?? ''} onSave={(v) => save(f.id, v)} />
              ))}
            </div>
          </section>
        ))}
      <p className="list-footer mb-6">
        לפעמים הלידה מתפתחת אחרת מהתוכנית. הצוות יפעל ברוח הרצונות שלכם ככל האפשר — המטרה היא לידה בטוחה.
      </p>
    </>
  );
}

function PlanFieldRow({ field, value, onSave }: { field: PlanField; value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = `f-${field.id}`;
  const hint = field.hint && (
    <p id={`${id}-hint`} className="mt-0.5 text-footnote text-twig-soft">
      {field.hint}
    </p>
  );
  if (field.type === 'text' || field.type === 'textarea') {
    const common = {
      id,
      value: draft ?? value,
      onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
      onBlur: () => {
        if (draft != null) onSave(draft.trim());
        setDraft(null);
      },
      'aria-describedby': field.hint ? `${id}-hint` : undefined,
      className: 'field mt-2 w-full',
    };
    return (
      <div className="px-4 py-3">
        <label htmlFor={id} className="text-body font-semibold">
          {field.label}
        </label>
        {hint}
        {field.type === 'text' ? <input type="text" {...common} /> : <textarea rows={3} {...common} />}
      </div>
    );
  }
  const choice = field as Extract<PlanField, { options: string[] }>;
  const selected = choice.type === 'multi' ? value.split(MULTI_SEPARATOR).filter(Boolean) : [value];
  return (
    <fieldset className="px-4 py-3" aria-describedby={field.hint ? `${id}-hint` : undefined}>
      <legend className="text-body font-semibold">{field.label}</legend>
      {hint}
      <div className="mt-2 flex flex-wrap gap-2">
        {choice.options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onSave(choice.type === 'multi' ? toggleMulti(value, o, choice.options) : on ? '' : o)}
              className={`press min-h-9 rounded-full border px-3 text-subhead ${
                on ? 'border-robin bg-robin text-on-robin' : 'border-line bg-paper text-twig'
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
