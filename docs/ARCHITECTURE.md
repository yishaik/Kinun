# Architecture

## Goals that drove the design

1. **Works on both phones today** without app stores → installable **PWA**.
2. **Both partners see every change instantly**, including in a hospital with poor reception → **Firestore** realtime
   listeners + persistent offline cache.
3. **Google sign-in with near-zero setup** → **Firebase Auth** (Google provider is one toggle in the console).
4. **Cheap to run** → everything fits Firebase's free Spark plan.
5. **Easy for any coding agent to extend** → small, typed layers; one data boundary; a demo backend for tests.

## Stack

| Concern | Choice                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), react-router 7 (`HashRouter`)                                                                          |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`), lucide-react icons, system font (SF on Apple) + Assistant fallback (Fontsource) |
| Build   | Vite 8, vite-plugin-pwa (Workbox `generateSW`, auto-update)                                                                           |
| Backend | Firebase Auth (Google), Cloud Firestore, Firebase Hosting                                                                             |
| Tests   | Vitest + Testing Library (unit/integration), Playwright (e2e, demo mode), `@firebase/rules-unit-testing` (emulator)                   |

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
  It requires `https://<host>/__/auth/handler` (and the origin) on the Google OAuth web client — Firebase only adds the
  `firebaseapp.com` ones automatically. See docs/SETUP-FIREBASE.md, step 3.
- The service worker's navigation fallback explicitly excludes `/__/*` (see `vite.config.ts`) — otherwise the PWA would
  swallow the auth handler.
- iOS home-screen apps have storage separate from Safari → users sign in once inside the installed app.

## Sharing model

**Kinun is private.** Only the Google accounts in the allowlist (`src/lib/access.ts`, mirrored by `allowlist()` in
`firestore.rules`; a unit test keeps them equal) can do anything at all. On top of that, a household document has
`memberEmails` (lower-case, a subset of the allowlist). A verified, allowlisted account whose email is in the list can
read/write the household and its sub-collections — enforced by `firestore.rules`. Inviting = adding an email
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
| `/`         | `pages/HomePage.tsx`     | Week widget + ring, "מה עכשיו", progress rings, recent activity, born sheet |
| `/tasks`    | `pages/TasksPage.tsx`    | Phase sections, assignee filter, show-done toggle, FAB                      |
| `/gear`     | `pages/GearPage.tsx`     | Gear vs. hospital-bag tabs (`?tab=bag`), category sections                  |
| `/labor`    | `pages/LaborPage.tsx`    | Dark "night" theme; shared contraction timer; call/navigate                 |
| `/links`    | `pages/LinksPage.tsx`    | Search, tap-to-call                                                         |
| `/settings` | `pages/SettingsPage.tsx` | Household, hospital presets, members, content updates, backup, sign-out     |

Before a household exists: `SignInPage` → `OnboardingPage` (creates the household and copies the default content).
A Firebase sign-in that is not on the allowlist (`lib/access.ts`) gets `PrivatePage` (session status `not-allowed`)
instead — no Firestore listener is even started for it. The "demo mode" button is shown only in dev, `--mode demo`
builds or with `?demo` (`demoEntryAllowed()`); a production build without Firebase config says it isn't configured.

## Design

Concept: **"a native iOS app"** — calm, practical, for tired people using one hand. It should feel like Apple's own apps
(Reminders, Health, Clock) on an iPhone, in light and dark mode, and still look right on Android.

**Color tokens** (`@theme` in `src/index.css`). Names are semantic and stable; values follow Apple's system colors and switch
with `prefers-color-scheme` (`.theme-dark` forces dark on a subtree — labor mode; `.elevated` gives sheets the lighter
"elevated" grays in dark mode).

