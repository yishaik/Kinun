/** Small, dumb UI primitives. No data access here. */
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { firstName } from '../lib/format';

export function CheckCircle({
  checked,
  onToggle,
  label,
  tone = 'robin',
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  tone?: 'robin' | 'night';
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full"
    >
      <span
        className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors ${
          checked
            ? 'check-pop border-robin bg-robin text-white'
            : tone === 'night'
              ? 'border-night-text/50'
              : 'border-twig-soft/50 bg-paper'
        }`}
      >
        {checked && <Check className="size-4" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  );
}

export type ChipTone = 'neutral' | 'robin' | 'straw' | 'brick' | 'muted';

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: 'bg-twig/[0.07] text-twig',
  robin: 'bg-robin-soft text-robin-deep',
  straw: 'bg-straw-soft text-twig',
  brick: 'bg-brick-soft text-brick',
  muted: 'bg-transparent text-twig-soft',
};

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] leading-5 font-semibold ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  ratio,
  label,
  tone = 'robin',
}: {
  ratio: number;
  label: string;
  tone?: 'robin' | 'straw';
}) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-line"
    >
      <div
        className={`h-full rounded-full ${tone === 'robin' ? 'bg-robin' : 'bg-straw'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Avatar({ name, photoURL, size = 32 }: { name: string; photoURL?: string | null; size?: number }) {
  const [broken, setBroken] = useState(false);
  const initial = firstName(name).slice(0, 1) || '?';
  if (photoURL && !broken) {
    return (
      <img
        src={photoURL}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-robin-soft font-display text-robin-deep"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}

/** A collapsible group of rows with a heading and a done/total count. */
export function Section({
  title,
  hint,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  hint?: string;
  count?: { done: number; total: number };
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const complete = count && count.total > 0 && count.done === count.total;
  return (
    <section className="mb-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-baseline gap-2 px-1 pb-2 text-start"
      >
        <h2 className="font-display text-xl leading-tight">{title}</h2>
        {hint && <span className="text-sm text-twig-soft">{hint}</span>}
        <span className="ms-auto flex items-center gap-1 text-sm text-twig-soft">
          {count && (
            <span className={complete ? 'font-semibold text-robin' : ''}>
              {count.done}/{count.total}
            </span>
          )}
          <ChevronDown className={`size-4 transition-transform ${open ? '' : 'rotate-90'}`} aria-hidden />
        </span>
      </button>
      <div id={id} hidden={!open} className="shelf divide-y divide-line overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-display text-xl">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-xs text-twig-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] end-5 z-30 flex size-14 items-center justify-center rounded-full bg-robin text-white shadow-lg shadow-robin/30 transition-colors hover:bg-robin-deep"
    >
      <Plus className="size-7" aria-hidden />
    </button>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-full bg-line/70 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 flex-1 rounded-full px-3 text-[15px] font-semibold transition-colors ${
            value === o.value ? 'bg-paper text-twig shadow-sm' : 'text-twig-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Horizontal filter chips. */
export function FilterChips<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[15px] font-semibold transition-colors ${
            value === o.value ? 'border-twig bg-twig text-shell' : 'border-line bg-paper text-twig'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end gap-3">
      <h1 className="font-display text-3xl leading-tight">{children}</h1>
      {aside && <div className="ms-auto">{aside}</div>}
    </div>
  );
}
