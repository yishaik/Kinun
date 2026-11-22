/**
 * Guards for the default content. If you add or edit seed entries, these tests tell you
 * when something is missing (source for health/rights facts, unknown category, bad URL…).
 */
import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, PHASES } from '../lib/labels';
import { buildSeedItems } from '../lib/seed';
import { SEED_BAG, SEED_GEAR, SEED_LINKS, SEED_TASKS, SRC } from './index';
import { GLOSSARY } from './glossary';
import { LABOR_STAGES, PAIN_RELIEF } from './laborStages';
import { WARNING_GROUPS } from './warnings';
import { WEEKS } from './weeks';

const all = [...SEED_TASKS, ...SEED_GEAR, ...SEED_BAG, ...SEED_LINKS];
const phaseKeys = new Set(PHASES.map((p) => p.key));

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

describe('default content', () => {
  it('has unique, stable-looking seed ids with the right prefix', () => {
    const ids = all.map((s) => s.seedId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SEED_TASKS) expect(s.seedId).toMatch(/^task\.[a-z0-9-]+$/);
    for (const s of SEED_GEAR) expect(s.seedId).toMatch(/^gear\.[a-z0-9-]+$/);
    for (const s of SEED_BAG) expect(s.seedId).toMatch(/^bag\.[a-z0-9-]+$/);
    for (const s of SEED_LINKS) expect(s.seedId).toMatch(/^link\.[a-z0-9-]+$/);
  });

  it('uses only known categories', () => {
    for (const s of SEED_TASKS) expect(Object.keys(CATEGORY_LABELS.task), s.seedId).toContain(s.category);
    for (const s of SEED_GEAR) expect(Object.keys(CATEGORY_LABELS.gear), s.seedId).toContain(s.category);
    for (const s of SEED_BAG) expect(Object.keys(CATEGORY_LABELS.bag), s.seedId).toContain(s.category);
    for (const s of SEED_LINKS) expect(Object.keys(CATEGORY_LABELS.link), s.seedId).toContain(s.category);
  });

  it('gives tasks a valid phase and sensible timing', () => {
    for (const t of SEED_TASKS) {
      expect(phaseKeys.has(t.phase), t.seedId).toBe(true);
      if (t.dueWeek != null) {
        expect(t.dueWeek, t.seedId).toBeGreaterThanOrEqual(4);
        expect(t.dueWeek, t.seedId).toBeLessThanOrEqual(42);
        expect(['pregnancy', 'prebirth'], `${t.seedId}: dueWeek only before birth`).toContain(t.phase);
      }
      if (t.dueDaysAfterBirth != null) {
        expect(t.dueDaysAfterBirth, t.seedId).toBeGreaterThanOrEqual(0);
        expect(t.dueDaysAfterBirth, t.seedId).toBeLessThanOrEqual(366);
        expect(['hospital', 'firstWeeks', 'firstMonths'], `${t.seedId}: days-after-birth only after birth`).toContain(
          t.phase,
        );
      }
      expect(t.dueWeek != null && t.dueDaysAfterBirth != null, `${t.seedId}: one timing at most`).toBe(false);
    }
  });

  it('backs every health / rights / work fact with a source', () => {
    for (const t of SEED_TASKS.filter((x) => ['health', 'rights', 'work'].includes(x.category))) {
      expect(t.source, `${t.seedId} needs a source`).toBeTruthy();
    }
  });

  it('uses valid https URLs everywhere', () => {
    for (const url of Object.values(SRC)) expect(isHttpsUrl(url), url).toBe(true);
    for (const s of all) {
      if (s.source) expect(isHttpsUrl(s.source), s.seedId).toBe(true);
      for (const l of s.links ?? []) {
        expect(isHttpsUrl(l.url), `${s.seedId} → ${l.url}`).toBe(true);
        expect(l.label.trim().length, s.seedId).toBeGreaterThan(0);
      }
    }
    for (const l of SEED_LINKS) {
      expect(Boolean(l.url || l.phone), `${l.seedId} needs a url or phone`).toBe(true);
      if (l.url) expect(isHttpsUrl(l.url), l.seedId).toBe(true);
      if (l.phone) expect(l.phone, l.seedId).toMatch(/^[*\d][\d-]*$/);
    }
  });

  it('keeps titles short and unique per list', () => {
    for (const list of [SEED_TASKS, SEED_GEAR, SEED_BAG, SEED_LINKS]) {
      const titles = list.map((s) => s.title.trim());
      expect(new Set(titles).size).toBe(titles.length);
      for (const s of list) {
        expect(s.title.trim().length, s.seedId).toBeGreaterThan(2);
        expect(s.title.length, s.seedId).toBeLessThanOrEqual(80);
      }
    }
  });

  it('builds seed items with defaults and increasing order', () => {
    const items = buildSeedItems();
    expect(items).toHaveLength(all.length);
    for (const kind of ['task', 'gear', 'bag', 'link'] as const) {
      const orders = items.filter((i) => i.kind === kind).map((i) => i.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
    expect(items.every((i) => i.done === false)).toBe(true);
    expect(items.filter((i) => i.kind === 'gear').every((i) => i.gearStatus === 'need')).toBe(true);
  });
});

describe('reference content', () => {
  const official = new Set<string>(Object.values(SRC));

  it('has one weekly card per week, each with text and an official https source', () => {
    const weeks = WEEKS.map((w) => w.week);
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b));
    expect(new Set(weeks).size).toBe(weeks.length);
    for (const w of WEEKS) {
      expect(w.baby.length, `week ${w.week}`).toBeGreaterThan(20);
      expect(w.mom.length, `week ${w.week}`).toBeGreaterThan(20);
      expect(w.source).toMatch(new RegExp(`^https://www\\.maccabi4u\\.co\\.il/.+/week_${w.week}/$`));
    }
  });

  it('backs every warning sign with a source from SRC', () => {
    expect(WARNING_GROUPS.map((g) => g.id)).toEqual(['mda', 'er', 'soon']);
    for (const g of WARNING_GROUPS) {
      expect(g.items.length, g.id).toBeGreaterThan(0);
      for (const it of g.items) expect(official.has(it.source), `${g.id}: ${it.text}`).toBe(true);
    }
  });

  it('backs every glossary term with a source from SRC, without duplicates', () => {
    expect(GLOSSARY.length).toBeGreaterThan(15);
    expect(new Set(GLOSSARY.map((t) => t.term)).size).toBe(GLOSSARY.length);
    for (const t of GLOSSARY) {
      expect(official.has(t.source), t.term).toBe(true);
      expect(t.definition.length, t.term).toBeGreaterThan(20);
    }
  });

  it('covers the labor stages in order and the pain-relief options, all sourced', () => {
    expect(LABOR_STAGES.map((s) => s.id)).toEqual(['latent', 'active', 'pushing', 'placenta', 'recovery']);
    for (const s of LABOR_STAGES) expect(official.has(s.source), s.id).toBe(true);
    expect(PAIN_RELIEF.map((g) => g.id)).toEqual(['medical', 'natural']);
    for (const g of PAIN_RELIEF) {
      expect(official.has(g.source), g.id).toBe(true);
      expect(g.options.length, g.id).toBeGreaterThan(2);
    }
    expect(PAIN_RELIEF[0].options.map((o) => o.name)).toContain('אפידורל');
  });
});
