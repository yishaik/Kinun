/**
 * Default baby & postpartum equipment list (ציוד). Research date 2026-11-21.
 * Safety notes follow the Ministry of Health safe-sleep guidance and Beterem.
 * Deliberately NOT included: crib bumpers / head guards (MoH & Beterem advise against them).
 */
import type { SeedGear } from './schema';
import { SRC } from './sources';

export const SEED_GEAR: SeedGear[] = [
  // ───────── שינה ─────────
  {
    seedId: 'gear.crib',
    title: 'עריסה או מיטת תינוק עם תו תקן',
    notes: 'בחודשים הראשונים אפשר גם לקנות או לשכור עריסה. במיטה — תו תקן ישראלי וסורגים שטוחים במרווח תקני.',
    category: 'sleep',
    priority: 'must',
    quantity: '1',
    source: SRC.maccabiBabyEssentials,
    links: [{ label: 'מכון התקנים — מיטה, עריסה ולול', url: SRC.siiCrib }],
  },
  {
    seedId: 'gear.mattress',
    title: 'מזרן קשיח בגודל המדויק של המיטה',
    notes: 'בלי רווח בין המזרן לדפנות. מלבד המזרן, כל מה שצריך במיטה זה סדין.',
    category: 'sleep',
    priority: 'must',
    quantity: '1',
    source: SRC.beteremFirstGear,
  },
  {
    seedId: 'gear.sheets',
    title: 'סדינים מותאמים',
    category: 'sleep',
    priority: 'must',
    quantity: '3',
  },
  {
    seedId: 'gear.sleep-sack',
    title: 'שק שינה לתינוק',
    notes: 'במקום שמיכה — לא מכסה את הפנים ומפחית סכנת חנק.',
    category: 'sleep',
    priority: 'must',
    quantity: '2',
    source: SRC.beteremSafeCare,
  },
  {
    seedId: 'gear.baby-monitor',
    title: 'מוניטור (קול / וידאו)',
    notes: 'לנוחות ההורים בלבד — מוניטור אינו אמצעי למניעת מוות בעריסה.',
    category: 'sleep',
    priority: 'optional',
  },

  // ───────── נסיעות ויציאות ─────────
  {
    seedId: 'gear.car-seat',
    title: 'סלקל או מושב בטיחות לתינוק',
    notes: 'נגד כיוון הנסיעה, במושב האחורי, ולא מול כרית אוויר פעילה. בית היולדות מוודא שיש לכם סלקל לפני השחרור.',
    category: 'travel',
    priority: 'must',
    quantity: '1',
    source: SRC.beteremFirstGear,
    links: [{ label: 'בטרם — סלקל או מושב בטיחות?', url: SRC.beteremSeatOrInfantCarrier }],
  },
  {
    seedId: 'gear.isofix-base',
    title: 'בסיס לסלקל (ISOFIX)',
    notes: 'נשאר מעוגן ברכב, ואת הסלקל מקליקים עליו בכל נסיעה.',
    category: 'travel',
    priority: 'optional',
    source: SRC.beteremCarSeat,
  },
  {
    seedId: 'gear.stroller',
    title: 'עגלה עם שכיבה מלאה',
    notes: 'בחודשים הראשונים צריך שכיבה מלאה (180°). כדאי לבדוק שהיא נכנסת לתא המטען ולמעלית.',
    category: 'travel',
    priority: 'must',
    quantity: '1',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.carrier',
    title: 'מנשא',
    notes: 'בהתחלה מנשא בד רך; בהמשך מנשא שבו רגלי התינוק בפיסוק. הפנים של התינוק תמיד גלויות.',
    category: 'travel',
    priority: 'nice',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.diaper-bag',
    title: 'תיק החתלה',
    notes: 'טיפ: בכל חזרה הביתה משלימים את מה שנגמר, כך שהתיק תמיד מוכן.',
    category: 'travel',
    priority: 'nice',
    source: SRC.beteremSafeCare,
  },
  {
    seedId: 'gear.stroller-cover',
    title: 'כיסוי גשם / כילה לעגלה',
    category: 'travel',
    priority: 'optional',
  },

  // ───────── האכלה ─────────
  {
    seedId: 'gear.burp-cloths',
    title: 'חיתולי טטרה / מוסלין',
    notes: 'לגרעפסים, לניגוב ולכיסוי. אף פעם אין מספיק.',
    category: 'feeding',
    priority: 'must',
    quantity: '6–10',
  },
  {
    seedId: 'gear.nursing-pillow',
    title: 'כרית הנקה',
    category: 'feeding',
    priority: 'nice',
  },
  {
    seedId: 'gear.bottles',
    title: 'בקבוקים',
    notes: 'שימושיים גם בהנקה — לחלב שאוב.',
    category: 'feeding',
    priority: 'nice',
    quantity: '2–4',
  },
  {
    seedId: 'gear.bottle-brush',
    title: 'מברשת בקבוקים ומתקן ייבוש',
    category: 'feeding',
    priority: 'nice',
  },
  {
    seedId: 'gear.breast-pump',
    title: 'משאבת חלב',
    notes: 'אפשר לחכות ולראות אם צריך — יש גם אפשרות להשכרה.',
    category: 'feeding',
    priority: 'optional',
  },
  {
    seedId: 'gear.sterilizer',
    title: 'מעקר בקבוקים',
    notes: 'בעיקר בהאכלה בתמ״ל. לקרוא היטב את הוראות היצרן כדי למנוע שריפה או התחממות יתר של הבקבוקים.',
    category: 'feeding',
    priority: 'optional',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.formula',
    title: 'תמ״ל (תרכובת מזון לתינוקות)',
    notes: 'לפי הצורך ובהתייעצות עם טיפת חלב או רופא/ת הילדים.',
    category: 'feeding',
    priority: 'optional',
  },

  // ───────── החתלה ─────────
  {
    seedId: 'gear.diapers',
    title: 'חיתולים לנולדים',
    notes: 'נולדים צריכים החלפות רבות ביום. לא כדאי לקנות מלאי גדול ממידה אחת — הם גדלים מהר.',
    category: 'diapering',
    priority: 'must',
    quantity: '1–2 חבילות',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.wipes',
    title: 'מגבונים או צמר גפן ומים',
    category: 'diapering',
    priority: 'must',
  },
  {
    seedId: 'gear.diaper-cream',
    title: 'משחה נגד תפרחת חיתולים',
    category: 'diapering',
    priority: 'must',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.changing-mat',
    title: 'משטח או שידת החתלה',
    notes: 'לא משאירים את התינוק לבד על משטח גבוה, אפילו לרגע.',
    category: 'diapering',
    priority: 'nice',
  },
  {
    seedId: 'gear.diaper-bin',
    title: 'פח חיתולים עם מכסה',
    category: 'diapering',
    priority: 'optional',
  },

  // ───────── רחצה וטיפוח ─────────
  {
    seedId: 'gear.baby-bath',
    title: 'אמבטיה או מושב רחצה לתינוק',
    category: 'bath',
    priority: 'must',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.hooded-towels',
    title: 'מגבות עם כובע',
    category: 'bath',
    priority: 'must',
    quantity: '2',
  },
  {
    seedId: 'gear.nail-clippers',
    title: 'מספריים או קוצץ ציפורניים לתינוק',
    category: 'bath',
    priority: 'must',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.baby-wash',
    title: 'סבון ושמפו עדינים לתינוקות',
    category: 'bath',
    priority: 'nice',
  },
  {
    seedId: 'gear.baby-laundry',
    title: 'אבקת או נוזל כביסה שמתאימים לתינוקות',
    category: 'bath',
    priority: 'nice',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.bath-thermometer',
    title: 'מדחום מים לאמבטיה',
    category: 'bath',
    priority: 'optional',
  },

  // ───────── ביגוד ─────────
  {
    seedId: 'gear.bodysuits',
    title: 'בגדי גוף (בודי), מידה 0–3 חודשים',
    category: 'clothing',
    priority: 'must',
    quantity: '6–8',
  },
  {
    seedId: 'gear.sleepsuits',
    title: 'אוברולים / פיג׳מות',
    category: 'clothing',
    priority: 'must',
    quantity: '6',
  },
  {
    seedId: 'gear.hats',
    title: 'כובעים',
    category: 'clothing',
    priority: 'must',
    quantity: '2',
  },
  {
    seedId: 'gear.socks',
    title: 'גרביים',
    category: 'clothing',
    priority: 'must',
    quantity: '4–6',
  },
  {
    seedId: 'gear.outer-layer',
    title: 'שכבה חמה ליציאות (בחורף)',
    notes: 'בסלקל לא חוגרים מעל מעיל עבה — הרצועות צריכות להיות צמודות לגוף. מכסים בשמיכה מעל הרצועות.',
    category: 'clothing',
    priority: 'nice',
    source: SRC.beteremSafeCare,
  },
  {
    seedId: 'gear.mittens',
    title: 'כפפות נגד שריטות',
    category: 'clothing',
    priority: 'optional',
  },

  // ───────── בריאות ובטיחות ─────────
  {
    seedId: 'gear.thermometer',
    title: 'מדחום דיגיטלי',
    category: 'health',
    priority: 'must',
  },
  {
    seedId: 'gear.vitamin-d',
    title: 'טיפות ויטמין D',
    notes: 'מהימים הראשונים ועד גיל שנה; מוצר ומינון — לפי טיפת חלב או רופא/ת הילדים.',
    category: 'health',
    priority: 'must',
    source: SRC.mohInfantFeeding,
  },
  {
    seedId: 'gear.nasal-aspirator',
    title: 'שואב אף',
    category: 'health',
    priority: 'nice',
  },
  {
    seedId: 'gear.first-aid-kit',
    title: 'ערכת עזרה ראשונה ביתית',
    category: 'health',
    priority: 'nice',
  },
  {
    seedId: 'gear.pacifier',
    title: 'מוצץ',
    notes: 'אם בוחרים — בשינה, אחרי שההנקה התבססה. בלי שרשרת או חיבור שעלול להיכרך.',
    category: 'health',
    priority: 'optional',
    quantity: '2',
  },

  // ───────── בית ─────────
  {
    seedId: 'gear.heater',
    title: 'חימום בטוח לחדר התינוק ולמקלחת',
    notes: 'עדיף רדיאטור. לא לחמם יותר מדי — חימום יתר הוא גורם סיכון בשינה.',
    category: 'home',
    priority: 'nice',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'gear.bouncer',
    title: 'טרמפולינה / כיסא נדנדה',
    notes: 'תמיד על הרצפה — לא על שולחן, כיסא או רהיט גבוה — ותמיד חגור.',
    category: 'home',
    priority: 'optional',
  },
  {
    seedId: 'gear.night-light',
    title: 'מנורת לילה עמומה',
    notes: 'להאכלות לילה בלי להעיר את כולם.',
    category: 'home',
    priority: 'optional',
  },
  {
    seedId: 'gear.storage',
    title: 'מקום לבגדים ולציוד (שידה או סלסלות)',
    category: 'home',
    priority: 'optional',
  },

  // ───────── ליולדת ─────────
  {
    seedId: 'gear.maternity-pads',
    title: 'תחבושות לאחר לידה',
    category: 'mom',
    priority: 'must',
    quantity: '2–3 חבילות',
  },
  {
    seedId: 'gear.disposable-underwear',
    title: 'תחתונים חד-פעמיים',
    category: 'mom',
    priority: 'must',
  },
  {
    seedId: 'gear.nursing-bras',
    title: 'חזיות הנקה',
    category: 'mom',
    priority: 'must',
    quantity: '2–3',
  },
  {
    seedId: 'gear.nursing-pads',
    title: 'רפידות הנקה',
    category: 'mom',
    priority: 'must',
  },
  {
    seedId: 'gear.nipple-cream',
    title: 'משחה לפטמות',
    category: 'mom',
    priority: 'nice',
  },
  {
    seedId: 'gear.big-water-bottle',
    title: 'בקבוק מים גדול ליד פינת ההנקה',
    category: 'mom',
    priority: 'nice',
  },
];
