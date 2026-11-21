/** List rows for each item kind (iOS inset-grouped cells). Rows are buttons that open the item sheet. */
import { ArrowUpLeft, Phone } from 'lucide-react';
import { useActions } from '../data/session';
import { hostOf, telHref } from '../lib/format';
import type { MemberEntry } from '../lib/hooks';
import type { Household, Item } from '../lib/types';
import { ItemMetaLine } from './itemMeta';
import { CheckCircle, Chevron } from './ui';

interface RowProps {
  item: Item;
  household: Household;
  members: MemberEntry[];
  onOpen: (item: Item) => void;
}

/** Task, gear and bag rows share a layout: check circle + title + meta line + chevron. */
export function CheckRow({ item, household, members, onOpen }: RowProps) {
  const actions = useActions();
  const checkLabel =
    item.kind === 'gear' ? (item.done ? 'סמן שעוד צריך' : 'סמן שיש') : item.kind === 'bag' ? 'ארוז' : 'בוצע';
  const toggle = () => {
    if (item.kind === 'gear') void actions.setGearStatus(item, item.done ? 'need' : 'have');
    else void actions.toggleDone(item);
  };
  return (
    <div className="row-tap flex min-h-11 items-start gap-3 ps-4 pe-3">
      <div className="pt-[11px]">
        <CheckCircle checked={item.done} onToggle={toggle} label={`${checkLabel}: ${item.title}`} />
      </div>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex min-w-0 flex-1 items-center gap-2 py-[11px] text-start"
      >
        <span className="min-w-0 flex-1">
          <span
            className={`block text-body leading-snug transition-colors ${item.done ? 'text-twig-soft' : 'text-twig'}`}
          >
            {item.title}
          </span>
          <ItemMetaLine item={item} household={household} members={members} />
        </span>
        <Chevron />
      </button>
    </div>
  );
}

export function LinkRow({ item, onOpen }: { item: Item; onOpen: (item: Item) => void }) {
  return (
    <div className="row-tap flex min-h-11 items-center gap-3 ps-4 pe-3">
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 py-[11px] text-start">
        <span className="block text-body leading-snug text-twig">{item.title}</span>
        {item.notes && <span className="mt-0.5 line-clamp-2 block text-subhead text-twig-soft">{item.notes}</span>}
        {item.url && !item.phone && <span className="mt-0.5 block text-footnote text-robin">{hostOf(item.url)}</span>}
      </button>
      {item.phone ? (
        <a
          href={telHref(item.phone)}
          className="press flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-subhead font-semibold text-leaf-ink"
          aria-label={`חיוג ל${item.title}: ${item.phone}`}
        >
          <Phone className="size-4" fill="currentColor" strokeWidth={0} aria-hidden />
          <span dir="ltr" className="tabular">
            {item.phone}
          </span>
        </a>
      ) : item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="press -me-1 flex size-11 shrink-0 items-center justify-center rounded-full"
          aria-label={`פתיחת ${item.title}`}
        >
          <ArrowUpLeft className="size-5 text-robin" strokeWidth={2} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
