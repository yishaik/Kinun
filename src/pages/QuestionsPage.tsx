/** "שאלות לרופא" — a shared list of questions for the next visit; mark as asked and note the answer. */
import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { SourceLink } from '../components/info';
import { CheckCircle, EmptyState, PageTitle, Section } from '../components/ui';
import { SUGGESTED_QUESTIONS } from '../content/questions';
import { useActions, useRecords } from '../data/session';
import type { HouseholdRecord } from '../lib/types';

export function QuestionsPage() {
  const actions = useActions();
  const { records, loaded } = useRecords('question');
  const [text, setText] = useState('');
  const open = records.filter((r) => !r.done).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const asked = records.filter((r) => r.done).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  const have = new Set(records.map((r) => r.text));
  const suggestions = SUGGESTED_QUESTIONS.filter((s) => !have.has(s.text));

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    actions.addRecord({ kind: 'question', text: t });
    setText('');
  };

  return (
    <>
      <PageTitle>שאלות לרופא</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        רשימה משותפת לביקור הבא — אצל הרופא/ה, האחות או בסיור בחדר הלידה.
      </p>
      <form onSubmit={add} className="mb-6 flex gap-2">
        <label htmlFor="new-question" className="sr-only">
          שאלה חדשה
        </label>
        <input
          id="new-question"
          className="field min-w-0 flex-1"
          placeholder="מה רצינו לשאול?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="btn-primary shrink-0 px-4" disabled={!text.trim()}>
          <Plus className="size-5" aria-hidden /> הוספה
        </button>
      </form>

      {loaded && records.length === 0 && (
        <EmptyState title="עוד אין שאלות" body="כתבו כאן כל שאלה שעולה, ותגיעו לביקור מוכנים." />
      )}

      {open.length > 0 && (
        <Section title={`לשאול (${open.length})`} collapsible={false} inset="3.25rem">
          {open.map((q) => (
            <QuestionRow key={q.id} q={q} />
          ))}
        </Section>
      )}
      {asked.length > 0 && (
        <Section title="נשאלו" collapsible={false} inset="3.25rem">
          {asked.map((q) => (
            <QuestionRow key={q.id} q={q} />
          ))}
        </Section>
      )}

      {suggestions.length > 0 && (
        <section className="mb-7" aria-labelledby="q-suggest">
          <h2 id="q-suggest" className="px-4 pb-2 text-title3">
            רעיונות לשאלות
          </h2>
          <ul className="shelf ios-list overflow-hidden" style={{ ['--sep-inset' as string]: '1rem' }}>
            {suggestions.map((s) => (
              <li key={s.text} className="flex items-start gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-body">{s.text}</span>
                  <SourceLink url={s.source} />
                </span>
                <button
                  type="button"
                  className="btn-outline min-h-9 shrink-0 px-3 text-footnote"
                  onClick={() => actions.addRecord({ kind: 'question', text: s.text })}
                  aria-label={`הוספה לרשימה: ${s.text}`}
                >
                  <Plus className="size-4" aria-hidden /> הוספה
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function QuestionRow({ q }: { q: HouseholdRecord }) {
  const actions = useActions();
  const [answer, setAnswer] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const id = `answer-${q.id}`;
  return (
    <div className="flex items-start gap-3 ps-4 pe-2 py-3">
      <span className="pt-0.5">
        <CheckCircle
          checked={q.done}
          onToggle={() => actions.updateRecord(q.id, { done: !q.done })}
          label={q.done ? `סימון כלא נשאלה: ${q.text}` : `סימון כנשאלה: ${q.text}`}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-body leading-snug ${q.done ? 'text-twig-soft' : ''}`}>{q.text}</p>
        {(q.done || q.note) && (
          <>
            <label htmlFor={id} className="sr-only">
              התשובה
            </label>
            <textarea
              id={id}
              rows={answer != null || q.note ? 2 : 1}
              className="field mt-2 w-full text-subhead"
              placeholder="מה ענו לנו?"
              value={answer ?? q.note}
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={() => {
                if (answer != null && answer.trim() !== q.note) actions.updateRecord(q.id, { note: answer.trim() });
                setAnswer(null);
              }}
              maxLength={2000}
            />
          </>
        )}
      </div>
      {confirm ? (
        <button
          type="button"
          className="btn-danger min-h-9 shrink-0 px-3 text-footnote"
          onClick={() => actions.deleteRecord(q.id)}
          onBlur={() => setConfirm(false)}
        >
          מחיקה
        </button>
      ) : (
        <button
          type="button"
          className="press flex size-11 shrink-0 items-center justify-center text-twig-soft"
          aria-label={`מחיקת השאלה: ${q.text}`}
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
