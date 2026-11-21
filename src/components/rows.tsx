/** List rows for each item kind. Rows are buttons that open the item sheet. */
import { ExternalLink, Phone } from 'lucide-react';
import { useActions } from '../data/session';
import { hostOf, telHref } from '../lib/format';
import type { MemberEntry } from '../lib/hooks';
import type { Household, Item } from '../lib/types';
import { ItemMetaLine } from './itemMeta';
import { CheckCircle } from './ui';

interface RowProps {
  item: Item;
  household: Household;
  members: MemberEntry[];
  onOpen: (item: Item) => void;
}

/** Task, gear and bag rows share a layout: check circle + title + meta line. */
export function CheckRow({ item, household, members, onOpen }: RowProps) {
  const actions = useActions();
  const checkLabel =
    item.kind === 'gear' ? (item.done ? 'סמן שעוד צריך' : 'סמן שיש') : item.kind === 'bag' ? 'ארוז' : 'בוצע';
  const toggle = () => {
    if (item.kind === 'gear') void actions.setGearStatus(item, item.done ? 'need' : 'have');
    else void actions.toggleDone(item);
  };
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="pt-0.5">
        <CheckCircle checked={item.done} onToggle={toggle} label={`${checkLabel}: ${item.title}`} />
      </div>
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-start">
        <span
          className={`block text-[17px] leading-snug ${item.done ? 'text-twig-soft line-through decoration-1' : ''}`}
        >
          {item.title}
        </span>
        <ItemMetaLine item={item} household={household} members={members} />
      </button>
    </div>
  );
}

export function LinkRow({ item, onOpen }: { item: Item; onOpen: (item: Item) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-start">
        <span className="block text-[17px] leading-snug font-semibold">{item.title}</span>
        {item.notes && <span className="mt-0.5 block text-[15px] leading-snug text-twig-soft">{item.notes}</span>}
        {item.url && !item.phone && <span className="mt-0.5 block text-sm text-robin">{hostOf(item.url)}</span>}
      </button>
      {item.phone ? (
        <a
          href={telHref(item.phone)}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-robin px-3.5 font-semibold text-white"
          aria-label={`חיוג ל${item.title}: ${item.phone}`}
        >
          <Phone className="size-4" aria-hidden />
          <span dir="ltr">{item.phone}</span>
        </a>
      ) : item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-robin"
          aria-label={`פתיחת ${item.title}`}
        >
          <ExternalLink className="size-5" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
