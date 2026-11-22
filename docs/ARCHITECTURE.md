# Architecture

## Goals that drove the design

1. **Works on both phones today** without app stores → installable **PWA**.
2. **Both partners see every change instantly**, including in a hospital with poor reception → **Firestore** realtime
   listeners + persistent offline cache.
3. **Google sign-in with near-zero setup** → **Firebase Auth** (Google provider is one toggle in the console).
4. **Cheap to run** → everything fits Firebase's free Spark plan.
5. **Easy for any coding agent to extend** → small, typed layers; one data boundary; a demo backend for tests.

## Stack

| Concern | Choice                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), react-router 7 (`HashRouter`)                                                                                             |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`), lucide-react icons, Varela Round (wordmark and large titles) + Assistant Variable (UI, Fontsource) |
| Build   | Vite 8, vite-plugin-pwa (Workbox `generateSW`, auto-update)                                                                                              |
| Backend | Firebase Auth (Google), Cloud Firestore, Firebase Hosting                                                                                                |
| Tests   | Vitest + Testing Library (unit/integration), Playwright (e2e, demo mode), `@firebase/rules-unit-testing` (emulator)                                      |

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

| Route         | File                         | Notes                                                                                            |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `/`           | `pages/HomePage.tsx`         | Gestation/age ring, reactive giraffe, "השבוע שלכם" teaser, "מה עכשיו", progress, recent activity |
| `/tasks`      | `pages/TasksPage.tsx`        | Group by category (default) or phase, animal marks, assignee filter, FAB                         |
| `/gear`       | `pages/GearPage.tsx`         | Gear vs. hospital-bag tabs (`?tab=bag`), category animals, bag 100% celebration                  |
| `/labor`      | `pages/LaborPage.tsx`        | Dark-room theme (not jungle night); shared contraction timer; call/navigate                      |
| `/links`      | `pages/LinksPage.tsx`        | Search, tap-to-call                                                                              |
| `/week`       | `pages/WeekPage.tsx`         | "השבוע שלכם" excerpts (baby / mom)                                                               |
| `/warnings`   | `pages/WarningsPage.tsx`     | Warning signs                                                                                    |
| `/more`       | `pages/MorePage.tsx`         | Hub to the tools below                                                                           |
| `/stages`     | `pages/LaborStagesPage.tsx`  | Labor stages and pain relief                                                                     |
| `/glossary`   | `pages/GlossaryPage.tsx`     | Glossary                                                                                         |
| `/kicks`      | `pages/KicksPage.tsx`        | Shared kick counter                                                                              |
| `/birth-plan` | `pages/BirthPlanPage.tsx`    | Birth-plan builder (`/birth-plan/print` for a printable sheet)                                   |
| `/questions`  | `pages/QuestionsPage.tsx`    | Questions for the doctor                                                                         |
| `/names`      | `pages/NamesPage.tsx`        | Baby-name list with partner votes                                                                |
| `/partner`    | `pages/PartnerGuidePage.tsx` | Birth-partner guide                                                                              |
| `/breathing`  | `pages/BreathingPage.tsx`    | Breathing pacer                                                                                  |
| `/settings`   | `pages/SettingsPage.tsx`     | Appearance, household, hospital, members, content updates, backup, sign-out                      |

Before a household exists: `SignInPage` → `OnboardingPage` (creates the household and copies the default content).
The sign-in screen greets «שלום ישי וליסיה» and offers an optional nursery or ultrasound photo, or a placeholder
illustration. That photo is stored **only in IndexedDB on the device** (`src/lib/localPhoto.ts`) — the Spark plan
has no Firebase Storage, and the image is never uploaded. A Firebase sign-in that is not on the allowlist
(`lib/access.ts`) gets `PrivatePage` (session status `not-allowed`) instead — no Firestore listener is even started
for it. The "demo mode" button is shown only in dev, `--mode demo` builds or with `?demo` (`demoEntryAllowed()`);
a production build without Firebase config says it isn't configured.

## Design

Concept: **"a shared nest"** — still a one-handed, practical phone app (iOS layout, large type, grouped lists), but the
color, type, and mark come from the family's jungle nursery mural: cream wall, trunk-brown text, jungle green, a yellow
sun, and a painted baby giraffe as the PWA icon. Light appearance, a soft jungle-green night, and labor mode that stays
a dark room (warm black — not the jungle night).

**Color tokens** (`@theme` in `src/index.css`). Names are semantic and stable so components do not need raw hex; values
are the mural palette, tuned for WCAG 2.1 AA. Soft night (`data-theme="dark"`, shell `#10281C`, paper `#1B3A2A`, ink
`#F6F1E6`, robin `#8FDB6A`) follows the system `prefers-color-scheme` unless the user picks בהיר / לילה in Settings
(`kinun.appearance` in `localStorage`, see `src/lib/appearance.ts`). `.theme-dark` still forces the **labor dark room**
on that subtree and does not use the jungle-green night tokens. `.elevated` gives sheets a slightly lighter surface.

