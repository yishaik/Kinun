/**
 * The home-screen hero: an egg-shaped ring that fills as the pregnancy progresses
 * (and, after the birth, through the first six weeks). The one bold element of the UI.
 */
import type { ReactNode } from 'react';

const EGG_PATH = 'M60 6 C 30 6, 10 52, 10 88 C 10 122, 33 144, 60 144 C 87 144, 110 122, 110 88 C 110 52, 90 6, 60 6 Z';

export function EggProgress({
  ratio,
  label,
  children,
  size = 196,
}: {
  ratio: number;
  label: string;
  children: ReactNode;
  size?: number;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size * 1.25 }}
      role="img"
      aria-label={`${label}: ${pct}%`}
    >
      <svg viewBox="0 0 120 150" className="absolute inset-0 size-full" aria-hidden>
        <path d={EGG_PATH} fill="var(--color-paper)" stroke="var(--color-line)" strokeWidth="5" />
        <path
          d={EGG_PATH}
          fill="none"
          stroke="var(--color-robin)"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-6 text-center">{children}</div>
    </div>
  );
}
