/**
 * "סימני אזהרה" — when to call MDA 101, when to go to the maternity ER / delivery room,
 * and when to get checked soon. Static reference content (not seeded into households).
 *
 * Rules: every item comes from an official source (see `source`), worded close to it.
 * Do not add symptoms that are not in a source. Researched 2026-11-22.
 */
import { SRC } from './sources';

export interface WarningItem {
  text: string;
  /** Optional extra line (how to check, what to bring…). */
  detail?: string;
  source: string;
}

export interface WarningGroup {
  id: 'mda' | 'er' | 'soon';
  title: string;
  intro: string;
  items: WarningItem[];
}

export const WARNING_GROUPS: WarningGroup[] = [
  {
    id: 'mda',
    title: 'חירום — מתקשרים 101',
    intro:
      'בכל מצב חירום רפואי שיש בו סכנה לבריאות — מתקשרים למד״א 101. הפראמדיק במוקד נשאר על הקו ומנחה אתכם עד שהצוות מגיע, כולל בלידה.',
    items: [
      {
        text: 'מצב חירום רפואי שיש בו סכנה לבריאות או לחיים',
        detail: 'האמבולנס יוצא כבר בזמן השיחה. אם קשה למסור כתובת, המוקד שולח הודעה עם קישור לשיתוף המיקום.',
        source: SRC.mdaHowToCall,
      },
      {
        text: 'הלידה מתקדמת ואין זמן להגיע לבית החולים',
        detail: 'הפראמדיק במוקד ינחה אתכם בטלפון עד שצוות מד״א יגיע.',
        source: SRC.mdaHowToCall,
      },
    ],
  },
  {
    id: 'er',
    title: 'פונים למיון יולדות / חדר הלידה',
    intro: 'מיון היולדות פתוח 24 שעות ביממה, כל השנה, ובדרך כלל נותן מענה משבוע 24.',
    items: [
      {
        text: 'דימום טרי, בדומה לווסת',
        detail: 'הפרשה רירית שקופה, ורודה או חומה (פקק רירי) היא סימן שהלידה מתקרבת — דימום אדום טרי הוא סיבה לפנות.',
        source: SRC.mohLaborSigns,
      },
      {
        text: 'ירידת מים או חשד לירידת מים — גם בטפטוף',
        source: SRC.mohLaborSigns,
      },
      {
        text: 'ירידה בתנועות העובר, שינוי בדפוס התנועות, או שלא מרגישים תנועות בכלל',
        detail:
          'ספירה: בשכיבה על צד שמאל, אחרי ארוחה קלה, סופרים 30 דקות — מצופות 3–5 תנועות. פחות מ-3? ממשיכים עוד 30 דקות; אם אין 6 תנועות בשעה — פונים מיד.',
        source: SRC.mohObstetricEr,
      },
      {
        text: 'כאב ראש, טשטוש ראייה או כאב בחלק העליון של הבטן',
        detail: 'משבוע 20 ועד 6 שבועות אחרי הלידה אלה יכולים להעיד על רעלת הריון ומצריכים בדיקה דחופה.',
        source: SRC.maccabiPregnancyEr,
      },
      {
        text: 'צירים סדירים או לחצים לפני שבוע 37',
        source: SRC.mohSecondTrimester,
      },
      {
        text: 'צירי לידה סדירים וממושכים',
        detail:
          'בלידה ראשונה: צירים סדירים וכואבים, מעל 45 שניות כל אחד, כל 3–5 דקות, שמתגברים במשך שעה–שעתיים. בלידה חוזרת — לפנות כבר כשמתחילים צירים סדירים וכואבים.',
        source: SRC.mohLaborSigns,
      },
      {
        text: 'נפילה, חבלה בבטן או תאונת דרכים',
        source: SRC.mohObstetricEr,
      },
      {
        text: 'הרופא/ה הנחו אתכם להגיע',
        source: SRC.mohObstetricEr,
      },
    ],
  },
  {
    id: 'soon',
    title: 'נבדקים בהקדם',
    intro: 'במרכז בריאות האישה של הקופה (בבוקר) או בחדר מיון (בערב).',
    items: [
      { text: 'כאבי בטן חזקים', source: SRC.mohSecondTrimester },
      { text: 'הקאות בלתי פוסקות', source: SRC.mohSecondTrimester },
      { text: 'חום גבוה', source: SRC.mohSecondTrimester },
      { text: 'כאבי ראש חריגים', source: SRC.mohSecondTrimester },
      { text: 'תחושת מצוקה גופנית חריגה', source: SRC.mohSecondTrimester },
    ],
  },
];
