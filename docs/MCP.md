# חיבור סוכני AI (שרת MCP)

שרת MCP קטן שמאפשר לסוכן AI (Claude, Cursor, Codex ועוד) לקרוא את הרשימות של קינון ולכתוב אליהן.
מה שהסוכן מוסיף או משנה מופיע מיד בטלפונים של שניכם.

השרת רץ כ-**Cloudflare Worker** (חינמי לשימוש כזה), מדבר עם Firestore בעזרת **חשבון שירות** של Google,
ומאובטח בטוקן סודי. הקוד נמצא בתיקייה `mcp-worker/`.

## מה הסוכן יכול ולא יכול

| כלי               | מה הוא עושה                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `get_overview`    | תאריך היום, תאריך משוער ותאריך לידה, שם התינוק/ת, בית חולים, ספירה לכל רשימה |
| `list_categories` | הקטגוריות והשלבים הקיימים (מפתח + שם בעברית)                                 |
| `list_items`      | רשימת פריטים עם מסננים: סוג, קטגוריה, שלב, בוצע, סטטוס ציוד, חיפוש טקסט      |
| `get_item`        | פריט אחד עם כל השדות                                                         |
| `add_item`        | הוספת משימה, פריט ציוד, פריט לתיק או קישור                                   |
| `update_item`     | שינוי שדות של פריט קיים (הסוג לא משתנה)                                      |
| `mark_done`       | סימון כבוצע או ביטול. בציוד: "יש" או "צריך"                                  |

**אין מחיקה**, ואין גישה למצב לידה (צירים), להגדרות הבית ולרשימת המשתמשים. הכתיבה מסומנת כ"סוכן" בפיד הפעילות.

## הקמה (פעם אחת)

### 1. חשבון שירות ל-Firestore

חשבון שירות עוקף את חוקי האבטחה של Firestore, ולכן נותנים לו רק את ההרשאה הדרושה ולא את חשבון ה-Admin הרגיל של Firebase.

1. ב-[Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=kinun-ae894) בפרויקט `kinun-ae894`: **Create service account**, בשם `kinun-mcp`.
2. בשלב ההרשאות בוחרים **Cloud Datastore User** (`roles/datastore.user`) ורק אותו.
3. נכנסים לחשבון החדש, **Keys → Add key → Create new key → JSON**. יורד קובץ. הוא סוד: לא ב-git ולא בצ'אט.

### 2. פרסום ב-Cloudflare

```bash
cd mcp-worker
npm install
npx wrangler login
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT   # מדביקים את כל תוכן קובץ ה-JSON
openssl rand -base64 48 | tr -d '/+=' | cut -c1-40   # מייצר טוקן. מעתיקים אותו
npx wrangler secret put MCP_TOKEN                # מדביקים את הטוקן
npx wrangler deploy
```

בסוף `wrangler` מדפיס כתובת כמו `https://kinun-mcp.<השם-שלכם>.workers.dev`. אחרי שמסיימים אפשר למחוק את קובץ ה-JSON מהמחשב.
אם בפרויקט יש יותר ממשק בית אחד, מוסיפים משתנה `HOUSEHOLD_ID` ב-`wrangler.toml`. אחרת השרת בוחר את היחיד שקיים.

### 3. בבדיקה

```bash
curl -s https://<הכתובת>/mcp -H "Authorization: Bearer <הטוקן>" -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_overview","arguments":{}}}'
```

אמורה לחזור תשובה עם שם הבית ותאריך היום.

### 4. חיבור סוכן

באפליקציה: **הגדרות → סוכני AI**. ממלאים כתובת וטוקן ולוחצים **העתקת פרומפט לסוכן**.
את הפרומפט מדביקים לסוכן. הוא כולל את כל דרכי החיבור וכללי עבודה.

- **Claude Code ועוד כלים שרצים על המחשב:** `claude mcp add --transport http kinun <כתובת>/mcp --header "Authorization: Bearer <טוקן>"`
- **claude.ai ולקוחות שמקבלים רק כתובת:** מחבר מותאם אישית עם הכתובת `<כתובת>/mcp/<טוקן>`.

הכתובת והטוקן בהגדרות נשמרים רק במכשיר שבו הוזנו. הם לא עוברים ל-Firestore ולא מסתנכרנים.
כדי שכתובת השרת תהיה מוכנה מראש בבנייה, אפשר להגדיר `VITE_MCP_URL`.

## אבטחה

- **טוקן:** מי שמחזיק בו יכול לקרוא ולערוך את הרשימות. הוא מוצג כסיסמה, אבל הפרומפט שמועתק מכיל אותו, ולכן מתייחסים לפרומפט כאל סוד.
  השרת סוגר כברירת מחדל (503) אם הטוקן חסר או קצר מ-24 תווים, ומשווה אותו בזמן קבוע.
- **כתובת עם טוקן בנתיב** נשמרת ביומני הדפדפן והשרתים. כשאפשר, עדיף כותרת `Authorization`.
- **החלפת טוקן:** `npx wrangler secret put MCP_TOKEN` עם ערך חדש, ואז מעדכנים את הסוכנים.
- **החלפת מפתח:** יוצרים מפתח JSON חדש, מעדכנים את `GOOGLE_SERVICE_ACCOUNT`, ומוחקים את הישן ב-Cloud Console.
- **ולידציה בשרת:** חשבון שירות לא עובר דרך `firestore.rules`, אז כל כתיבה נבדקת ב-`mcp-worker/src/tools.ts`
  (סוגים, אורכים, כתובות http(s) בלבד). **כשמשנים שדה בפריט** מעדכנים גם שם, ואת הבדיקות ב-`worker.test.ts`.
- **הרשימה הלבנה** (`src/lib/access.ts`) חלה על כניסה לאפליקציה. סוכן נכנס דרך הטוקן, לא דרך חשבון Google.

## פיתוח מקומי

```bash
cd mcp-worker
printf 'MCP_TOKEN=%s\nGOOGLE_SERVICE_ACCOUNT=%s\n' "$(openssl rand -hex 24)" "$(cat /path/to/key.json | tr -d '\n')" > .dev.vars
npx wrangler dev   # http://localhost:8787/mcp
```

הבדיקות (`npm test` מהשורש) רצות בלי רשת ובלי Firestore: הן משתמשות במאגר בזיכרון ובדיקה של חתימת ה-JWT.
`.dev.vars` ממוקם ב-`.gitignore`.
