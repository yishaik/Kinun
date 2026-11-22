/** "מילון מונחים" — searchable glossary of words you'll hear in the delivery room. */
import { useMemo, useState } from 'react';
import { MedicalNote, SourceLink } from '../components/info';
import { EmptyState, PageTitle, SearchField } from '../components/ui';
import { GLOSSARY } from '../content/glossary';
import { filterGlossary } from '../lib/glossary';

export function GlossaryPage() {
  const [q, setQ] = useState('');
  const terms = useMemo(() => filterGlossary(GLOSSARY, q), [q]);
  return (
    <>
      <PageTitle>מילון מונחים</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">מילים ששומעים בחדר הלידה, בשפה פשוטה.</p>
      <div className="mb-6">
        <SearchField value={q} onChange={setQ} placeholder="חיפוש: פתיחה, אפידורל, פקק רירי…" />
      </div>

      {terms.length > 0 ? (
        <dl className="shelf ios-list mb-6 overflow-hidden" style={{ ['--sep-inset' as string]: '1rem' }}>
          {terms.map((t) => (
            <div key={t.term} className="px-4 py-3">
              <dt className="text-body font-semibold leading-snug">
                {t.term}
                {t.aka && <span className="ms-2 text-footnote font-normal text-twig-soft">({t.aka})</span>}
              </dt>
              <dd className="mt-1">
                <p className="text-subhead text-twig">{t.definition}</p>
                <SourceLink url={t.source} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <EmptyState title="לא נמצא מונח מתאים" body="נסו מילה אחרת." />
      )}
      <MedicalNote />
    </>
  );
}
