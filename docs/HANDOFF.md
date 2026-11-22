# Kinun handoff

Last verified: 22 November 2026, 23:23, Asia/Jerusalem (UTC+2).

This file is the current-status snapshot for coding agents and anyone continuing the work. Facts below were checked against the repo at `b7f5b90` on `main`, the live PWA after the first auto-deploy, Wrangler on two Cloudflare accounts (earlier the same day), and Linear team Yishaik (YIS). Inferred items are marked. **Never put secret values in this file, in git, or in chat** — names only.

When something here changes (deploy, URL, known issue, next step), update this file in the same change. See AGENTS.md rule 14.

## What this is

**Kinun** (קינון, Hebrew for "nesting") is a private, Hebrew, right-to-left PWA for a couple preparing for birth in the Tel Aviv area: tasks timed by pregnancy week / days after birth, a gear list, a hospital-bag checklist, a shared labor-mode contraction timer, and official links and hotlines. Both partners sign in with Google; lists sync in real time via Firestore. Only allowlisted accounts (`src/lib/access.ts`, mirrored by `allowlist()` in `firestore.rules`) can sign in or be added.

Stack: React 19 + Vite + TypeScript + Tailwind v4, Firebase Auth (Google) + Firestore. Repo: https://github.com/yishaik/Kinun (public; created 21 November 2026, 15:51 Asia/Jerusalem). Default branch: `main`.

A remote MCP server (`mcp-worker/`) lets an AI agent read, add, edit, and mark items done (no delete; no access to labor contractions, household settings, or members). Settings in the PWA has a **סוכני AI** card for the worker URL and token (stored in that device's `localStorage` only). See [MCP.md](MCP.md).

## Current status (verified 22 November 2026, 23:23)

- App code on `main` at the Hosting deploy: [`b7f5b90`](https://github.com/yishaik/Kinun/commit/b7f5b90b573e3a72c27c425bec86e0684952dda5) (22 November 2026, 22:51 Asia/Jerusalem) — docs after the jungle-nursery redesign with the baby-giraffe mark ([PR #4](https://github.com/yishaik/Kinun/pull/4), squash [`ff9681b`](https://github.com/yishaik/Kinun/commit/ff9681bb4ba177f0ae3b555975292f320abe6b4b)).
- Immediately before the redesign: [`b33a648`](https://github.com/yishaik/Kinun/commit/b33a64887ed828f5608aad06853179a2fb044f96) — docs handoff ([PR #3](https://github.com/yishaik/Kinun/pull/3)).
- The giraffe redesign **is live** at https://kinun-ae894.web.app. First auto-deploy (workflow_dispatch): success — https://github.com/yishaik/Kinun/actions/runs/45071745046 (22 November 2026, 23:23 Asia/Jerusalem).
- GitHub Actions auto-deploy to Firebase Hosting is **active**. Repo variable `FIREBASE_PROJECT_ID` and repo secret `FIREBASE_SERVICE_ACCOUNT` are set (names only). Pushes to `main` deploy Hosting unless the change is docs-only (`**.md`, `docs/**`, `.github/ISSUE_TEMPLATE/**`). `deploy.yml` builds and deploys; it does not re-run unit tests (CI already does). Both `deploy.yml` and `ci.yml` use `concurrency` with `cancel-in-progress: true`.
- MCP Worker `kinun-mcp` is **not deployed** on the two Cloudflare accounts Wrangler can see (`Yishai.k@gmail.com` and `Yishai.kaminsky@mail.tab.bot`). Other known workers on the gmail account *are* visible, so this is a real absence there, not a permissions miss on those accounts. A third Cloudflare account, if any, was not visible.
- Linear project: [Kinun](https://linear.app/yishaik/project/kinun-df7da462d385). The giraffe redesign is [YIS-238](https://linear.app/yishaik/issue/YIS-238) (Done). Auto-deploy is [YIS-230](https://linear.app/yishaik/issue/YIS-230) (Done).

## Deployments and URLs

### PWA — Firebase Hosting (live)

| | |
| --- | --- |
| Firebase project | `kinun-ae894` (Spark; `.firebaserc` points here) |
| Firestore | `(default)` in `me-west1` |
| Live app | https://kinun-ae894.web.app (also https://kinun-ae894.firebaseapp.com — same site) |
| Auth / init | https://kinun-ae894.web.app/__/firebase/init.json is live; `authDomain` is `kinun-ae894.firebaseapp.com` |
| Custom domain | None verified. Probes of `kinun.app`, `www.kinun.app`, and `kinun.yishaik.com` failed TLS; `kinun.web.app` returned 404. |

A live fetch of the Hosting manifest and icons at 23:23 Asia/Jerusalem on 22 November 2026 **matched** the giraffe redesign on `main` @ `b7f5b90`:

- Live `theme_color` / `background_color`: `#F6F1E6`
- `/favicon-32.png` is served as `image/png` (PNG magic bytes; 2228 bytes)
- Live `pwa-192.png` is 54597 bytes, same size as `public/pwa-192.png` on `main`
- Hosting `Last-Modified`: 22 November 2026, 23:23 Asia/Jerusalem (UTC+2) (`Sun, 22 Nov 2026 21:23:07 GMT`)

GitHub Actions `Deploy to Firebase Hosting` is **on**. The successful first run was https://github.com/yishaik/Kinun/actions/runs/45071745046 (workflow_dispatch on `main` @ `b7f5b90`). Subsequent pushes to `main` that are not docs-only will deploy automatically. Firestore rules and indexes are **not** deployed by this workflow; those still need a manual `firebase deploy --only firestore`.

### MCP Worker — not live

| | |
| --- | --- |
| Planned worker name | `kinun-mcp` (`mcp-worker/wrangler.toml`) |
| Planned URL | Not recorded. Docs only show the placeholder `https://kinun-mcp.<your-subdomain>.workers.dev` |
| Bindings in config | None (no KV, D1, or Durable Objects) |
| Plain var in config | `FIREBASE_PROJECT_ID = "kinun-ae894"` |
| Optional var (comment only) | `HOUSEHOLD_ID` — only if more than one household exists |
| Health endpoint | None. The worker's `GET /` returns a short 200 text; MCP is `POST /mcp` (Bearer token) or `POST /mcp/<token>` |
| CI for the worker | None (manual `wrangler deploy` only; unit tests run in root `npm test`) |

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

The Worker is not deployed on the accessible accounts, so live secret *names* on Cloudflare could not be listed.

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

**Not done yet. Do not deploy unless the user asks.** Full first-time setup (service account with *only* Cloud Datastore User, secrets, `wrangler deploy`, how to connect an agent): [MCP.md](MCP.md).

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
