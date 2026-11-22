/**
 * "בונה תוכנית לידה" — the questions, following the structure the Ministry of Health suggests
 * (preparing-for-labor/labor-plan): opening, maternity ER, latent stage, active stage, pushing,
 * right after the birth, care for the baby. Answers are saved per field id in the household's
 * birth-plan record — don't rename ids that have shipped. Researched 2026-11-23.
 */
import { SRC } from './sources';

export type PlanField =
  | { id: string; type: 'text' | 'textarea'; label: string; hint?: string }
  | { id: string; type: 'choice' | 'multi'; label: string; hint?: string; options: string[] };

export interface PlanSection {
  id: string;
  title: string;
  intro?: string;
  fields: PlanField[];
}

const YES_NO = ['כן', 'לא', 'עוד לא החלטנו'];
const PAIN = ['תנועה', 'מקלחת', 'כדור פיזיו', 'עיסוי', 'טנס', 'גז צחוק', 'אפידורל'];

export const BIRTH_PLAN_SOURCE = SRC.mohLaborPlan;
/** Fixed id of the one birth-plan record per household. */
export const BIRTH_PLAN_ID = 'birth-plan';

export const BIRTH_PLAN: PlanSection[] = [
  {
    id: 'intro',
    title: 'פתיח',
    intro: 'הפרטים שלך, קצת עלייך ומי מלווה אותך.',
    fields: [
      { id: 'fullName', type: 'text', label: 'שם מלא' },
      { id: 'idNumber', type: 'text', label: 'תעודת זהות' },
      { id: 'companions', type: 'text', label: 'מי מלווה אותי בלידה', hint: 'למשל: בן הזוג, אמא, דולה' },
      { id: 'about', type: 'textarea', label: 'קצת עליי, ופנייה קצרה לצוות' },
      { id: 'medical', type: 'textarea', label: 'רקע רפואי רלוונטי' },
      {
        id: 'previous',
        type: 'textarea',
        label: 'חוויה מלידה קודמת',
        hint: 'אם הייתה חוויה קשה — מה הפך אותה לכזו, ומה יכול לעזור הפעם',
      },
    ],
  },
  {
    id: 'er',
    title: 'קבלה למיון יולדות',
    fields: [{ id: 'erRequests', type: 'textarea', label: 'מה יקל עליי במיון', hint: 'למשל אם בדיקה נרתיקית קשה לי' }],
  },
  {
    id: 'latent',
    title: 'השלב הלטנטי',
    intro: 'הצירים הולכים ומתחזקים, ולפעמים זה לוקח זמן.',
    fields: [
      { id: 'music', type: 'choice', label: 'מוזיקה', options: YES_NO },
      { id: 'lights', type: 'choice', label: 'אורות מעומעמים', options: YES_NO },
      {
        id: 'privacy',
        type: 'choice',
        label: 'אווירה אינטימית',
        hint: 'דלת סגורה, דיבור שקט, בלי אנשי צוות שלא מטפלים בי ישירות (סטודנטים, מתלמדים)',
        options: YES_NO,
      },
      { id: 'enema', type: 'choice', label: 'חוקן', options: YES_NO },
      {
        id: 'iv',
        type: 'choice',
        label: 'ברנולה',
        options: ['להשאיר ברנולה', 'בדיקת דם בפרפרית בלבד', 'עוד לא החלטנו'],
      },
      { id: 'monitorIntermittent', type: 'choice', label: 'ניטור עוברי לסירוגין (אם אפשר)', options: YES_NO },
      { id: 'monitorWireless', type: 'choice', label: 'ניטור אלחוטי (אם יש)', options: YES_NO },
      { id: 'latentPain', type: 'multi', label: 'איך אתמודד עם הכאב', options: PAIN },
    ],
  },
  {
    id: 'active',
    title: 'השלב הפעיל',
    fields: [
      { id: 'activePain', type: 'multi', label: 'הקלה על כאב', options: PAIN },
      {
        id: 'natural',
        type: 'choice',
        label: 'לידה טבעית (בלי אפידורל)',
        hint: 'כדאי להחליט מראש — וגם להשאיר מקום להתייעץ עם המיילדת ברגע האמת',
        options: ['כן', 'פתוחה לשני הכיוונים', 'לא'],
      },
      {
        id: 'interventions',
        type: 'choice',
        label: 'הסבר על כל התערבות רפואית ועל החלופות',
        options: ['כן, בבקשה', 'לא צריך'],
      },
    ],
  },
  {
    id: 'pushing',
    title: 'שלב הלחיצות',
    fields: [
      {
        id: 'positions',
        type: 'multi',
        label: 'תנוחות מועדפות',
        options: ['חצי ישיבה', 'עמידת שש', 'כריעה עם הישענות קדימה', 'שכיבה על הצד', 'מה שירגיש נכון'],
      },
      { id: 'perinealMassage', type: 'choice', label: 'עיסוי פרינאום', options: YES_NO },
      { id: 'compresses', type: 'choice', label: 'קומפרסים חמימים על הפרינאום', options: YES_NO },
      {
        id: 'episiotomy',
        type: 'textarea',
        label: 'העמדה שלי לגבי חיתוך חיץ',
        hint: 'חיתוך חיץ (אפיזיוטומיה) דורש את הסכמתך',
      },
    ],
  },
  {
    id: 'after',
    title: 'מיד אחרי הלידה',
    fields: [
      { id: 'skinToSkin', type: 'choice', label: 'עור לעור מיד אחרי הלידה', options: YES_NO },
      { id: 'delayedClamping', type: 'choice', label: 'השהיית הניתוק מחבל הטבור', options: YES_NO },
      { id: 'partnerCuts', type: 'choice', label: 'בן/בת הזוג חותכים את חבל הטבור', options: YES_NO },
      { id: 'cordBlood', type: 'choice', label: 'איסוף דם מחבל הטבור', options: YES_NO },
      { id: 'breastfeedSoon', type: 'choice', label: 'עזרה בהנקה בסמוך ללידה', options: YES_NO },
    ],
  },
  {
    id: 'baby',
    title: 'הטיפול בתינוק',
    intro: 'בקבלה לחדר הלידה מבקשים הסכמה לטיפולי השגרה. כדאי להכיר אותם מראש.',
    fields: [
      {
        id: 'routineCare',
        type: 'choice',
        label: 'טיפולי שגרה: ויטמין K, חיסון נגד צהבת B, סקר שמיעה, בדיקת דם',
        options: ['מסכימה', 'רוצה לשוחח על זה עם הצוות'],
      },
      { id: 'feeding', type: 'choice', label: 'האכלה', options: ['הנקה', 'תחליף חלב', 'שילוב', 'עוד לא החלטנו'] },
      {
        id: 'rooming',
        type: 'choice',
        label: 'ביות',
        options: ['אפס הפרדה — התינוק איתי כל הזמן', 'חלק מהזמן במחלקת יילודים', 'עוד לא החלטנו'],
      },
      { id: 'lactationConsult', type: 'choice', label: 'ייעוץ הנקה', options: YES_NO },
    ],
  },
  {
    id: 'more',
    title: 'עוד משהו',
    intro:
      'אם יש טראומה, פגיעה בעבר או מצב נפשי מורכב — ברוב בתי החולים אפשר להיפגש מראש עם מיילדת להכנה אישית. שאלו בחדר הלידה.',
    fields: [{ id: 'notes', type: 'textarea', label: 'דברים נוספים שחשוב שהצוות יידע' }],
  },
];

/** Multi-choice answers are stored as one string. */
export const MULTI_SEPARATOR = ' · ';
