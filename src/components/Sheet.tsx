/** Bottom sheet dialog. Closes on Escape and on backdrop tap; returns focus on close. */
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
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-twig/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[1.75rem] bg-shell shadow-2xl"
      >
        <div className="flex items-center gap-2 px-5 pt-3 pb-2">
          <span className="absolute top-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-line" aria-hidden />
          <h2 className="mt-3 flex-1 font-display text-xl leading-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="mt-3 -me-2 rounded-full p-2 text-twig-soft hover:bg-line"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="pb-safe border-t border-line bg-shell px-5 pt-3 pb-3">{footer}</div>}
      </div>
    </div>
  );
}
