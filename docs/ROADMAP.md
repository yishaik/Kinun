# Roadmap — ideas for the next agent

Roughly by value for the couple. Each item says where to start.

## Next

1. **Reminders / push notifications** — "GBS test is due this week", "your partner checked X".
   Web Push works on Android and on iOS 16.4+ for home-screen apps. Firebase Cloud Messaging + a scheduled Cloud
   Function (needs the Blaze plan) or a tiny scheduled job elsewhere. Start: `lib/progress.ts → upcomingTasks`.
2. **Baby log for the first weeks** — feeds (left/right/bottle), wet/dirty diapers, sleep; a 24-hour summary for the
   Tipat Halav / pediatrician visit. New sub-collection `households/{id}/babylog` (+ rules + LocalStore). The seed task
   `task.home-feeding-log` can link to it.
3. **Calendar export** — `.ics` download (or Google Calendar API) for dated tasks and Tipat Halav appointments.
4. **Content refresh** — today only _new_ seed entries reach existing households. Add a per-entry content hash so
   corrected seed text can be offered as "updated text available" without overwriting the couple's edits.

## Later

- **Hospital-specific lists** — per-hospital bag/document lists and tours (extend `HOSPITAL_PRESETS` in
  `pages/SettingsPage.tsx` into content).
- **Documents vault** — photos of the pregnancy file, test results, discharge letters (Firebase Storage; note that new
  projects need the Blaze plan for Storage).
- **Budget view** — gear already has `price`; add totals per category and "bought by" tracking.
- **Roles** — "who is pregnant / partner" to pre-assign tasks like "notify the employer" or "partner days off".
- **Native apps** — wrap with Capacitor, switch Google sign-in to the native plugin, publish to the stores.
- **More languages** — all enum labels are already centralized in `lib/labels.ts`; extract page copy next.
- **Stricter sharing** — ✅ done: the app is private to an allowlist (`src/lib/access.ts` ↔ `allowlist()` in
  `firestore.rules`); nobody else can read, create or be added to a household. Still open: only the owner may change
  `memberEmails`, and an allowlist that lives in Firestore (an admin doc) instead of code, so adding a person doesn't
  need a redeploy.

## Content to keep fresh

See "Yearly maintenance" in [CONTENT.md](CONTENT.md). The weekly link-check workflow opens the door: when it fails,
find the new official page and update `src/content/sources.ts`.
