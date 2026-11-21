/**
 * Toasts as an iOS-style HUD: one small capsule at the top of the screen, never stacked.
 * A new toast replaces the current one; it auto-dismisses after ~2s (longer with an action or an error).
 */
import { CircleAlert, CircleCheck } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastEntry {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

interface ToastContextValue {
  toast(message: string, tone?: ToastTone, action?: ToastAction): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** How long a toast stays on screen (ms). */
export function toastDuration(tone: ToastTone, hasAction: boolean): number {
  if (hasAction) return 5000;
  if (tone === 'error') return 4500;
  return 2000;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastEntry | null>(null);
  const nextId = useRef(1);
  const timer = useRef<number | undefined>(undefined);

  const dismiss = useCallback((id?: number) => {
    setCurrent((t) => (id === undefined || t?.id === id ? null : t));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'info', action?: ToastAction) => {
      const id = nextId.current++;
      window.clearTimeout(timer.current);
      setCurrent({ id, message, tone, action });
      timer.current = window.setTimeout(() => dismiss(id), toastDuration(tone, Boolean(action)));
    },
    [dismiss],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({ toast }), [toast]);
  const t = current;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex justify-center px-4"
        aria-live="polite"
      >
        {t && (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="hud-in pointer-events-auto flex max-w-[min(26rem,100%)] items-center gap-2 rounded-full bg-paper/85 py-2 ps-3 pe-4 text-subhead font-medium text-twig shadow-[0_8px_30px_rgb(0_0_0/0.16)] ring-[0.5px] ring-line backdrop-blur-xl backdrop-saturate-150"
          >
            {t.tone === 'error' ? (
              <CircleAlert className="size-5 shrink-0 text-brick" aria-hidden />
            ) : t.tone === 'success' ? (
              <CircleCheck className="size-5 shrink-0 text-leaf" aria-hidden />
            ) : null}
            <span className="min-w-0">{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="press -me-1 ms-1 shrink-0 rounded-full px-2 py-0.5 font-semibold text-robin"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
