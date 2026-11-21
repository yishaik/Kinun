# Default content (seed) — how to edit it

The lists a new household starts with live in `src/content/`:

| File         | What                                                  | Shape         |
| ------------ | ----------------------------------------------------- | ------------- |
| `tasks.ts`   | ~70 tasks across 6 phases                             | `SeedTask`    |
| `gear.ts`    | ~50 baby / home / postpartum items                    | `SeedGear`    |
| `bag.ts`     | ~35 hospital-bag items                                | `SeedBagItem` |
| `links.ts`   | ~40 links and phone numbers                           | `SeedLink`    |
| `sources.ts` | every external URL, named (`SRC.btlBirthGrant`…)      | —             |
| `schema.ts`  | the seed types                                        | —             |
| `index.ts`   | exports + `CONTENT_VERSION` + `CONTENT_RESEARCHED_AT` | —             |

Category keys and their Hebrew names are in `src/lib/labels.ts`.

## How content reaches users

- When a household is created, **all** seed entries are copied into it (`lib/seed.ts → buildSeedItems`).
  From then on the couple owns their copy — they can edit or delete anything.
- When you **add** seed entries and bump `CONTENT_VERSION`, existing households see
  "הוספת N פריטים חדשים מהתוכן המעודכן" in Settings (`missingSeedItems`). Entries they deleted
  (`dismissedSeedIds`) are not offered again.
- **Editing** the text of an existing seed entry only affects new households (existing copies are the couple's).
  If a fix matters for everyone, see "content refresh" in [ROADMAP.md](ROADMAP.md).

## Rules (enforced by `src/content/content.test.ts`)

1. `seedId` is unique, prefixed by kind (`task.`, `gear.`, `bag.`, `link.`) and **never renamed** after release.
2. `category` must be a known key for that kind (add new keys to `labels.ts` first).
3. Tasks: `dueWeek` only for `pregnancy`/`prebirth`; `dueDaysAfterBirth` only for `hospital`/`firstWeeks`/`firstMonths`; not both.
4. Any task in `health`, `rights` or `work` needs a `source` URL.
5. All URLs are `https://`; links need a `url` or a `phone`.
6. Titles ≤ 80 characters and unique within their list.

## Writing guidelines

- **Sources:** prefer gov.il, btl.gov.il, kolzchut.org.il, Ministry of Health circulars, health funds, hospitals, Beterem.
  Put the URL in `sources.ts` and reference it as `SRC.xxx`.
- **Facts that change** (amounts, registration windows) carry their year: "2,103 ₪ לילד ראשון (נכון ל-2026)".
- **Medical items** describe what the official source recommends and send people to their team for dosing/decisions.
  No doses in the app.
- **Hebrew style:** short imperative titles ("לארוז את תיק הלידה"), plain notes, gender-inclusive slashes where needed.
- Mark not-for-everyone tasks with `optional: true`.

## Adding an entry — checklist

1. Add the URL to `sources.ts` (if new) and the entry to the right file, in the right position (order = array order).
2. Bump `CONTENT_VERSION` in `index.ts`.
3. `npx vitest run src/content` and `npm run check:links`.
4. If it's a fact, add a line to [RESEARCH.md](RESEARCH.md) with the source and date.

## Yearly maintenance (every January)

Bituach Leumi updates amounts on January 1st. Re-check and update:
birth grant (`task.bank-details`, `task.home-birth-grant`), "חיסכון לכל ילד" deposit (`task.months-savings`),
and update `CONTENT_RESEARCHED_AT`. Also re-check the daycare registration window and the RSV season policy.
