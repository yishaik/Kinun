# Kinun handoff

Last verified: 23 November 2026, 00:43, Asia/Jerusalem (UTC+2).

This file is the current-status snapshot for coding agents and anyone continuing the work. Facts below were checked against the repo at `52c47a7` on `main` (plus the personal sign-in change in this PR), GitHub PRs #5–#12 and the visual PRs #10–#11, Linear team Yishaik (YIS), and the earlier live Hosting verification. Live screenshots of the eight approved visual upgrades are taken after this PR auto-deploys. Inferred items are marked. **Never put secret values in this file, in git, or in chat** — names only.

When something here changes (deploy, URL, known issue, next step), update this file in the same change. See AGENTS.md rule 14.

## What this is

**Kinun** (קינון, Hebrew for "nesting") is a private, Hebrew, right-to-left PWA for a couple preparing for birth in the Tel Aviv area: tasks timed by pregnancy week / days after birth, a gear list, a hospital-bag checklist, a shared labor-mode contraction timer, and official links and hotlines. Both partners sign in with Google; lists sync in real time via Firestore. Only allowlisted accounts (`src/lib/access.ts`, mirrored by `allowlist()` in `firestore.rules`) can sign in or be added.

Stack: React 19 + Vite + TypeScript + Tailwind v4, Firebase Auth (Google) + Firestore. Repo: https://github.com/yishaik/Kinun (public; created 21 November 2026, 15:51 Asia/Jerusalem). Default branch: `main`.

