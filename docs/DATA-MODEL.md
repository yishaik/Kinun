# Data model

TypeScript source of truth: `src/lib/types.ts`. Firestore mapping: `src/data/firebaseStore.ts`.
Security: `firestore.rules` (tests: `firestore-tests/rules.test.ts`).

## Collections

```
households/{householdId}
households/{householdId}/items/{itemId}
households/{householdId}/contractions/{contractionId}
```

### `households/{householdId}`

| Field                    | Type                                           | Notes                                                              |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| `name`                   | string (1–100)                                 | "הבית שלנו"                                                        |
| `ownerUid`               | string                                         | creator; can't be changed; only the owner can delete the household |
| `memberEmails`           | string[] (1–10)                                | lower-cased Google emails allowed in — **this is the access list** |
| `members`                | map uid → `{ name, email, photoURL }`          | display profiles, written by each member on first open             |
| `dueDate`                | `YYYY-MM-DD` \| null                           | estimated due date                                                 |
| `birthDate`              | `YYYY-MM-DD` \| null                           | set by "התינוק/ת נולד/ה" — switches the app to after-birth mode    |
| `babyName`               | string \| null                                 |                                                                    |
| `hospital`               | `{ name, phone, address, url, notes }` \| null | used by labor mode (call / navigate)                               |
| `contentVersion`         | number                                         | last `CONTENT_VERSION` merged in                                   |
| `dismissedSeedIds`       | string[]                                       | default entries deleted on purpose (not re-offered)                |
| `createdAt`, `updatedAt` | timestamp                                      | server time                                                        |

### `items/{itemId}` — tasks, gear, bag items and links in one collection

Common fields:

| Field                                       | Type                                  | Notes                                                                     |
| ------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `kind`                                      | `'task' \| 'gear' \| 'bag' \| 'link'` | which list                                                                |
| `title`                                     | string (1–300)                        |                                                                           |
| `notes`                                     | string (≤ 5000)                       | free text, shown in the item sheet                                        |
| `category`                                  | string                                | key from `src/lib/labels.ts` or a user-defined name                       |
| `phase`                                     | `PhaseKey`                            | `pregnancy`, `prebirth`, `labor`, `hospital`, `firstWeeks`, `firstMonths` |
| `done`                                      | boolean                               | task done / gear acquired-or-skipped / bag packed                         |
| `order`                                     | number                                | sort order inside its group                                               |
| `links`                                     | `{ label, url }[]`                    |                                                                           |
| `source`                                    | string \| null                        | citation URL (default content)                                            |
| `seedId`                                    | string \| null                        | id of the default-content entry it came from                              |
| `assignee`                                  | `'both'` \| uid \| null               | tasks (and optionally gear/bag)                                           |
| `createdAt/By`, `updatedAt/By`, `doneAt/By` | timestamp / uid                       | for the activity feed                                                     |

Kind-specific:

| Kind | Fields                                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| task | `dueWeek` (number \| null), `dueDaysAfterBirth` (number \| null), `priority: 'optional' \| null`                                  |
| gear | `gearStatus: 'need' \| 'ordered' \| 'have' \| 'skip'`, `priority: 'must' \| 'nice' \| 'optional'`, `quantity` (text), `price` (₪) |
| bag  | `priority`, `quantity`                                                                                                            |
| link | `url`, `phone` (dialable, e.g. `*5400`, `03-6925633`)                                                                             |

Invariant: for gear, `done === (gearStatus === 'have' || gearStatus === 'skip')`. Always write both
(`useActions().setGearStatus` does).

### `contractions/{contractionId}`

| Field       | Type                                    |
| ----------- | --------------------------------------- |
| `start`     | number (epoch ms, client clock)         |
| `end`       | number \| null (null while in progress) |
| `createdBy` | uid                                     |

## Security rules (summary)

- Signed-in users with a **verified** email (Google accounts always are).
- A household is readable/writable by users whose email is in `memberEmails`; the app's query
  `where('memberEmails', 'array-contains', email)` is allowed for exactly those docs.
- Create: you must be the `ownerUid` and be in `memberEmails`. Update: anything except `ownerUid` / `createdAt`.
  Delete: owner only.
- `items` / `contractions`: members only; items are validated (`kind`, `title`, `notes`, `done`).

## Changing the model — checklist

1. `src/lib/types.ts` (+ defaults in `ItemSheet`/`seed.ts` if user-editable).
2. `FirebaseStore` mapping (`toItem` / `toHousehold`) **and** `LocalStore`.
3. `firestore.rules` if the field is validated or affects access, plus `firestore-tests/rules.test.ts`.
4. Old documents won't have the field — always read with a default (`?? null`).
5. Update this file.
