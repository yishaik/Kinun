import { expect, test, type Page } from '@playwright/test';

const shots = process.env.SCREENSHOTS === '1';

function nav(page: Page, name: string) {
  return page.getByRole('navigation', { name: 'ניווט ראשי' }).getByRole('link', { name, exact: true });
}

async function snap(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `test-results/screens/${name}.png`, fullPage: true });
}

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

test('demo: onboarding → week → tasks → gear → labor → warnings → more/links → settings', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'קינון' })).toBeVisible();
  await snap(page, '01-sign-in');

  await page.getByRole('button', { name: 'כניסה למצב הדגמה' }).click();
  await expect(page.getByRole('heading', { name: 'בואו נכין את הקן' })).toBeVisible();
  await page.getByLabel('תאריך לידה משוער').fill(isoInDays(30)); // ~week 35–36
  await page.getByLabel('ה-Gmail של בן/בת הזוג').fill('lisya.abulafya@gmail.com');
  await snap(page, '02-onboarding');
  await page.getByRole('button', { name: 'יצירת הרשימות שלנו' }).click();

  // Home
  await expect(page.getByText('מה עכשיו')).toBeVisible();
  await expect(page.getByRole('img', { name: /התקדמות ההריון/ })).toBeVisible();
  await snap(page, '03-home');

  // This week's card → full weekly page
  await page.getByRole('link', { name: /השבוע שלכם, שבוע/ }).click();
  await expect(page.getByRole('heading', { name: 'התינוק/ת' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'לעשות השבוע' })).toBeVisible();
  await snap(page, '12-week');
  await page.getByRole('button', { name: 'השבוע הבא' }).click();
  await expect(page.getByRole('button', { name: 'חזרה לשבוע הנוכחי' })).toBeVisible();

  // Tasks: tick the first open task in the "lekrat haleida" phase
  await nav(page, 'משימות').click();
  await expect(page.getByRole('heading', { name: 'משימות', level: 1 })).toBeVisible();
  const firstCheck = page.getByRole('checkbox').first();
  await firstCheck.click();
  await expect(page.getByRole('button', { name: /להציג שבוצעו \(1\)/ })).toBeVisible();
  await snap(page, '04-tasks');

  // Open a task sheet and see its notes + source
  await page.getByRole('button', { name: /לארוז את תיק הלידה/ }).click();
  await expect(page.getByRole('dialog', { name: 'לארוז את תיק הלידה' })).toBeVisible();
  await snap(page, '05-task-sheet');
  await page.getByRole('button', { name: 'סגירה' }).click();

  // Add a custom task
  await page.getByRole('button', { name: 'הוספת משימה' }).click();
  await page.getByLabel('כותרת').fill('לקנות כרית הנקה לסבתא');
  await page.getByRole('button', { name: 'הוספה' }).click();
  await expect(page.getByText('לקנות כרית הנקה לסבתא')).toBeVisible();

  // Gear + bag
  await nav(page, 'ציוד').click();
  await expect(page.getByText('פריטי חובה שיש לנו')).toBeVisible();
  await snap(page, '06-gear');
  await page.getByRole('tab', { name: 'תיק לידה' }).click();
  await expect(page.getByText('ארוז בתיק')).toBeVisible();
  await page.getByRole('checkbox', { name: /תעודות זהות/ }).click();
  await snap(page, '07-bag');

  // Labor: timer start/stop
  await nav(page, 'לידה').click();
  await page.getByRole('button', { name: /ציר התחיל/ }).click();
  await expect(page.getByRole('button', { name: /הציר נגמר/ })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /הציר נגמר/ }).click();
  await expect(page.getByRole('heading', { name: 'צירים אחרונים' })).toBeVisible();
  await snap(page, '08-labor');

  // Warning signs, reachable from labor mode
  await page.getByRole('link', { name: /סימני אזהרה/ }).click();
  await expect(page.getByRole('heading', { name: 'פונים למיון יולדות / חדר הלידה' })).toBeVisible();
  await expect(page.getByRole('link', { name: /מד״א 101/ })).toHaveAttribute('href', 'tel:101');
  await snap(page, '13-warnings');

  // Links search
  await nav(page, 'עוד').click();
  await expect(page.getByRole('heading', { name: 'עוד', level: 1 })).toBeVisible();
  await snap(page, '14-more');
  await page.getByRole('link', { name: /שלבי הלידה/ }).click();
  await expect(page.getByRole('heading', { name: 'שלב ראשון: הלידה הפעילה' })).toBeVisible();
  await snap(page, '15-stages');
  await page.getByRole('link', { name: 'מילון מונחים' }).click();
  await page.getByPlaceholder(/חיפוש/).fill('אפידורל');
  await expect(page.getByText('אפידורל בהליכה')).toBeVisible();
  await snap(page, '16-glossary');

  // Kick counter
  await nav(page, 'עוד').click();
  await page.getByRole('link', { name: /מונה תנועות/ }).click();
  await page.getByRole('button', { name: 'התחלת ספירה' }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /^תנועה/ }).click();
  await expect(page.getByRole('button', { name: 'תנועה. נספרו 4' })).toBeVisible();
  await snap(page, '17-kicks');
  await page.getByRole('button', { name: 'סיום הספירה' }).click();
  await expect(page.getByText(/4 תנועות ב-/)).toBeVisible();

  // Birth plan, opened from its task → print view
  await nav(page, 'משימות').click();
  await page.getByText('לכתוב תוכנית לידה').click();
  await page.getByRole('link', { name: 'לבונה תוכנית הלידה' }).click();
  await page.getByLabel('שם מלא').fill('נועה כהן');
  await page.getByLabel('מי מלווה אותי בלידה').fill('בן הזוג');
  await page.getByRole('group', { name: 'עור לעור מיד אחרי הלידה' }).getByRole('button', { name: 'כן' }).click();
  await page.getByRole('group', { name: 'הקלה על כאב' }).getByRole('button', { name: 'מקלחת' }).click();
  await page.getByRole('group', { name: 'הקלה על כאב' }).getByRole('button', { name: 'אפידורל' }).click();
  await snap(page, '18-birth-plan');
  await page.getByRole('link', { name: /תצוגה להדפסה/ }).click();
  await expect(page.getByRole('heading', { name: 'תוכנית לידה — נועה כהן' })).toBeVisible();
  await expect(page.getByText('מקלחת · אפידורל')).toBeVisible();
  await snap(page, '19-birth-plan-print');

  // Questions for the doctor
  await nav(page, 'עוד').click();
  await page.getByRole('link', { name: /שאלות לרופא/ }).click();
  await page.getByLabel('שאלה חדשה').fill('עד מתי מותר לטוס?');
  await page.getByRole('button', { name: 'הוספה', exact: true }).click();
  await page.getByRole('button', { name: /הוספה לרשימה: כמה מלווים/ }).click();
  await page.getByRole('checkbox', { name: 'סימון כנשאלה: כמה מלווים מותר להכניס לחדר הלידה?' }).click();
  await page.getByLabel('התשובה').fill('שניים');
  await page.getByLabel('שאלה חדשה').click();
  await snap(page, '20-questions');

  // Names
  await nav(page, 'עוד').click();
  await page.getByRole('link', { name: /רשימת שמות/ }).click();
  for (const n of ['נועם', 'אלה', 'יובל']) {
    await page.getByLabel('שם חדש').fill(n);
    await page.getByRole('button', { name: 'הוספה', exact: true }).click();
  }
  await page.getByRole('button', { name: 'לא אוהב/ת את יובל' }).click();
  await expect(page.getByRole('heading', { name: /שנינו אוהבים/ })).toBeVisible();
  await snap(page, '21-names');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('navigation', { name: 'ניווט ראשי' })).toBeHidden();
  await page.emulateMedia({ media: 'screen' });
  await nav(page, 'עוד').click();
  await page.getByRole('link', { name: /קישורים וטלפונים/ }).click();
  await page.getByPlaceholder(/חיפוש/).fill('טיפת חלב');
  await expect(page.getByText('מוקד טיפת חלב')).toBeVisible();
  await snap(page, '09-links');

  // Settings: pick a hospital preset → labor screen gets a call button
  await page.getByRole('link', { name: 'הגדרות ומשק הבית' }).click();
  await page.getByRole('button', { name: 'ליס (איכילוב)' }).click();
  await page.getByRole('button', { name: 'שמירה' }).nth(1).click();
  await snap(page, '10-settings');

  // Settings → AI agents: the URL-only copy button needs both a URL and a token
  await expect(page.getByRole('button', { name: 'העתקת פרומפט לסוכן' })).toBeVisible();
  await expect(page.getByRole('button', { name: /העתקת כתובת בלבד/ })).toHaveCount(0);
  await page.getByLabel('כתובת השרת').fill('https://kinun-mcp.example.workers.dev');
  await page.getByLabel('טוקן').fill('x'.repeat(32));
  await expect(page.getByRole('button', { name: /העתקת כתובת בלבד/ })).toBeVisible();
  await snap(page, '11-settings-agents');
  await nav(page, 'לידה').click();
  await expect(page.getByRole('link', { name: 'חיוג לחדר הלידה' })).toHaveAttribute('href', 'tel:036925633');
});
