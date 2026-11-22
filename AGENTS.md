# AGENTS.md — working on Kinun (קינון)

Instructions for AI coding agents (Claude Code, Codex, Cursor, Jules, …) and humans.
Read this file first, then the doc that matches your task (see "Where to look").

## What this is

**Kinun** ("nesting" in Hebrew) is a shared birth-preparation app for a couple in the Tel Aviv area.
Both partners sign in with Google and see the same lists, synced in real time:

- **Tasks** (משימות) — what to do before the birth, at the hospital and in the first months, timed by pregnancy week / days after birth.
- **Gear** (ציוד) — baby and postpartum equipment with status (צריך / בדרך / יש / לא צריך).
- **Hospital bag** (תיק לידה) — packing checklist.
- **Labor mode** (לידה) — a shared contraction timer, call/navigate to the hospital, "when to go" guidance.
- **Links & phones** (קישורים) — rights, hospitals, health services, hotlines.

Everything is editable; the default content is researched from official Israeli sources (see docs/RESEARCH.md).

- **UI language: Hebrew, right-to-left.** Code, comments and developer docs: English. Docs written for the couple
  (README, docs/SETUP-FIREBASE.md, docs/RESEARCH.md) and all content/copy: Hebrew.
- **Platform:** installable PWA (iPhone + Android) — React 19 + Vite + TypeScript + Tailwind v4, Firebase Auth (Google) + Firestore.
- **Demo mode:** with no Firebase config the app runs on `LocalStore` (localStorage), which is also what tests use.

## Quick start

```bash
nvm use            # Node 22
npm ci
npm run dev:demo   # http://localhost:5173 — demo mode, no backend needed
npm run check      # typecheck + lint + unit tests (must pass before you finish)
npm run test:e2e   # Playwright, phone viewport, demo mode (locally: PW_CHANNEL=chrome if you have Chrome)
npm run build      # production build (PWA)
```

Against real Firebase locally: copy `.env.example` → `.env.local` and fill it in (docs/SETUP-FIREBASE.md).
Rules tests need the Firestore emulator (Java 21+): `npm run test:rules` (CI runs it).

## Repo map

```
src/
  main.tsx, App.tsx          boot, backend choice, auth/household gate, routes (HashRouter)
  index.css                  Tailwind v4 + design tokens (@theme) + building-block utilities
  content/                   DEFAULT CONTENT (seed): tasks.ts, gear.ts, bag.ts, links.ts, sources.ts, schema.ts
  lib/                       pure logic — types.ts, labels.ts (Hebrew names of every enum/category),
                             pregnancy.ts (date math), progress.ts (selectors), seed.ts, contractions.ts, format.ts
  data/                      DataStore interface (store.ts), FirebaseStore, LocalStore, session.tsx (context + useActions), toast.tsx
  components/                UI building blocks (ui.tsx, ItemSheet, rows, Layout, EggProgress, Sheet)
  pages/                     one file per screen
mcp-worker/                  remote MCP server (Cloudflare Worker): lets AI agents read/add/edit/tick items — docs/MCP.md
e2e/                         Playwright smoke test (demo mode)
firestore.rules              security rules  ← firestore-tests/rules.test.ts
docs/                        ARCHITECTURE, DATA-MODEL, CONTENT, RESEARCH, SETUP-FIREBASE, ROADMAP, MCP, HANDOFF
```

## Where to look

| Task                                             | Read                                       |
| ------------------------------------------------ | ------------------------------------------ |
| Change/add default tasks, gear, bag items, links | docs/CONTENT.md, docs/RESEARCH.md          |
| New field / collection / sharing behavior        | docs/DATA-MODEL.md (+ rules + rules tests) |
| New screen, navigation, state, offline, auth     | docs/ARCHITECTURE.md                       |
| Deploy / Firebase / Google sign-in problems      | docs/SETUP-FIREBASE.md                     |
| AI-agent access (MCP server, token, prompt)      | docs/MCP.md, mcp-worker/src/tools.ts       |
| Ideas for what to build next                     | docs/ROADMAP.md                            |
| Current status, deploy, known issues, handoff    | docs/HANDOFF.md                            |

## Rules of the road

1. **All data access goes through `DataStore`.** UI code calls `useActions()` / `useSession()` (src/data/session.tsx).
   Never import `firebase/*` outside `src/data/firebaseStore.ts` / `firebaseConfig.ts`.
2. **Keep both stores in sync.** Any new `DataStore` method must be implemented in `FirebaseStore` _and_ `LocalStore`,
   with a LocalStore unit test.
