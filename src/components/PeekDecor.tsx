import elephant from '../assets/jungle/elephant-peek.webp';
import giraffe from '../assets/jungle/giraffe-peek.webp';
import monkey from '../assets/jungle/monkey-dangling.webp';
import owl from '../assets/jungle/owl-peek.webp';

export type PeekKind = 'giraffe' | 'owl' | 'elephant' | 'monkey';

const SRC: Record<PeekKind, string> = { giraffe, owl, elephant, monkey };

/**
 * A jungle animal that peeks from the gap around a list section.
 * Decorative only: aria-hidden, no pointer events, never covers titles.
 */
export function PeekDecor({ kind }: { kind: PeekKind }) {
  return <img src={SRC[kind]} alt="" aria-hidden className={`peek-decor peek-${kind}`} draggable={false} />;
}

/** Assign at most a few peeks so lists stay readable. */
export const TASK_PEEKS: Record<string, PeekKind> = {
  hospital: 'monkey',
  health: 'owl',
  home: 'giraffe',
  logistics: 'elephant',
};

export const GEAR_PEEKS: Record<string, PeekKind> = {
  sleep: 'monkey',
  feeding: 'giraffe',
  home: 'elephant',
};

export const BAG_PEEKS: Record<string, PeekKind> = {
  baby: 'giraffe',
};
