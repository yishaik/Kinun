/**
 * Breathing pacer. The method is the Ministry of Health one (pain-reduction page): fill the lungs,
 * hold for a few seconds, then breathe out slowly and long, as if through a straw. The number
 * of seconds per phase is a pace the user picks — not a medical instruction.
 */
export type BreathPhase = 'in' | 'hold' | 'out';

export interface Pace {
  id: string;
  inSec: number;
  holdSec: number;
  outSec: number;
}

export const PACES: Pace[] = [
  { id: 'calm', inSec: 4, holdSec: 2, outSec: 6 },
  { id: 'slow', inSec: 4, holdSec: 3, outSec: 8 },
  { id: 'short', inSec: 3, holdSec: 1, outSec: 5 },
];

export const PHASE_LABEL: Record<BreathPhase, string> = {
  in: 'שאיפה',
  hold: 'החזקה',
  out: 'נשיפה ארוכה',
};

export function cycleMs(p: Pace): number {
  return (p.inSec + p.holdSec + p.outSec) * 1000;
}

/** Where we are after `elapsedMs`: phase, whole seconds left in it (≥1), finished cycles. */
export function phaseAt(elapsedMs: number, p: Pace): { phase: BreathPhase; secondsLeft: number; cycles: number } {
  const t = Math.max(0, elapsedMs);
  const cycles = Math.floor(t / cycleMs(p));
  let inCycle = (t % cycleMs(p)) / 1000;
  const parts: [BreathPhase, number][] = [
    ['in', p.inSec],
    ['hold', p.holdSec],
    ['out', p.outSec],
  ];
  for (const [phase, len] of parts) {
    if (inCycle < len) return { phase, secondsLeft: Math.max(1, Math.ceil(len - inCycle)), cycles };
    inCycle -= len;
  }
  return { phase: 'out', secondsLeft: 1, cycles };
}

/** "4·2·6", isolated left-to-right so RTL text doesn't reverse the order. */
export function paceLabel(p: Pace): string {
  return `\u2066${p.inSec}·${p.holdSec}·${p.outSec}\u2069`;
}
