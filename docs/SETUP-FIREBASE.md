# הקמה: Firebase + התקנה בטלפונים

**המצב היום:** הפרויקט `kinun-ae894` כבר מוקם, והאפליקציה עולה בכתובת <https://kinun-ae894.web.app>.
שלבים 1–6 מתעדים איך זה נעשה (נובמבר 2026), למקרה שצריך להקים מחדש או בפרויקט אחר. לעדכן גרסה — שלב 6.

הכול בתוכנית החינמית (Spark) — בלי כרטיס אשראי.

## 1. פרויקט ואפליקציית Web

1. <https://console.firebase.google.com> ← **Create a new Firebase project** ← שם `Kinun`
   (Firebase מציע מזהה כמו `kinun-ae894` — זה גם שם הכתובת `…web.app`).
2. את Gemini in Firebase ואת Google Analytics אפשר לכבות — האפליקציה לא משתמשת בהם.
3. **Project Overview ← + Add app ← Web (`</>`)** ← כינוי `Kinun` ← לסמן **Also set up Firebase Hosting** ← **Register app**.
   את שאר השלבים באשף (SDK, CLI) אפשר לדלג — באתר המאוחסן האפליקציה קוראת את ההגדרות לבד מ-`/__/firebase/init.json`.

## 2. כניסה עם Google

1. **Authentication ← Get started ← Sign-in method ← Google ← Enable**.
2. **Public-facing name:** `קינון` (זה השם שמופיע במסך ההתחברות של Google) ← **Support email** ← **Save**.

## 3. הרשאה לכתובת של האפליקציה (חובה!)

האפליקציה משתמשת בכתובת שלה עצמה (`…web.app`) לתהליך ההתחברות — בלי זה ההתחברות באייפון נשברת.
לכן צריך לאשר את הכתובת הזו גם בלקוח ה-OAuth של Google:

