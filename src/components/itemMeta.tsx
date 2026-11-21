/** Shared bits for showing an item's metadata (due date, assignee, status). */
import { Link2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatDayShort, relativeDays } from '../lib/format';
import type { MemberEntry } from '../lib/hooks';
import { GEAR_STATUS_LABEL, PRIORITY_LABEL } from '../lib/labels';
import { dateToDayNumber, taskDue } from '../lib/pregnancy';
import { isFromEarlierStage } from '../lib/progress';
import type { Household, Item } from '../lib/types';
import { Avatar, Chip, type ChipTone } from './ui';

export interface DueBadge {
  text: string;
  tone: ChipTone;
}

function overdueText(days: number): string {
  if (days === 1) return 'באיחור של יום';
  if (days < 14) return `באיחור של ${days} ימים`;
  return `באיחור של ${Math.round(days / 7)} שבועות`;
}

/** Human due label for a task, or null when it has no timing. */
export function dueBadge(item: Item, household: Household, now: Date = new Date()): DueBadge | null {
  const due = taskDue(item, household);
  if (!due) {
    if (item.dueWeek != null) return { text: `עד שבוע ${item.dueWeek}`, tone: 'muted' };
    if (item.dueDaysAfterBirth != null) return { text: `${item.dueDaysAfterBirth} ימים אחרי הלידה`, tone: 'muted' };
    return null;
  }
  const diff = due.day - dateToDayNumber(now);
  if (item.done) return { text: formatDayShort(due.day), tone: 'muted' };
  if (diff < 0 && !due.estimated && isFromEarlierStage(item, due.day)) {
    return {
      text: item.dueWeek != null ? `עד שבוע ${item.dueWeek} (עבר)` : `${item.dueDaysAfterBirth} ימים אחרי הלידה (עבר)`,
      tone: 'muted',
    };
  }
  if (diff < 0) return { text: overdueText(-diff), tone: 'brick' };
  if (diff <= 7) return { text: relativeDays(diff), tone: 'straw' };
  if (due.estimated) return { text: `בערך ${formatDayShort(due.day)}`, tone: 'muted' };
  if (item.dueWeek != null) return { text: `עד שבוע ${item.dueWeek}`, tone: 'muted' };
  return { text: `עד ${formatDayShort(due.day)}`, tone: 'muted' };
}

export function assigneeLabel(assignee: string | null | undefined, members: MemberEntry[]): string | null {
  if (!assignee) return null;
  if (assignee === 'both') return 'שנינו';
  return members.find((m) => m.uid === assignee)?.name ?? null;
}

export function AssigneeBadge({ assignee, members }: { assignee?: string | null; members: MemberEntry[] }) {
  if (!assignee) return null;
  if (assignee === 'both') return <Chip tone="robin">שנינו</Chip>;
  const m = members.find((x) => x.uid === assignee);
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-twig-soft">
      <Avatar name={m.name} photoURL={m.photoURL} size={20} />
      {m.name.split(' ')[0]}
    </span>
  );
}

/** One-line metadata under a row title. */
export function ItemMetaLine({
  item,
  household,
  members,
}: {
  item: Item;
  household: Household;
  members: MemberEntry[];
}) {
  const parts: ReactNode[] = [];
  if (item.kind === 'task') {
    const due = dueBadge(item, household);
    if (due)
      parts.push(
        <Chip key="due" tone={due.tone}>
          {due.text}
        </Chip>,
      );
    if (item.priority === 'optional')
      parts.push(
        <Chip key="opt" tone="muted">
          {PRIORITY_LABEL.optional}
        </Chip>,
      );
  }
  if (item.kind === 'gear') {
    if (item.gearStatus === 'ordered')
      parts.push(
        <Chip key="st" tone="straw">
          {GEAR_STATUS_LABEL.ordered}
        </Chip>,
      );
    if (item.gearStatus === 'skip')
      parts.push(
        <Chip key="st" tone="muted">
          {GEAR_STATUS_LABEL.skip}
        </Chip>,
      );
    if (item.priority === 'must' && !item.done)
      parts.push(
        <Chip key="pr" tone="neutral">
          {PRIORITY_LABEL.must}
        </Chip>,
      );
  }
  if (item.kind === 'bag' && item.priority === 'must' && !item.done) {
    parts.push(
      <Chip key="pr" tone="neutral">
        {PRIORITY_LABEL.must}
      </Chip>,
    );
  }
  if (item.quantity && item.quantity !== '1') {
    parts.push(
      <span key="q" className="text-[13px] text-twig-soft">
        כמות: {item.quantity}
      </span>,
    );
  }
  if (item.links.length > 0 || item.url) {
    parts.push(<Link2 key="ln" className="size-4 text-twig-soft" aria-label="יש קישורים" />);
  }
  parts.push(<AssigneeBadge key="as" assignee={item.assignee} members={members} />);
  return <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">{parts}</div>;
}
