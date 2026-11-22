/** Building blocks for the reference / tools screens (hub rows, source links, disclaimers). */
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { hostOf } from '../lib/format';
import { Chevron } from './ui';

export type IconTone = 'robin' | 'lagoon' | 'brick' | 'straw' | 'leaf';

const ICON_TONES: Record<IconTone, string> = {
  robin: 'bg-robin text-on-robin',
  lagoon: 'bg-lagoon text-on-robin',
  brick: 'bg-brick text-on-danger',
  straw: 'bg-straw text-twig',
  leaf: 'bg-leaf text-on-leaf',
};

/** Rounded-square icon badge (iOS Settings look). */
export function IconBadge({ icon: Icon, tone = 'robin' }: { icon: LucideIcon; tone?: IconTone }) {
  return (
    <span className={`flex size-[30px] shrink-0 items-center justify-center rounded-[8px] ${ICON_TONES[tone]}`}>
      <Icon className="size-[18px]" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

/** A tappable list row that navigates inside the app. */
export function NavRow({
  to,
  icon,
  tone,
  title,
  subtitle,
}: {
  to: string;
  icon: LucideIcon;
  tone?: IconTone;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link to={to} className="row-tap flex min-h-11 items-center gap-3 ps-4 pe-3">
      <IconBadge icon={icon} tone={tone} />
      <span className="min-w-0 flex-1 py-[11px]">
        <span className="block text-body leading-snug text-twig">{title}</span>
        {subtitle && <span className="mt-0.5 block text-footnote text-twig-soft">{subtitle}</span>}
      </span>
      <Chevron />
    </Link>
  );
}

/** "מקור: example.org" — opens the official page this content comes from. */
export function SourceLink({ url, label = 'מקור' }: { url: string; label?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-6 items-center text-footnote text-robin underline-offset-4 hover:underline"
    >
      {label}: {hostOf(url)}
    </a>
  );
}

/** Small print under medical content. */
export function MedicalNote({ children }: { children?: ReactNode }) {
  return (
    <p className="list-footer mb-6">
      {children ?? 'מידע כללי ממקורות רשמיים. ההנחיות של הצוות המטפל ושל בית החולים קודמות לכל מה שכתוב כאן.'}
    </p>
  );
}
