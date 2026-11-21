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

test('demo: onboarding → tasks → gear → labor timer → links → settings', async ({ page }) => {
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

  // Links search
  await nav(page, 'קישורים').click();
  await page.getByPlaceholder(/חיפוש/).fill('טיפת חלב');
  await expect(page.getByText('מוקד טיפת חלב')).toBeVisible();
  await snap(page, '09-links');

  // Settings: pick a hospital preset → labor screen gets a call button
  await page.getByRole('link', { name: 'הגדרות ומשק הבית' }).click();
  await page.getByRole('button', { name: 'ליס (איכילוב)' }).click();
  await page.getByRole('button', { name: 'שמירה' }).nth(1).click();
  await snap(page, '10-settings');
  await nav(page, 'לידה').click();
  await expect(page.getByRole('link', { name: 'חיוג לחדר הלידה' })).toHaveAttribute('href', 'tel:036925633');
});
