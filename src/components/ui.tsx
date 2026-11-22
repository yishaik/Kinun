/** Small, dumb UI primitives in an iOS style. No data access here. */
import { ChevronDown, ChevronLeft, Plus, Search } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { firstName } from '../lib/format';

/** Round iOS-style checkbox (Reminders look) with a filled check animation. */
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
      className="-m-2.5 flex size-11 shrink-0 items-center justify-center rounded-full"
    >
      <span
        className={`flex size-6 items-center justify-center rounded-full transition-colors duration-200 ${
          checked
            ? 'check-pop bg-leaf text-on-leaf'
            : tone === 'night'
              ? 'border-[1.5px] border-night-soft'
              : 'border-[1.5px] border-twig-faint'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <polyline
              points="5.5 12.5 10 17 18.5 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

/** iOS switch (UISwitch). */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-leaf' : 'bg-fill-strong'
      }`}
    >
      <span
        className={`absolute top-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-[inset-inline-start] duration-200 ease-[var(--ease-ios)] ${
          checked ? 'start-[22px]' : 'start-[2px]'
        }`}
      />
    </button>
  );
}

export type ChipTone = 'neutral' | 'robin' | 'straw' | 'brick' | 'leaf' | 'muted';

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: 'bg-fill text-twig-soft',
  robin: 'bg-robin-soft text-robin',
  straw: 'bg-straw-soft text-straw-ink',
  brick: 'bg-brick-soft text-brick-ink',
  leaf: 'bg-leaf-soft text-leaf-ink',
  muted: 'bg-transparent px-0 text-twig-soft',
};

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-footnote font-medium ${CHIP_TONES[tone]}`}
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
      className="h-1.5 w-full overflow-hidden rounded-full bg-fill"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-[var(--ease-ios)] ${tone === 'robin' ? 'bg-robin' : 'bg-straw'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Circular progress ring (Activity-ring look). */
export function Ring({
  ratio,
  size = 64,
  stroke = 8,
  tone = 'robin',
  sunCap = false,
  children,
  label,
}: {
  ratio: number;
  size?: number;
  stroke?: number;
  tone?: 'robin' | 'leaf' | 'straw';
  /** A small sun at the leading end of the arc — used on the home week ring. */
  sunCap?: boolean;
  children?: ReactNode;
  /** When set, the ring is announced as an image with this label and the percentage. */
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, ratio));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = tone === 'leaf' ? 'var(--color-leaf)' : tone === 'straw' ? 'var(--color-straw)' : 'var(--color-robin)';
  const cap = {
    x: size / 2 + r * Math.cos(2 * Math.PI * pct),
    y: size / 2 + r * Math.sin(2 * Math.PI * pct),
  };
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      {...(label ? { role: 'img', 'aria-label': `${label}: ${Math.round(pct * 100)}%` } : { 'aria-hidden': true })}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper-2)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            className="transition-[stroke-dasharray] duration-700 ease-[var(--ease-ios)]"
          />
        )}
        {sunCap && pct > 0 && <circle cx={cap.x} cy={cap.y} r={Math.max(3, stroke * 0.55)} fill="var(--color-sun)" />}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
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
      className="flex shrink-0 items-center justify-center rounded-full bg-twig-soft font-semibold text-paper"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

/** An inset-grouped list section with a header, an optional done/total count and an optional footer. */
export function Section({
  title,
  hint,
  count,
  footer,
  defaultOpen = true,
  collapsible = true,
  inset = '3.25rem',
  aside,
  children,
}: {
  title: string;
  hint?: string;
  count?: { done: number; total: number };
  footer?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  /** Where the row separators start (to line up with the row text). */
  inset?: string;
  /** Extra element at the end of the header (e.g. a "see all" link). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const complete = count && count.total > 0 && count.done === count.total;
  const heading = (
    <>
      <h2 className="text-title3">{title}</h2>
      {hint && (
        <span className="rounded-full bg-robin-soft px-2 py-px text-footnote font-semibold text-robin">{hint}</span>
      )}
    </>
  );
  return (
    <section className="mb-7">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-9 w-full items-center gap-2 px-4 pb-2 text-start"
        >
          {heading}
          <span className="ms-auto flex items-center gap-1 text-subhead text-twig-soft">
            {count && (
              <span className={`tabular ${complete ? 'font-semibold text-leaf-ink' : ''}`}>
                {count.done}/{count.total}
              </span>
            )}
            <ChevronDown
              className={`size-4 text-twig-faint transition-transform duration-300 ${open ? '' : 'rotate-90'}`}
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        </button>
      ) : (
        <div className="flex min-h-9 items-center gap-2 px-4 pb-2">
          {heading}
          {aside && <span className="ms-auto">{aside}</span>}
        </div>
      )}
      <div
        id={id}
        hidden={collapsible && !open}
        className="shelf ios-list overflow-hidden"
        style={{ ['--sep-inset' as string]: inset }}
      >
        {children}
      </div>
      {footer && (!collapsible || open) && <div className="list-footer">{footer}</div>}
    </section>
  );
}

/** Trailing disclosure chevron for tappable rows (points left in RTL). */
export function Chevron() {
  return <ChevronLeft className="size-4 shrink-0 text-twig-faint" strokeWidth={2.5} aria-hidden />;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-title3 text-twig">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-xs text-subhead text-twig-soft">{body}</p>}
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
      className="press fixed end-5 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-robin text-on-robin shadow-[0_8px_24px_-6px_var(--color-robin)] active:bg-robin-deep"
    >
      <Plus className="size-7" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/**
 * iOS segmented control. `kind="tabs"` exposes tab semantics (switching lists);
 * `kind="radio"` exposes a radio group (filters).
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  kind = 'tabs',
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  label: string;
  kind?: 'tabs' | 'radio';
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div
      role={kind === 'tabs' ? 'tablist' : 'radiogroup'}
      aria-label={label}
      className="relative flex rounded-[9px] bg-fill p-[2px]"
    >
      <span
        aria-hidden
        className="absolute top-[2px] bottom-[2px] rounded-[7px] bg-thumb shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] transition-[inset-inline-start] duration-300 ease-[var(--ease-ios)]"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          insetInlineStart: `calc(2px + (100% - 4px) / ${options.length} * ${index})`,
        }}
      />
      {options.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role={kind === 'tabs' ? 'tab' : 'radio'}
            {...(kind === 'tabs' ? { 'aria-selected': selected } : { 'aria-checked': selected })}
            onClick={() => onChange(o.value)}
            className={`relative z-10 min-h-8 flex-1 truncate rounded-[7px] px-2 text-footnote transition-colors ${
              selected ? 'font-semibold text-twig' : 'font-medium text-twig'
            } ${i > 0 && !selected && index !== i - 1 ? "before:absolute before:inset-y-2 before:start-0 before:w-px before:bg-twig-faint/60 before:content-['']" : ''}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Filters (a radio group), drawn as an iOS segmented control. */