A remote MCP server (`mcp-worker/`) lets an AI agent read, add, edit, and mark items done (no delete; no access to labor contractions, household settings, or members). Settings in the PWA has a **סוכני AI** card for the worker URL and token (stored in that device's `localStorage` only). See [MCP.md](MCP.md).

## Current status (verified 23 November 2026, 00:43)

- `main` at [`52c47a7`](https://github.com/yishaik/Kinun/commit/52c47a7f46a3830fbc85ace9e76c7707052a3542) (YIS-248 / [PR #12](https://github.com/yishaik/Kinun/pull/12)) includes the journal and the week timeline + size comparison on the home week card. This PR adds the personal sign-in screen (YIS-251).
- Visual upgrades already on `main`: [`a7daea6`](https://github.com/yishaik/Kinun/commit/a7daea66bd4d9ed0ea49ccbfcff557a9cfaf4c65) — reactive giraffe, category animals, bag celebration, micro-animations, peeking animals ([PR #10](https://github.com/yishaik/Kinun/pull/10), YIS-249); [`24d6584`](https://github.com/yishaik/Kinun/commit/24d6584e5f86372543f6468e12382a815feb96e8) — soft jungle night mode ([PR #11](https://github.com/yishaik/Kinun/pull/11), YIS-250).
- Mockup 02 (week timeline / size comparison on Home) was intentionally left to the content track and is now on `main` via PR #12. No extra week-timeline data was added in the visual PRs.

## Content bundles (23 November 2026)

Six bundles merged (Linear YIS-243 … YIS-248, related to YIS-237):

1. [YIS-243](https://linear.app/yishaik/issue/YIS-243) — "השבוע שלכם" (`/week`), סימני אזהרה (`/warnings`), hub `/more`, more official links; fixed the YIS-231 404. [PR #5](https://github.com/yishaik/Kinun/pull/5)
2. [YIS-244](https://linear.app/yishaik/issue/YIS-244) — שלבי הלידה ושיכוך כאב (`/stages`), מילון מונחים (`/glossary`). [PR #6](https://github.com/yishaik/Kinun/pull/6)
3. [YIS-245](https://linear.app/yishaik/issue/YIS-245) — `records` sub-collection + rules + tests; ספירת תנועות (`/kicks`), תוכנית לידה (`/birth-plan`, `/birth-plan/print`). [PR #7](https://github.com/yishaik/Kinun/pull/7)
4. [YIS-246](https://linear.app/yishaik/issue/YIS-246) — שאלות לרופא/ה (`/questions`), שמות עם הצבעה (`/names`). [PR #8](https://github.com/yishaik/Kinun/pull/8)
5. [YIS-247](https://linear.app/yishaik/issue/YIS-247) — מדריך לבן/בת הזוג (`/partner`), תרגול נשימות (`/breathing`). [PR #9](https://github.com/yishaik/Kinun/pull/9)
6. [YIS-248](https://linear.app/yishaik/issue/YIS-248) — יומן רגעים (`/journal`: moments, letter to the baby, babymoon; text only), week timeline + size comparison on the home week card, these docs. [PR #12](https://github.com/yishaik/Kinun/pull/12)

**Blocker — Firestore rules not deployed.** `firestore.rules` on `main` includes `records`, but the deploy with the
`FIREBASE_SERVICE_ACCOUNT` service account failed with 403 (`firebaserules.googleapis.com …:test` — caller does not have
permission). Until an owner runs `firebase deploy --project kinun-ae894 --only firestore:rules` (or grants the service
account `roles/firebaserules.admin` + `roles/serviceusage.serviceUsageConsumer`), kicks, birth plan, questions, names
and journal show an error toast and an empty list on the live app (demo mode works). Do not attempt this deploy until
that IAM grant is in place.

## Visual upgrades and Hosting

- GitHub Actions auto-deploy to Firebase Hosting is **active**. Repo variable `FIREBASE_PROJECT_ID` and repo secret `FIREBASE_SERVICE_ACCOUNT` are set (names only). Pushes to `main` deploy Hosting unless the change is docs-only (`**.md`, `docs/**`, `.github/ISSUE_TEMPLATE/**`). `deploy.yml` builds and deploys; it does not re-run unit tests (CI already does). Both `deploy.yml` and `ci.yml` use `concurrency` with `cancel-in-progress: true`. The first auto-deploy (workflow_dispatch) succeeded at 22 November 2026, 23:23 Asia/Jerusalem: https://github.com/yishaik/Kinun/actions/runs/45071745046. Later `main` pushes (including #10 and #11) also auto-deploy.
- Live PWA: https://kinun-ae894.web.app (will include this PR after its auto-deploy).
- MCP Worker `kinun-mcp` is **not deployed** on the two Cloudflare accounts Wrangler can see (`Yishai.k@gmail.com` and `Yishai.kaminsky@mail.tab.bot`). Other known workers on the gmail account _are_ visible, so this is a real absence there, not a permissions miss on those accounts. A third Cloudflare account, if any, was not visible.
- Linear project: [Kinun](https://linear.app/yishaik/project/kinun-df7da462d385). Recent design work: [YIS-238](https://linear.app/yishaik/issue/YIS-238) (Done, original giraffe redesign), [YIS-249](https://linear.app/yishaik/issue/YIS-249) (Done, PR #10), [YIS-250](https://linear.app/yishaik/issue/YIS-250) (Done, PR #11), [YIS-251](https://linear.app/yishaik/issue/YIS-251) (this PR). Auto-deploy is [YIS-230](https://linear.app/yishaik/issue/YIS-230) (Done).

## Deployments and URLs

### PWA — Firebase Hosting (live)

|                  |                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Firebase project | `kinun-ae894` (Spark; `.firebaserc` points here)                                                                         |
| Firestore        | `(default)` in `me-west1`                                                                                                |
| Live app         | https://kinun-ae894.web.app (also https://kinun-ae894.firebaseapp.com — same site)                                       |
| Auth / init      | https://kinun-ae894.web.app/__/firebase/init.json is live; `authDomain` is `kinun-ae894.firebaseapp.com`                 |
| Custom domain    | None verified. Probes of `kinun.app`, `www.kinun.app`, and `kinun.yishaik.com` failed TLS; `kinun.web.app` returned 404. |

A live fetch of the Hosting manifest and icons at 23:23 Asia/Jerusalem on 22 November 2026 **matched** the giraffe redesign on `main` @ `b7f5b90`:

- Live `theme_color` / `background_color`: `#F6F1E6`
- `/favicon-32.png` is served as `image/png` (PNG magic bytes; 2228 bytes)
- Live `pwa-192.png` is 54597 bytes, same size as `public/pwa-192.png` on `main`
- Hosting `Last-Modified`: 22 November 2026, 23:23 Asia/Jerusalem (UTC+2) (`Sun, 22 Nov 2026 21:23:07 GMT`)

GitHub Actions `Deploy to Firebase Hosting` is **on**. The successful first run was https://github.com/yishaik/Kinun/actions/runs/45071745046 (workflow_dispatch on `main` @ `b7f5b90`). Subsequent pushes to `main` that are not docs-only will deploy automatically. Firestore rules and indexes are **not** deployed by this workflow; those still need a manual `firebase deploy --only firestore`.

### MCP Worker — not live

|                             |                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Planned worker name         | `kinun-mcp` (`mcp-worker/wrangler.toml`)                                                                      |
| Planned URL                 | Not recorded. Docs only show the placeholder `https://kinun-mcp.<your-subdomain>.workers.dev`                 |
| Bindings in config          | None (no KV, D1, or Durable Objects)                                                                          |
| Plain var in config         | `FIREBASE_PROJECT_ID = "kinun-ae894"`                                                                         |
| Optional var (comment only) | `HOUSEHOLD_ID` — only if more than one household exists                                                       |
| Health endpoint             | None. The worker's `GET /` returns a short 200 text; MCP is `POST /mcp` (Bearer token) or `POST /mcp/<token>` |
| CI for the worker           | None (manual `wrangler deploy` only; unit tests run in root `npm test`)                                       |

Probes of `https://kinun-mcp.yishaik.workers.dev` and `https://kinun-mcp.workers.dev` failed TLS (host not live).

The Settings card is **not** a page on the Worker. It is part of the PWA (Settings). The app is live; using the card as an allowlisted user still needs a deployed worker URL and token.

## Secret and variable names only

Never commit or paste values.

**Cloudflare Worker secrets** (set with `npx wrangler secret put <NAME>` after the worker exists):

- `MCP_TOKEN`
- `GOOGLE_SERVICE_ACCOUNT` (the service-account JSON, as one string)

**Optional Worker var:** `HOUSEHOLD_ID`

**GitHub Actions**, for `.github/workflows/deploy.yml` (active):

- Repository variable: `FIREBASE_PROJECT_ID` (value is the already-public project id `kinun-ae894`)
- Repository secret: `FIREBASE_SERVICE_ACCOUNT`

**Local PWA optional env** (`.env.example`; not a secret): `VITE_MCP_URL` prefills Settings → סוכני AI.

The Worker is not deployed on the accessible accounts, so live secret _names_ on Cloudflare could not be listed.

## How to run and test locally

Node 22 (`nvm use`). From the repo root:

```bash
npm ci
npm run dev:demo    # http://localhost:5173 — LocalStore, no Firebase
npm run check       # typecheck + lint + unit tests (includes mcp-worker/src/**/*.test.ts)
npm run test:e2e    # Playwright, phone viewport, demo mode (locally: PW_CHANNEL=chrome if you have Chrome)
npm run test:rules  # Firestore emulator; needs Java 21+
npm run check:links # every URL in content (and some source strings)
npm run build       # production PWA build
```

Against real Firebase locally: copy `.env.example` → `.env.local` and fill it in ([SETUP-FIREBASE.md](SETUP-FIREBASE.md)).

MCP worker locally (no production deploy):

```bash
cd mcp-worker
# create .dev.vars with MCP_TOKEN and GOOGLE_SERVICE_ACCOUNT (gitignored)
npx wrangler dev    # http://localhost:8787/mcp
```

Worker tests run in-memory via root `npm test`; they do not need Firestore or the network.

## How to deploy the PWA

**Auto-deploy is active.** A push to `main` that is not docs-only runs `.github/workflows/deploy.yml` (Hosting only). `workflow_dispatch` can also run it. **Do not trigger extra deploys unless the user asks** — the couple uses the live app, and Actions minutes should not be wasted.

Firestore rules and indexes are not part of that workflow. If those files change, deploy them manually after the user asks:

```bash
firebase deploy --project kinun-ae894 --only firestore
```

A full manual Hosting+rules deploy is still possible (`npm run build` then `firebase deploy --project kinun-ae894`). Simplest place: Google Cloud Shell. Step-by-step: [SETUP-FIREBASE.md](SETUP-FIREBASE.md).

## How to deploy the MCP worker

**Not done yet. Do not deploy unless the user asks.** Full first-time setup (service account with _only_ Cloud Datastore User, secrets, `wrangler deploy`, how to connect an agent): [MCP.md](MCP.md).

Short version, once secrets are ready, from `mcp-worker/`:

```bash
npx wrangler secret put MCP_TOKEN
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT
npx wrangler deploy
```

Wrangler prints a `https://kinun-mcp.<subdomain>.workers.dev` URL. After a real deploy: put that URL in this file, and optionally set `VITE_MCP_URL` for the next PWA build. Tracked as [YIS-229](https://linear.app/yishaik/issue/YIS-229/פריסת-שרת-ה-mcp-ל-cloudflare).

## Known issues

1. **MCP worker not deployed** — see above. [YIS-229](https://linear.app/yishaik/issue/YIS-229/פריסת-שרת-ה-mcp-ל-cloudflare)
2. **Weekly link check failed** on 22 November 2026, 15:26 Asia/Jerusalem (`npm run check:links` on `main` @ `7e6fe31`).  
   Log: https://github.com/yishaik/Kinun/actions/runs/45027490397  
   Result: 67 links — 36 ok, 30 warnings, **1 broken** (the broken link failed the job):
   - Broken (✗ **404**): https://www.gov.il/BlobFolder/guide/medical-departments-units/he/maternity-v6-digital-1.pdf
   - Warning `ERR_INVALID_URL`: placeholder `https://kinun-mcp.….workers.dev` (Settings card, not a real URL)
   - Warnings **403** from gov.il, Kol Zchut, maternity.sheba.co.il, hospitals.clalit.co.il, and israelhayom (likely bot blocking)
   - Warning **503**: https://www.sheba.co.il/pregnancy/clinics/maternity-triage-er  
     Tracked as [YIS-231](https://linear.app/yishaik/issue/YIS-231/תיקון-בדיקת-הקישורים-שנכשלה)
3. **[PR #2](https://github.com/yishaik/Kinun/pull/2) is a draft** (CI concurrency for `deploy.yml` only). Its base is `2034e47`, behind current `main`. `deploy.yml` on `main` now already has `concurrency` with `cancel-in-progress: true`, so this PR may be largely superseded. Do not merge or close it unasked; check with the user. [YIS-232](https://linear.app/yishaik/issue/YIS-232/עדכון-pr-2-מול-main)
4. **Leftover branch** `private-ios-redesign` remains after [PR #1](https://github.com/yishaik/Kinun/pull/1) was merged (21 November 2026). Do not delete branches unless asked. [YIS-233](https://linear.app/yishaik/issue/YIS-233/ניקוי-ענף-private-ios-redesign)
5. Repo had no GitHub description or `homepage` at verification time (the live URL exists). No license.

There were no open GitHub issues that were not pull requests.

## Next steps (Linear)

Project: https://linear.app/yishaik/project/kinun-df7da462d385

**Done**

- [YIS-238](https://linear.app/yishaik/issue/YIS-238) — עיצוב מחדש ולוגו חדש בסגנון תינוקות ([PR #4](https://github.com/yishaik/Kinun/pull/4), squash `ff9681b`). Live on Hosting as of 22 November 2026, 23:23 Asia/Jerusalem.
- [YIS-230](https://linear.app/yishaik/issue/YIS-230/הפעלת-פריסה-אוטומטית-ל-firebase-hosting) — הפעלת פריסה אוטומטית ל-Firebase Hosting (variable `FIREBASE_PROJECT_ID`, secret `FIREBASE_SERVICE_ACCOUNT`; first run https://github.com/yishaik/Kinun/actions/runs/45071745046).
- [YIS-243](https://linear.app/yishaik/issue/YIS-243) … [YIS-248](https://linear.app/yishaik/issue/YIS-248) — content bundles (PRs #5–#9, #12), including the week timeline on the home card and `/journal`.
- [YIS-249](https://linear.app/yishaik/issue/YIS-249) — ג'ירפה מגיבה, חגיגת קטגוריה, חיות ואנימציות ([PR #10](https://github.com/yishaik/Kinun/pull/10), squash `a7daea6`).
- [YIS-250](https://linear.app/yishaik/issue/YIS-250) — מצב לילה רך עם מתג בהגדרות ([PR #11](https://github.com/yishaik/Kinun/pull/11), squash `24d6584`).
- [YIS-251](https://linear.app/yishaik/issue/YIS-251) — מסך כניסה אישי לישי וליסיה (this PR; photo stored on-device only).

**Todo**

- [YIS-229](https://linear.app/yishaik/issue/YIS-229/פריסת-שרת-ה-mcp-ל-cloudflare) — פריסת שרת ה-MCP ל-Cloudflare
- [YIS-231](https://linear.app/yishaik/issue/YIS-231/תיקון-בדיקת-הקישורים-שנכשלה) — תיקון בדיקת הקישורים שנכשלה
- [YIS-232](https://linear.app/yishaik/issue/YIS-232/עדכון-pr-2-מול-main) — עדכון PR #2 מול main (may be superseded; see Known issues)
- [YIS-233](https://linear.app/yishaik/issue/YIS-233/ניקוי-ענף-private-ios-redesign) — ניקוי ענף private-ios-redesign

**Backlog** (from [ROADMAP.md](ROADMAP.md) "Next")

- [YIS-234](https://linear.app/yishaik/issue/YIS-234/תזכורות-web-push) — תזכורות Web Push
- [YIS-235](https://linear.app/yishaik/issue/YIS-235/יומן-תינוק) — יומן תינוק
- [YIS-236](https://linear.app/yishaik/issue/YIS-236/ייצוא-ליומן) — ייצוא ליומן
- [YIS-237](https://linear.app/yishaik/issue/YIS-237/רענון-תוכן-ללא-דריסת-עריכות) — רענון תוכן ללא דריסת עריכות

Later roadmap ideas (hospital-specific lists, documents vault, budget view, roles, native apps, more languages, allowlist in Firestore) are in [ROADMAP.md](ROADMAP.md) and are not filed as issues yet.

## Links

- Repo: https://github.com/yishaik/Kinun
- Live PWA: https://kinun-ae894.web.app
- Agent entry: [AGENTS.md](../AGENTS.md)
- MCP: [MCP.md](MCP.md)
- Firebase setup: [SETUP-FIREBASE.md](SETUP-FIREBASE.md)
- Design screenshots (before/after): [design/](design/)
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Linear project: https://linear.app/yishaik/project/kinun-df7da462d385