1. [Google Cloud console ← Google Auth Platform ← Clients](https://console.cloud.google.com/auth/clients) (לוודא שנבחר הפרויקט הנכון).
2. **Web client (auto created by Google Service)**:
   - **Authorized JavaScript origins** ← Add URI ← `https://<project-id>.web.app`
   - **Authorized redirect URIs** ← Add URI ← `https://<project-id>.web.app/__/auth/handler`
3. **Save**. לוקח כמה דקות (לפעמים יותר) עד שזה נכנס לתוקף.

בלי השלב הזה Google מציג `Error 400: redirect_uri_mismatch`.

## 4. מסד הנתונים (Firestore)

**Firestore ← Create database** ← **Standard edition** ← מיקום **`me-west1` (Tel Aviv)** (אי אפשר לשנות אחר כך)
← **Start in production mode** ← **Create**. את חוקי האבטחה מעלה שלב 5.

## 5. העלאה (Firebase Hosting + חוקי Firestore)

### הדרך הקלה: Cloud Shell — בלי להתקין כלום

1. פותחים <https://shell.cloud.google.com/?project=kinun-ae894&show=terminal> (בפרויקט אחר — מחליפים את המזהה) ← **Authorize**.
   ב-Cloud Shell כבר יש Node ו-Firebase CLI, והוא מחובר לחשבון.
2. מריצים:

```bash
git clone https://github.com/yishaik/Kinun.git && cd Kinun
npm ci && npm run build
firebase deploy --project kinun-ae894
```

`firebase deploy` מעלה את האתר, את `firestore.rules` ואת האינדקסים. בסוף מופיע `Hosting URL`.

### או מהמחשב (Node 22)

```bash
git clone https://github.com/yishaik/Kinun.git && cd Kinun
npm ci
npm run firebase -- login     # נפתח דפדפן לאישור
npm run deploy                # בנייה + העלאה; .firebaserc כבר מצביע על kinun-ae894
```

לפרויקט אחר: `npm run firebase -- use --add`.

## 6. לעדכן גרסה אחרי שינוי בקוד

ב-Cloud Shell:

```bash
cd ~/Kinun && git pull && npm ci && npm run build && firebase deploy --project kinun-ae894
```

(אם התיקייה לא קיימת — כמו בשלב 5.) בטלפונים הגרסה החדשה נטענת ברקע ונכנסת לתוקף בפתיחה הבאה של האפליקציה.

## 7. התקנה בטלפונים וצירוף בן/בת הזוג

1. **אייפון:** פותחים את הכתובת ב-**Safari** ← כפתור השיתוף ← **הוספה למסך הבית**.
   **אנדרואיד:** פותחים ב-**Chrome** ← תפריט ⋮ ← **התקנת אפליקציה** (או **הוספה למסך הבית**).
2. פותחים את האפליקציה מהמסך הראשי ונכנסים עם Google (באייפון צריך להתחבר מתוך האפליקציה המותקנת — היא נפרדת מ-Safari).
3. בפעם הראשונה: שם לבית, תאריך משוער, וה-Gmail של בן/בת הזוג ← **יצירת הרשימות שלנו**.
4. בן/בת הזוג פותחים את אותה כתובת ונכנסים עם ה-Gmail שהוספתם — הרשימות מופיעות אצלם.
   אפשר להוסיף או להסיר כתובות בכל זמן בהגדרות.

## 8. (רשות) העלאה אוטומטית מ-GitHub

בפרויקט הזה (`yishaik/Kinun`) זה **כבר מופעל**: משתנה הריפו `FIREBASE_PROJECT_ID` וסוד הריפו `FIREBASE_SERVICE_ACCOUNT` מוגדרים (שמות בלבד). כל push ל-`main` שאינו שינוי תיעוד בלבד יעלה גרסה חדשה (`.github/workflows/deploy.yml`). השלבים למטה הם להקמה מחדש או לפרויקט אחר.

כל push ל-`main` יעלה גרסה חדשה (`.github/workflows/deploy.yml`):

1. [Google Cloud Console](https://console.cloud.google.com) ← **IAM & Admin ← Service Accounts ← Create**:
   שם `github-deploy`, תפקיד **Firebase Hosting Admin** ← Done.
2. בחשבון השירות ← **Keys ← Add key ← JSON** — יורד קובץ.
3. ב-GitHub: **Settings ← Secrets and variables ← Actions**:
   - **Secrets** ← `FIREBASE_SERVICE_ACCOUNT` = כל תוכן קובץ ה-JSON.
   - **Variables** ← `FIREBASE_PROJECT_ID` = `kinun-ae894`.
4. מוחקים את קובץ ה-JSON מהמחשב.

הזרימה מעלה רק את האתר. שינוי ב-`firestore.rules` עדיין מעלים ידנית (`firebase deploy --only firestore`).

## פיתוח מקומי מול Firebase

מעתיקים `.env.example` ל-`.env.local` וממלאים מ-**Project settings ← Your apps ← Kinun**.
אחר כך `npm run dev`. בלי הקובץ, `npm run dev:demo` עובד במצב הדגמה.

## תקלות נפוצות

| מה רואים                           | מה עושים                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Error 400: redirect_uri_mismatch` | שלב 3 — הכתובת `https://<project-id>.web.app/__/auth/handler` לא מאושרת (או שעוד לא עברו כמה דקות) |
| `auth/unauthorized-domain`         | Authentication ← Settings ← **Authorized domains** ← מוסיפים את הדומיין (למשל דומיין מותאם)        |
| "אין הרשאה לנתונים האלה"           | כתובת ה-Gmail לא ברשימת "מי משתמש באפליקציה" — מוסיפים אותה מהטלפון של מי שכבר בפנים               |
| באייפון ההתחברות חוזרת למסך הכניסה | פותחים את `…web.app` (לא `…firebaseapp.com`) ומתחברים מתוך האפליקציה המותקנת                       |
| "נדרשת הגדרה נוספת ב-Firebase"     | לא נוצר Firestore (שלב 4)                                                                          |
| הגרסה בטלפון לא מתעדכנת            | סוגרים ופותחים את האפליקציה; העדכון נטען ברקע ומופעל בפתיחה הבאה                                   |