| Token                           | iOS equivalent                    | Light / Dark                   | Use                                |
| ------------------------------- | --------------------------------- | ------------------------------ | ---------------------------------- |
| `shell`                         | systemGroupedBackground           | `#F2F2F7` / `#000000`          | app background                     |
| `paper`                         | secondarySystemGroupedBackground  | `#FFFFFF` / `#1C1C1E`          | list sections, widgets, fields     |
| `fill` / `fill-strong`          | tertiary / secondary systemFill   | gray @ 12% / 24%               | search field, segmented track      |
| `twig` / `twig-soft` / `-faint` | label / secondaryLabel / tertiary | black / white, 60%, 30%        | text, secondary text, chevrons     |
| `line`                          | separator                         | 29% / 65% gray                 | 0.5px hairlines                    |
| `robin`                         | tint (refined teal)               | `#0A7C8A` / `#3FC1D2`          | primary actions, links, progress   |
| `leaf`                          | systemGreen                       | `#34C759` / `#30D158`          | done (check circles), call buttons |
| `straw`                         | systemOrange                      | `#FF9500` / `#FF9F0A`          | due soon                           |
| `brick`                         | systemRed                         | `#FF3B30` / `#FF453A`          | overdue, destructive, stop         |
| `night`, `night-2`, `night-3`   | labor mode (always dark)          | `#000` / `#1C1C1E` / `#2C2C2E` | labor background and tiles         |

`*-soft` are tinted fills for chips; `*-ink` are the accessible text versions of a status color on those fills;
`on-robin` is text on a tint button (white in light, near-black on the brighter dark-mode teal).

**Type:** system font first (`-apple-system`, `SF Pro`), then Assistant (Hebrew-friendly) where there is no SF —
Android/Windows. iOS Dynamic Type scale as utilities: `text-large-title` 34/41 bold, `text-title1` 28, `text-title2` 22,
`text-title3` 20, `text-headline` 17 semibold, `text-body` 17, `text-subhead` 15, `text-footnote` 13, `text-caption` 12.

**Building blocks** (`components/ui.tsx`, `Layout.tsx`, `Sheet.tsx`):

- `Layout` — translucent nav bar (`material`: `backdrop-filter: blur(20px) saturate(180%)`, hairline bottom border once
  scrolled) that shows a compact centered title when the page's `<PageTitle>` large title scrolls under it; frosted tab
  bar with SF-style line icons, active tint, `safe-area-inset-bottom`.
- `Section` — inset-grouped list (12px radius, footnote header/footer, 0.5px separators inset from the leading edge via
  `ios-list` + `--sep-inset`). Rows ≥ 44pt, chevrons where tappable, `row-tap` highlight.
- `CheckCircle` (round, green fill with a drawn check), `Switch`, `Segmented` (tabs or radio filters), `SearchField`,
  `Ring` (activity-ring progress), `widget` cards (20px radius, soft shadow in light, elevated gray in dark).
- `Sheet` — bottom sheet with grabber, 16px top radius, dimmed backdrop, spring-like slide-up.
- Toasts — one small capsule HUD at the top; a new toast replaces the old one; ~2s (5s with an "undo" action).

**Rules of thumb:** one bold element per screen (the week widget on Home, the stopwatch button in labor mode); everything
else is quiet grouped lists. Color encodes status only. Motion only answers the user (press scale .97, check, sheet,
breathing timer) and is turned off under `prefers-reduced-motion`.

## Decisions (short ADRs)

- **PWA over native.** iPhone native distribution needs an Apple developer account and builds; a PWA covers this couple's
  needs (offline, home-screen icon). Native wrappers (Capacitor) are on the roadmap.
- **Firebase over Supabase.** Built-in offline persistence and conflict-free realtime for free, and Google sign-in needs no
  OAuth client setup. The `DataStore` boundary keeps a future switch contained.
- **HashRouter.** Works on any static host and inside previews without rewrite rules.
- **Seed content copied into each household.** The couple owns and edits their copy; new default entries arrive through
  "content updates" (see [CONTENT.md](CONTENT.md)).
- **LocalStore demo backend.** Makes the app runnable with zero setup and makes tests deterministic.
