/**
 * iOS-style bottom sheet: grabber, rounded top corners, dimmed backdrop, spring-like slide-up
 * (disabled under prefers-reduced-motion). Closes on Escape and on backdrop tap; returns focus on close.
 */
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('[data-autofocus], input, textarea, select, button');
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center text-twig [color-scheme:light_dark]">
      <div className="fade-in absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up elevated relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[var(--radius-sheet)] bg-shell shadow-[0_-8px_40px_rgb(0_0_0/0.18)]"
      >
        <span
          className="absolute top-[5px] left-1/2 h-[5px] w-9 -translate-x-1/2 rounded-full bg-twig-faint"
          aria-hidden
        />
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          <h2 className="min-w-0 flex-1 text-title3 leading-snug">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="press -me-1 flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-twig-soft"
          >
            <X className="size-[18px]" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
        {footer && (
          <div className="material border-t-[0.5px] border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
