import { useEffect, useId, useState } from 'react';
import { clearCelebration, hasSeenCelebration, markCelebrationSeen } from '../lib/celebration';

const CONFETTI = Array.from({ length: 16 }, (_, i) => i);

/**
 * A one-time (per household + topic) celebration when a list hits 100%.
 * Confetti is CSS-only and is still when the user prefers reduced motion.
 */
export function Celebration({
  storageKey,
  ready,
  title,
  body,
}: {
  storageKey: string;
  ready: boolean;
  title: string;
  body: string;
}) {
  const headingId = useId();
  const [, bump] = useState(0);

  useEffect(() => {
    if (!ready) clearCelebration(storageKey);
  }, [ready, storageKey]);

  const open = ready && !hasSeenCelebration(storageKey);
  if (!open) return null;

  const dismiss = () => {
    markCelebrationSeen(storageKey);
    bump((n) => n + 1);
  };

  return (
    <div className="celebrate-scrim" role="dialog" aria-modal="true" aria-labelledby={headingId}>
      <div className="celebrate-card widget relative overflow-hidden p-6 text-center">
        <div className="celebrate-confetti" aria-hidden>
          {CONFETTI.map((i) => (
            <span key={i} className={`celebrate-bit celebrate-bit-${i % 8}`} />
          ))}
        </div>
        <p className="celebrate-badge" aria-hidden>
          100%
        </p>
        <h2 id={headingId} className="relative mt-4 text-title2">
          {title}
        </h2>
        <p className="relative mt-2 text-subhead text-twig-soft">{body}</p>
        <button type="button" className="btn-primary relative mt-5 min-h-11 w-full" onClick={dismiss}>
          יופי, תודה
        </button>
      </div>
    </div>
  );
}
