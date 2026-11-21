import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useItemSheet } from '../components/ItemSheet';
import { LinkRow } from '../components/rows';
import { EmptyState, Fab, PageTitle, Section } from '../components/ui';
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
      <PageTitle>קישורים וטלפונים</PageTitle>
      <label className="relative mb-5 block">
        <span className="sr-only">חיפוש</span>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-twig-soft"
          aria-hidden
        />
        <input
          type="search"
          className="field ps-10"
          placeholder="חיפוש: דמי לידה, טיפת חלב, סלקל…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {groups.map(({ cat, rows }) => (
        <Section key={cat} title={categoryLabel('link', cat)}>
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