export function FilterChips<T extends string>(props: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  label: string;
}) {
  return <Segmented {...props} kind="radio" />;
}

/** iOS search field: gray filled, rounded, magnifier at the leading edge. */
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">חיפוש</span>
      <Search
        className="pointer-events-none absolute start-2 top-1/2 size-[18px] -translate-y-1/2 text-twig-soft"
        strokeWidth={2.25}
        aria-hidden
      />
      <input
        type="search"
        className="h-9 w-full rounded-[10px] border-0 bg-fill ps-8 pe-3 text-body text-twig placeholder:text-twig-soft focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/**
 * iOS large title. The app shell (Layout) watches `[data-large-title]` and shows a compact,
 * centered copy of it in the translucent nav bar once it scrolls away.
 */
export function PageTitle({
  children,
  aside,
  eyebrow,
}: {
  children: ReactNode;
  aside?: ReactNode;
  /** Small text above the title (e.g. today's date). */
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-3 px-1">
      {eyebrow && <p className="text-footnote font-semibold text-twig-soft uppercase">{eyebrow}</p>}
      <div className="flex items-end gap-3">
        <h1 data-large-title className="min-w-0 font-display text-large-title font-normal">
          {children}
        </h1>
        {aside && <div className="ms-auto shrink-0 pb-1">{aside}</div>}
      </div>
    </div>
  );
}
