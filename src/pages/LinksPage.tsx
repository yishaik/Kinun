import { useMemo, useState } from 'react';
import { useItemSheet } from '../components/ItemSheet';
import { LinkRow } from '../components/rows';
import { EmptyState, Fab, PageTitle, SearchField, Section } from '../components/ui';
import { useSession } from '../data/session';
import { categoryLabel, orderedCategories } from '../lib/labels';

export function LinksPage() {
  const { items } = useSession();
  const { openItem, openNew, sheet } = useItemSheet();
  const [q, setQ] = useState('');

  const links = useMemo(() => items.filter((i) => i.kind === 'link'), [items]);
  const filtered = useMemo(() => {
    const term = q.trim();
    if (!term) return links;
    return links.filter((i) => `${i.title} ${i.notes} ${i.url ?? ''} ${i.phone ?? ''}`.includes(term));
  }, [links, q]);

  const groups = orderedCategories(
    'link',
    filtered.map((i) => i.category),
  ).map((cat) => ({
    cat,
    rows: filtered.filter((i) => i.category === cat).sort((a, b) => a.order - b.order),
  }));

  return (
    <>
      <PageTitle>קישורים</PageTitle>
      <div className="mb-6">
        <SearchField value={q} onChange={setQ} placeholder="חיפוש: דמי לידה, טיפת חלב, סלקל…" />
      </div>

      {groups.map(({ cat, rows }) => (
        <Section key={cat} title={categoryLabel('link', cat)} inset="1rem">
          {rows.map((i) => (
            <LinkRow key={i.id} item={i} onOpen={openItem} />
          ))}
        </Section>
      ))}

      {groups.length === 0 && (
        <EmptyState
          title={links.length ? 'לא נמצא קישור מתאים' : 'עוד אין קישורים'}
          body={links.length ? 'נסו מילה אחרת.' : undefined}
        />
      )}

      <Fab label="הוספת קישור או טלפון" onClick={() => openNew({ kind: 'link', category: 'support' })} />
      {sheet}
    </>
  );
}
