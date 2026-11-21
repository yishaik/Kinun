# הקמה: Firebase + התקנה בטלפונים

כ-10 דקות, פעם אחת. הכול בתוכנית החינמית (Spark) — אין צורך בכרטיס אשראי.

## 1. יוצרים פרויקט

1. נכנסים ל-<https://console.firebase.google.com> עם חשבון Google.
2. **Create a project** ← שם: `kinun` (Firebase יציע מזהה, למשל `kinun-1a2b3`; רשמו אותו).
3. את Google Analytics אפשר לכבות.

## 2. כניסה עם Google

1. בתפריט: **Build ← Authentication ← Get started**.
2. לשונית **Sign-in method** ← **Google** ← **Enable** ← בוחרים כתובת תמיכה ← **Save**.

זהו. הדומיינים `localhost`, `<project>.web.app` ו-`<project>.firebaseapp.com` כבר מורשים.

## 3. מסד הנתונים (Firestore)

1. **Build ← Firestore Database ← Create database**.
2. מיקום: **`me-west1` (Tel Aviv)** — אי אפשר לשנות אחר כך.
3. **Start in production mode** ← **Create**.
4. לשונית **Rules** ← מוחקים את מה שיש ← מדביקים את התוכן של [`firestore.rules`](../firestore.rules) ← **Publish**.
   (או בשלב 4 — `npm run deploy` מעלה גם את החוקים.)

## 4. מעלים את האפליקציה (Firebase Hosting)

במחשב עם Node 22:

```bash
git clone https://github.com/yishaik/Kinun.git
cd Kinun
npm ci
npm run firebase -- login                # נפתח דפדפן לאישור
npm run firebase -- use --add            # בוחרים את הפרויקט, alias: default
npm run deploy                           # בנייה + העלאה של האתר וחוקי Firestore
```

בסוף תופיע כתובת: `https://<project-id>.web.app` — זו האפליקציה.
אין צורך להעתיק הגדרות Firebase לקוד: באתר המאוחסן האפליקציה קוראת אותן לבד מ-`/__/firebase/init.json`.

## 5. מתקינים בטלפונים ומצרפים את בן/בת הזוג

1. **אייפון:** פותחים את הכתובת ב-**Safari** ← כפתור השיתוף ← **הוספה למסך הבית**.
   **אנדרואיד:** פותחים ב-**Chrome** ← תפריט ⋮ ← **התקנת אפליקציה**.
2. פותחים את האפליקציה מהמסך הראשי ונכנסים עם Google (באייפון צריך להתחבר גם מתוך האפליקציה המותקנת — היא נפרדת מ-Safari).
3. בפעם הראשונה: שם לבית, תאריך משוער, וה-Gmail של בן/בת הזוג ← **יצירת הרשימות שלנו**.
4. בן/בת הזוג פותחים את אותה כתובת ונכנסים עם ה-Gmail שהוספתם — הרשימות מופיעות אצלם.
   אפשר להוסיף או להסיר כתובות בכל זמן בהגדרות.

## 6. (רשות) פריסה אוטומטית מ-GitHub

כל push ל-`main` יעלה גרסה חדשה (`.github/workflows/deploy.yml`):

1. [Google Cloud Console](https://console.cloud.google.com) ← בוחרים את הפרויקט ← **IAM & Admin ← Service Accounts ← Create**:
   שם `github-deploy`, תפקיד **Firebase Hosting Admin** ← Done.
2. בחשבון השירות ← **Keys ← Add key ← JSON** — יורד קובץ.
3. ב-GitHub: **Settings ← Secrets and variables ← Actions**:
   - **Secrets** ← `FIREBASE_SERVICE_ACCOUNT` = כל תוכן קובץ ה-JSON.
   - **Variables** ← `FIREBASE_PROJECT_ID` = מזהה הפרויקט.
4. מוחקים את קובץ ה-JSON מהמחשב.

הזרימה מעלה רק את האתר. כשמשנים את `firestore.rules` מריצים `npm run deploy:rules` (או מדביקים בקונסול).
חלופה: `npm run firebase -- init hosting:github` יוצר חשבון שירות וסוד אוטומטית — אז צריך לעדכן את שם הסוד ב-`deploy.yml`.

## פיתוח מקומי מול Firebase

מעתיקים `.env.example` ל-`.env.local` וממלאים מ-**Project settings ← Your apps ← Web app** (אם אין — **Add app ← Web**).
אחר כך `npm run dev`. בלי הקובץ, `npm run dev:demo` עובד במצב הדגמה.

## תקלות נפוצות

| מה רואים                           | מה עושים                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `auth/unauthorized-domain`         | Authentication ← Settings ← **Authorized domains** ← מוסיפים את הדומיין (למשל דומיין מותאם) |
| "אין הרשאה לנתונים האלה"           | כתובת ה-Gmail לא ברשימת "מי משתמש באפליקציה" — מוסיפים אותה מהטלפון של מי שכבר בפנים        |
| באייפון ההתחברות חוזרת למסך הכניסה | ודאו שפותחים את הכתובת `…web.app` (לא `…firebaseapp.com`), ונסו שוב מתוך האפליקציה המותקנת  |
| "נדרשת הגדרה נוספת ב-Firebase"     | לא נוצר Firestore (שלב 3)                                                                   |
| הגרסה בטלפון לא מתעדכנת            | סוגרים ופותחים את האפליקציה; העדכון נטען ברקע ומופעל בפתיחה הבאה                            |