| Token                           | Light / Dark                                       | Use                                                    |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| `shell`                         | `#F6F1E6` / `#10281C`                              | app background (cream / jungle night)                  |
| `paper` / `paper-2`             | `#FFFDF8` / `#EFE8D6` · `#1B3A2A` night            | cards, fields, recessed fill                           |
| `fill` / `fill-strong`          | trunk brown @ 8% / 14% (inverted dark)             | search field, segmented track                          |
| `twig` / `twig-soft` / `-faint` | `#3C2A22` / `#6B5346` · cream / `#D5E0D4` in night | text, secondary text, chevrons                         |
| `line`                          | trunk / cream @ ~16%                               | 0.5px hairlines                                        |
| `robin`                         | `#287033` / `#8FDB6A`                              | primary actions, links, progress                       |
| `lagoon`                        | `#1E6F68` / `#4ECDBF`                              | secondary teal (decor, supporting accents)             |
| `sun` / `straw`                 | `#F5C93B` (decorative; ink `#8F6418`)              | sun / moon accent, due soon. Do not use `sun` for text |
| `leaf`                          | `#2A7335` / `#8FDB6A`                              | done (check circles), success                          |
| `brick`                         | `#B53824` / `#F0A090`                              | overdue, destructive, stop                             |
| `night`, `night-2`, `night-3`   | `#000` / `#1C1C1E` / `#2C2C2E`                     | labor-room background and tiles (not jungle night)     |

`*-soft` are tinted fills for chips; `*-ink` are the accessible text versions of a status color on those fills;
`on-robin`, `on-leaf`, and `on-danger` are text on solid fills (white in light, near-black on the lighter dark tints).

**Type:** Assistant Variable for UI (body, chrome, buttons). Varela Round (`font-display`) for the wordmark «קינון» and
large page titles (`PageTitle`). iOS Dynamic Type scale as utilities: `text-large-title` 34/41, `text-title1` 28,
`text-title2` 22, `text-title3` 20, `text-headline` 17 semibold, `text-body` 17, `text-subhead` 15, `text-footnote` 13,
`text-caption` 12. Large titles are rendered at weight 400 so Varela Round is not faux-bolded.

**Building blocks** (`components/ui.tsx`, `Layout.tsx`, `Sheet.tsx`):

- `Layout` — translucent nav bar (`material`: `backdrop-filter: blur(20px) saturate(180%)`, hairline bottom border once
  scrolled) that shows a compact centered title when the page's `<PageTitle>` large title scrolls under it; frosted tab
  bar with SF-style line icons, active tint, `safe-area-inset-bottom`.
- `Section` — inset-grouped list (12px radius, footnote header/footer, 0.5px separators inset from the leading edge via
  `ios-list` + `--sep-inset`). Rows ≥ 44pt, chevrons where tappable, `row-tap` highlight.
- `CheckCircle` (round, green fill with a drawn check and a short leaf burst), `Switch`, `Segmented` (tabs or radio
  filters), `SearchField`, `Ring` (activity-ring progress), `widget` cards (20px radius, soft shadow in light).
- `ReactiveGiraffe` — home companion; sleepy / smile / celebrate from combined checklist progress (`lib/giraffe.ts`).
- `CategoryMark` — animal portrait per list category; `PeekDecor` — a few `aria-hidden` animals peeking between
  sections (subtle, they must not cover titles).
- `Celebration` — one-time confetti + 100% badge when the hospital bag is complete (`kinun.celebrate.*` in `localStorage`).
- `Sheet` — bottom sheet with grabber, 16px top radius, dimmed backdrop, spring-like slide-up.
- Toasts — one small capsule HUD at the top; a new toast replaces the old one; ~2s (5s with an "undo" action).

**Rules of thumb:** one bold element per screen (the week widget and giraffe on Home, the stopwatch button in labor
mode); everything else is quiet grouped lists. Color encodes status only. Motion only answers the user (press scale
.97, leaf-burst check, button wiggle, sheet, nodding splash giraffe, bag celebration, breathing timer) and is turned
off or minimized under `prefers-reduced-motion`. Peeking animals are decorative only.

## Decisions (short ADRs)

- **PWA over native.** iPhone native distribution needs an Apple developer account and builds; a PWA covers this couple's
  needs (offline, home-screen icon). Native wrappers (Capacitor) are on the roadmap.
- **Firebase over Supabase.** Built-in offline persistence and conflict-free realtime for free, and Google sign-in needs no
  OAuth client setup. The `DataStore` boundary keeps a future switch contained.
- **HashRouter.** Works on any static host and inside previews without rewrite rules.
- **Seed content copied into each household.** The couple owns and edits their copy; new default entries arrive through
  "content updates" (see [CONTENT.md](CONTENT.md)).
- **LocalStore demo backend.** Makes the app runnable with zero setup and makes tests deterministic.
