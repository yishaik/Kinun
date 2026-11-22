import { describe, expect, it } from 'vitest';
import { PACES, cycleMs, paceLabel, phaseAt } from './breathing';

const calm = PACES[0];

describe('breathing pacer', () => {
  it('walks through in → hold → out', () => {
    expect(phaseAt(0, calm)).toEqual({ phase: 'in', secondsLeft: 4, cycles: 0 });
    expect(phaseAt(3500, calm)).toEqual({ phase: 'in', secondsLeft: 1, cycles: 0 });
    expect(phaseAt(4000, calm)).toEqual({ phase: 'hold', secondsLeft: 2, cycles: 0 });
    expect(phaseAt(6000, calm)).toEqual({ phase: 'out', secondsLeft: 6, cycles: 0 });
    expect(phaseAt(11_900, calm).phase).toBe('out');
  });

  it('counts finished cycles and wraps around', () => {
    expect(cycleMs(calm)).toBe(12_000);
    expect(phaseAt(12_000, calm)).toEqual({ phase: 'in', secondsLeft: 4, cycles: 1 });
    expect(phaseAt(30_500, calm)).toMatchObject({ phase: 'out', cycles: 2 });
  });

  it('labels paces and treats negative time as the start', () => {
    expect(paceLabel(calm)).toBe('\u20664·2·6\u2069');
    expect(phaseAt(-50, calm).phase).toBe('in');
  });
});
