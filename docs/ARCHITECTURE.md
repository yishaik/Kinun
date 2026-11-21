# Architecture

## Goals that drove the design

1. **Works on both phones today** without app stores → installable **PWA**.
2. **Both partners see every change instantly**, including in a hospital with poor reception → **Firestore** realtime
   listeners + persistent offline cache.
3. **Google sign-in with near-zero setup** → **Firebase Auth** (Google provider is one toggle in the console).
4. **Cheap to run** → everything fits Firebase's free Spark plan.
5. **Easy for any coding agent to extend** → small, typed layers; one data boundary; a demo backend for tests.

## Stack

| Concern | Choice                                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), react-router 7 (`HashRouter`)                                                                      |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`), lucide-react icons, fonts Suez One + Assistant (self-hosted via Fontsource) |
| Build   | Vite 8, vite-plugin-pwa (Workbox `generateSW`, auto-update)                                                                       |
| Backend | Firebase Auth (Google), Cloud Firestore, Firebase Hosting                                                                         |
| Tests   | Vitest + Testing Library (unit/integration), Playwright (e2e, demo mode), `@firebase/rules-unit-testing` (emulator)               |

## Layers

```
 pages/*  components/*            ← React UI. Reads useSession(); writes only via useActions().
      │
 data/session.tsx                 ← SessionProvider: auth state, household subscription, items; useActions()
      │
 data/store.ts  (DataStore)       ← the ONE persistence/auth interface
   ├─ data/firebaseStore.ts       ← Firebase Auth + Firestore (realtime, offline cache)
   └─ data/localStore.ts          ← localStorage (demo mode, unit + e2e tests)
      │
 lib/*                            ← pure functions: date math, selectors, seed building, labels, formatting
 content/*                        ← default content (data only)
```

Backend selection (`data/firebaseConfig.ts → chooseBackend`):

1. Demo if `--mode demo`, `VITE_DEMO=true` or `?demo=1`.
2. `VITE_FIREBASE_*` env vars (local dev).
3. `/__/firebase/init.json` — served automatically by Firebase Hosting, so production needs **no config in the repo**.
4. Otherwise demo.

`FirebaseStore` is loaded with a dynamic `import()`, so demo builds never download the Firebase SDK.

## Data flow

- `SessionProvider` subscribes to auth → `watchHouseholdsForEmail(email)` → picks the active household
  (remembered in localStorage) → `watchHousehold` + `watchItems`.
- Subscription results are stored **with the key they belong to** (`{ id, items }`), and derived — never reset inside
  effects. This avoids flashing stale data when switching users/households.
- `useActions()` returns bound operations (`toggleDone`, `setGearStatus`, `addItem`, `deleteItem` + undo, contraction
  timer…). Writes are fire-and-forget; Firestore applies them to the local cache immediately (so the UI updates offline)
  and syncs later. Failures become toasts.
- Deleting a default-content item records its `seedId` in `household.dismissedSeedIds` so content updates won't
  re-add it (undo removes it again).

## Auth details (Google sign-in on phones)

- Desktop: `signInWithPopup`. Mobile browsers and installed (standalone) PWAs: `signInWithRedirect`.
- Safari/iOS block third-party storage, which breaks redirect sign-in when the auth helper lives on
  `<project>.firebaseapp.com`. When the app is served by Firebase Hosting, `chooseBackend` sets
  `authDomain = location.host`, so the helper (`/__/auth/handler`) is same-origin. This is Firebase's recommended fix.
- The service worker's navigation fallback explicitly excludes `/__/*` (see `vite.config.ts`) — otherwise the PWA would
  swallow the auth handler.
- iOS home-screen apps have storage separate from Safari → users sign in once inside the installed app.

## Sharing model

A household document has `memberEmails` (lower-case). Anyone signed in with a verified Google account whose email is in
the list can read/write the household and its sub-collections — enforced by `firestore.rules`. Inviting = adding an email
(Settings, or the onboarding form). The invitee's app finds the household through a live query, so it appears without a
refresh. Details: [DATA-MODEL.md](DATA-MODEL.md).

## Timeline logic (`lib/pregnancy.ts`, `lib/progress.ts`)

- Gestational age = 280 days before the due date; shown as `34+2`. All math is on calendar day numbers (no DST bugs).
- Task timing: `dueWeek` (end of that pregnancy week) or `dueDaysAfterBirth` (birth date + N; before the birth it's
  estimated from the due date).
- **Earlier-stage tasks:** if a task's due date had already passed when the task was added (e.g. the couple started at
  week 35), it is _not_ shown as overdue — it gets a quiet "(עבר)" label and a gentle "maybe you already did these?" link.
- Current phase: before week 34 → `pregnancy`; then `prebirth`; after the birth date → `hospital` (days 0–2),
  `firstWeeks` (≤ 42 days), `firstMonths`.

## Screens

| Route       | File                     | Notes                                                                       |
| ----------- | ------------------------ | --------------------------------------------------------------------------- |
| `/`         | `pages/HomePage.tsx`     | Egg progress hero, "מה עכשיו", progress, recent activity, "baby born" sheet |
| `/tasks`    | `pages/TasksPage.tsx`    | Phase sections, assignee filter, show-done toggle, FAB                      |
| `/gear`     | `pages/GearPage.tsx`     | Gear vs. hospital-bag tabs (`?tab=bag`), category sections                  |
| `/labor`    | `pages/LaborPage.tsx`    | Dark "night" theme; shared contraction timer; call/navigate                 |
| `/links`    | `pages/LinksPage.tsx`    | Search, tap-to-call                                                         |
| `/settings` | `pages/SettingsPage.tsx` | Household, hospital presets, members, content updates, backup, sign-out     |

Before a household exists: `SignInPage` → `OnboardingPage` (creates the household and copies the default content).

## Design

Concept: **"the nest"** — calm, practical, for tired people using one hand.

| Token                | Hex                   | Use                              |
| -------------------- | --------------------- | -------------------------------- |
| `shell`              | `#F3F6F2`             | app background (eggshell)        |
| `paper`              | `#FFFFFF`             | grouped lists ("shelves")        |
| `twig` / `twig-soft` | `#3A2F28` / `#6E625A` | text / secondary text            |
| `robin`              | `#237A74`             | primary actions, done, progress  |
| `straw`              | `#E2B33C`             | due soon, the contraction button |
| `brick`              | `#B8483A`             | overdue, urgent, stop            |
| `night`              | `#132B29`             | labor-mode background            |

- Type: **Suez One** for headings and the big week number; **Assistant** for everything else.
- One bold element per screen: the egg on Home, the contraction button in labor mode. Everything else is quiet lists.
- Color encodes status only. Motion only answers the user (check pop, sheet slide, breathing timer) and is disabled under
  `prefers-reduced-motion`.

## Decisions (short ADRs)

- **PWA over native.** iPhone native distribution needs an Apple developer account and builds; a PWA covers this couple's
  needs (offline, home-screen icon). Native wrappers (Capacitor) are on the roadmap.
- **Firebase over Supabase.** Built-in offline persistence and conflict-free realtime for free, and Google sign-in needs no
  OAuth client setup. The `DataStore` boundary keeps a future switch contained.
- **HashRouter.** Works on any static host and inside previews without rewrite rules.
- **Seed content copied into each household.** The couple owns and edits their copy; new default entries arrive through
  "content updates" (see [CONTENT.md](CONTENT.md)).
- **LocalStore demo backend.** Makes the app runnable with zero setup and makes tests deterministic.
