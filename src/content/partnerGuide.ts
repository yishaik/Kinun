/**
 * "מדריך לבן/בת הזוג" — what the birth partner can do, stage by stage.
 * Every tip is condensed from the official page in `source`. Researched 2026-11-23.
 */
import { SRC } from './sources';

export interface PartnerTip {
  text: string;
  detail?: string;
  source: string;
  /** In-app screen that helps with this tip. */
  to?: { path: string; label: string };
}

export const PARTNER_GUIDE: { id: string; title: string; tips: PartnerTip[] }[] = [
  {
    id: 'before',
    title: 'לפני הלידה',
    tips: [
      {
        text: 'לכתוב את תוכנית הלידה ביחד',
        detail: 'ככה תדעו מה חשוב לה ותוכלו לעזור לצוות לפעול לפי זה.',
        source: SRC.mohLaborPlan,
        to: { path: '/birth-plan', label: 'לתוכנית הלידה' },
      },
      {
        text: 'להגיע לקורס הכנה ולסיורים בחדרי הלידה',
        detail: 'לקרוא על שלבי הלידה, להצטרף לקורס הכנה ולקבוע סיורים בחדרי הלידה הקרובים.',
        source: SRC.mohLaborPlan,
        to: { path: '/stages', label: 'לשלבי הלידה' },
      },
      {
        text: 'לברר כמה מלווים מותר בחדר הלידה',
        detail: 'כל בית חולים קובע את מספר המלווים (ברובם שניים). כדאי לשאול בסיור.',
        source: SRC.mohLaborSupport,
      },
      {
        text: 'ללמוד ולתרגל מגע ועיסוי',
        detail: 'הכנה ולמידה של טכניקות מגע יכולות להקל על הלידה — וזו תמיכה פעילה שלכם.',
        source: SRC.mohPainRelief,
      },
      {
        text: 'לתרגל יחד נשימות',
        detail: 'כדאי להתחיל לתרגל עוד בהריון, כדי שהנשימה תגיע מוכנה ללידה.',
        source: SRC.mohPainRelief,
        to: { path: '/breathing', label: 'לתרגיל הנשימה' },
      },
      {
        text: 'לבדוק את הזכויות שלך בעבודה',
        detail: 'ימי היעדרות סביב הלידה וחופשת לידה לבן/בת הזוג.',
        source: SRC.kzPartnerLeave,
      },
    ],
  },
  {
    id: 'contractions',
    title: 'כשהצירים מתחילים',
    tips: [
      {
        text: 'למדוד את הצירים',
        detail:
          'בלידה ראשונה: כשהצירים סדירים וכואבים, נמשכים יותר מ-45 שניות ומגיעים כל 3–5 דקות — ממתינים שעה–שעתיים לוודא שהם מתגברים, ואז נוסעים למיון יולדות. בלידה חוזרת יוצאים מוקדם יותר.',
        source: SRC.mohLaborSigns,
        to: { path: '/labor', label: 'לשעון הצירים' },
      },
      {
        text: 'לדעת מתי נוסעים מיד',
        detail: 'דימום טרי, ירידת מים או חשד לירידת מים, או הנחיה של רופא/ה — פונים למיון יולדות.',
        source: SRC.mohLaborSigns,
        to: { path: '/warnings', label: 'לסימני האזהרה' },
      },
      {
        text: 'לעזור לה לזוז ולהירגע בבית',
        detail: 'בשלב הלטנטי עוזרים תנועה ושינוי תנוחה, מקלחת או אמבטיה נעימה, טנס, עיסוי ונשימות.',
        source: SRC.mohLaborStages,
      },
    ],
  },
  {
    id: 'delivery-room',
    title: 'בחדר הלידה',
    tips: [
      {
        text: 'לתמוך — ולהשאיר את ההחלטות הרפואיות לצוות',
        detail: 'תפקיד המלווה הוא לתמוך ביולדת, לא להתערב בעבודת הצוות. כל פעולה "טבעית" — מתייעצים קודם עם המיילדת.',
        source: SRC.mohLaborSupport,
      },
      {
        text: 'מגע שעוזר',
        detail:
          'עיסוי בגב התחתון, לחיצה על הגב התחתון מעל עצם הזנב, עיסוי כפות הרגליים. לשאול מה עוזר — ואם לא נעים לה, מפסיקים.',
        source: SRC.mohPainRelief,
      },
      {
        text: 'חום',
        detail: 'בקבוק מים חמים לגב התחתון; בשלב הלחיצות — מגבת חמימה על הפרינאום.',
        source: SRC.mohPainRelief,
      },
      {
        text: 'לשמור על אווירה',
        detail: 'מוזיקה, אורות מעומעמים, דלת סגורה ודיבור שקט — לפי מה שכתוב בתוכנית הלידה.',
        source: SRC.mohLaborPlan,
      },
      {
        text: 'לנשום איתה בין הצירים',
        detail: 'שאיפה עמוקה, החזקה לכמה שניות ונשיפה איטית וארוכה, כמו דרך קשית.',
        source: SRC.mohPainRelief,
      },
      {
        text: 'לחתוך את חבל הטבור, אם רוצים',
        detail: 'אחרי הלידה המיילדת, או בן/בת הזוג, חותכים את חבל הטבור.',
        source: SRC.mohLaborStages,
      },
    ],
  },
  {
    id: 'after',
    title: 'אחרי הלידה',
    tips: [
      {
        text: 'עור לעור והנקה ראשונה',
        detail: 'בשעתיים הראשונות המיילדת מעודדת מגע עור לעור עם שני ההורים ועוזרת בהנקה, אם רוצים.',
        source: SRC.mohLaborStages,
      },
      {
        text: 'לשים לב למצב הרוח',
        detail:
          'מצוקה נפשית אחרי לידה שכיחה ואפשר לטפל בה. שינה רצופה, תזונה ותמיכה עוזרות; אם זה לא חולף — פונים לאחות טיפת חלב, לרופא/ת המשפחה או לעובדת סוציאלית בקופה.',
        source: SRC.mohMentalHealth,
      },
    ],
  },
];