3. **Map, don't leak.** Firestore types (Timestamp, snapshots) never leave `firebaseStore.ts`; times are epoch ms.
4. **Writes are optimistic.** UI does not await writes (Firestore updates listeners from its local cache, also offline);
   errors surface via toast in `useActions`.
5. **Default content is data, not code.** Edit files in `src/content/`. Every health / rights / work fact needs a `source`.
   Never rename a `seedId`. Bump `CONTENT_VERSION` when adding seed entries. `src/content/content.test.ts` enforces this.
6. **Security rules are part of the feature.** Changing what is stored or who can see it ⇒ update `firestore.rules`
   and `firestore-tests/rules.test.ts`. **The app is private:** only the accounts in `src/lib/access.ts` (mirrored by
   `allowlist()` in `firestore.rules` — a unit test keeps them equal) may sign in or be added. Never widen it unasked.
7. **RTL first.** Use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) —
   not `left`/`right`. Phone numbers, emails and URLs get `dir="ltr"`.
8. **Design tokens only (iOS look).** Colors come from `@theme` in `src/index.css` — semantic names mapped to Apple's
   system colors, with light **and** dark values (`shell` = grouped background, `paper` = cell/card, `twig`/`twig-soft` =
   label/secondary label, `line` = separator, `fill`, `robin` = tint, `leaf` = done, `straw` = due soon, `brick` =
   overdue/destructive, `night` = labor mode). Type uses the iOS scale utilities (`text-large-title`, `text-title3`,
   `text-headline`, `text-body`, `text-subhead`, `text-footnote`, `text-caption`…). Lists are inset-grouped
   (`<Section>` / `shelf ios-list`), big titles use `<PageTitle>`. No raw hex in components; check both color schemes.
9. **Accessibility.** Touch targets ≥ 44px, every input has a label, icons are `aria-hidden` with text or `aria-label`,
   respect `prefers-reduced-motion`.
10. **Hebrew copy.** Plain verbs, sentence case, short. Gender-inclusive with slashes where needed (`נולד/ה`, `בן/בת הזוג`).
    Don't put medical advice in UI strings — put it in content with a source, phrased as "according to …, ask your team".
11. **No secrets in git.** The Firebase web config is not secret, but service-account keys are — they live in GitHub secrets only.
12. **The service worker must never handle `/__/*`** (Firebase Hosting's auth handler and init.json). See `vite.config.ts`.
13. **The MCP worker bypasses security rules** (it uses a service account), so `mcp-worker/src/tools.ts` must validate every write
    the way `itemIsValid` does. Changing item fields ⇒ update the worker's tools and tests too. It never deletes. Its token and
    the service-account key are secrets (Cloudflare secrets only — never in git, never in chat).
14. **Keep `docs/HANDOFF.md` current.** When deployments, URLs, secret or variable *names*, known issues, or next steps change,
    update that file in the same change. Never put secret *values* in the repo, in chat, or in HANDOFF.md.

## Definition of done

- `npm run check` passes; `npm run build` passes.
- UI change ⇒ `npm run test:e2e` passes; update `e2e/smoke.spec.ts` if a flow changed. Take a look at the screen at phone width
  (`SCREENSHOTS=1 npm run test:e2e` writes PNGs to `test-results/screens/`) — in light and dark mode.
- Data/rules change ⇒ rules tests updated (they run in CI).
- Docs updated when behavior, structure or setup changes. Keep this file and `docs/HANDOFF.md` accurate.
- Don't deploy or change Firebase/GitHub settings unless the user asked.

## Production

- Firebase project `kinun-ae894` (Spark plan), Firestore `(default)` in `me-west1`, app at <https://kinun-ae894.web.app>.
  `.firebaserc` points at it. The couple uses this live — **deploy only when the user asks.**
- Deploy = `npm run build` + `firebase deploy --project kinun-ae894` (hosting + Firestore rules/indexes). The simplest place
  to run it is Google Cloud Shell, which has Node and the Firebase CLI and is already authenticated — see
  docs/SETUP-FIREBASE.md, step 6. Rules changes must be deployed too, or the app and the rules drift apart.
- Google sign-in on `web.app` depends on the OAuth web client listing `https://kinun-ae894.web.app/__/auth/handler`
  as a redirect URI (docs/SETUP-FIREBASE.md, step 3). A new domain (custom domain, new project) needs the same.

## Known constraints

- iOS: home-screen web apps keep their own storage — users sign in once inside the installed app.
- Google sign-in uses popup on desktop, redirect on mobile/standalone. On Firebase Hosting the app sets `authDomain`
  to its own host so redirects work in Safari (see `src/data/firebaseConfig.ts`).
- Free Spark plan is enough (two users, a few hundred documents).
