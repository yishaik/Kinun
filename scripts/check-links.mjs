#!/usr/bin/env node
/**
 * Checks that every https URL in the default content still responds.
 * Usage: npm run check:links      (exit code 1 if a link is definitely broken: 404/410/DNS)
 *
 * Many government sites block bots (403) or reject HEAD (405) — those are reported as
 * warnings, not failures. Runs weekly in .github/workflows/links.yml.
 */
import { readdirSync, readFileSync } from 'node:fs';

const contentDir = new URL('../src/content/', import.meta.url);
const extra = [new URL('../src/pages/SettingsPage.tsx', import.meta.url)];

const files = readdirSync(contentDir)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
  .map((f) => new URL(f, contentDir))
  .concat(extra);

const urls = new Set();
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/https:\/\/[^\s'"`)]+/g)) urls.add(match[0].replace(/[.,;]+$/, ''));
}

const UA = 'Mozilla/5.0 (compatible; kinun-link-check/1.0; +https://github.com/yishaik/Kinun)';

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) return { url, status: res.status, level: 'ok' };
      if (method === 'HEAD' && [403, 405, 400, 501].includes(res.status)) continue;
      if ([404, 410].includes(res.status)) return { url, status: res.status, level: 'broken' };
      return { url, status: res.status, level: 'warn' };
    } catch (err) {
      if (method === 'HEAD') continue;
      const code = err?.cause?.code ?? err?.name ?? 'error';
      return { url, status: code, level: code === 'ENOTFOUND' ? 'broken' : 'warn' };
    }
  }
  return { url, status: '?', level: 'warn' };
}

const results = [];
const list = [...urls];
for (let i = 0; i < list.length; i += 6) {
  results.push(...(await Promise.all(list.slice(i, i + 6).map(check))));
}

const broken = results.filter((r) => r.level === 'broken');
const warn = results.filter((r) => r.level === 'warn');
console.log(
  `Checked ${results.length} links: ${results.length - broken.length - warn.length} ok, ${warn.length} warnings, ${broken.length} broken`,
);
for (const r of warn) console.log(`  ⚠ ${r.status}  ${decodeURI(r.url)}`);
for (const r of broken) console.log(`  ✗ ${r.status}  ${decodeURI(r.url)}`);
process.exit(broken.length ? 1 : 0);
