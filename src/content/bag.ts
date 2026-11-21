/**
 * Default hospital-bag checklist (תיק לידה). Research date 2026-11-21.
 * Documents follow what hospitals ask for at registration (ID + pregnancy file, referral if any).
 */
import type { SeedBagItem } from './schema';
import { SRC } from './sources';

export const SEED_BAG: SeedBagItem[] = [
  // ───────── מסמכים ─────────
  {
    seedId: 'bag.ids',
    title: 'תעודות זהות של שני ההורים',
    category: 'docs',
    priority: 'must',
    source: SRC.maccabiLabor,
  },
  {
    seedId: 'bag.pregnancy-file',
    title: 'תיק / כרטיס מעקב הריון מלא',
    category: 'docs',
    priority: 'must',
    source: SRC.maccabiLabor,
  },
  {
    seedId: 'bag.test-results',
    title: 'תוצאות בדיקות אחרונות',
    notes: 'סוג דם, העמסת סוכר, GBS ואולטרסאונד אחרון.',
    category: 'docs',
    priority: 'must',
  },
  {
    seedId: 'bag.bank-details',
    title: 'פרטי חשבון בנק',
    notes: 'בלידה הראשונה מענק הלידה משולם לחשבון שנמסר בבית החולים.',
    category: 'docs',
    priority: 'must',
    source: SRC.btlBirthGrant,
  },
  {
    seedId: 'bag.referral',
    title: 'הפניה מהרופא/ה — אם יש',
    category: 'docs',
    priority: 'nice',
    source: SRC.lisMain,
  },
  {
    seedId: 'bag.birth-plan',
    title: 'תוכנית לידה מודפסת',
    category: 'docs',
    priority: 'nice',
  },
  {
    seedId: 'bag.health-fund-cards',
    title: 'כרטיסי קופת חולים',
    category: 'docs',
    priority: 'nice',
  },

  // ───────── ליולדת ─────────
  { seedId: 'bag.slippers', title: 'כפכפים', category: 'mom', priority: 'must', source: SRC.maccabiLabor },
  {
    seedId: 'bag.water-bottle',
    title: 'בקבוק מים (רצוי עם קשית)',
    category: 'mom',
    priority: 'must',
    source: SRC.maccabiLabor,
  },
  { seedId: 'bag.phone-charger', title: 'מטען עם כבל ארוך / סוללה ניידת', category: 'mom', priority: 'must' },
  { seedId: 'bag.meds-glasses', title: 'תרופות קבועות, משקפיים / עדשות', category: 'mom', priority: 'must' },
  { seedId: 'bag.disposable-underwear', title: 'תחתונים חד-פעמיים', category: 'mom', priority: 'must' },
  { seedId: 'bag.maternity-pads', title: 'תחבושות לאחר לידה', category: 'mom', priority: 'must' },
  { seedId: 'bag.nursing-bra-pads', title: 'חזיית הנקה ורפידות הנקה', category: 'mom', priority: 'must' },
  {
    seedId: 'bag.going-home-clothes',
    title: 'בגדים נוחים ליציאה הביתה',
    notes: 'בגדי הריון רחבים יהיו הכי נוחים.',
    category: 'mom',
    priority: 'must',
  },
  { seedId: 'bag.warm-socks', title: 'גרביים חמות', notes: 'בחדר הלידה לפעמים קר.', category: 'mom', priority: 'nice' },
  { seedId: 'bag.hair-ties', title: 'גומיות שיער', category: 'mom', priority: 'nice' },
  { seedId: 'bag.lip-balm', title: 'שפתון לחות', category: 'mom', priority: 'nice' },
  { seedId: 'bag.robe', title: 'חלוק', category: 'mom', priority: 'nice' },
  { seedId: 'bag.nursing-top', title: 'חולצה או כותונת נוחה שנפתחת מקדימה', category: 'mom', priority: 'nice' },
  { seedId: 'bag.toiletries', title: 'כלי רחצה, מגבת ומברשת שיניים', category: 'mom', priority: 'nice' },
  { seedId: 'bag.snacks', title: 'חטיפים ומשקאות לאנרגיה', category: 'mom', priority: 'nice' },
  { seedId: 'bag.pillow', title: 'כרית מהבית', category: 'mom', priority: 'optional' },
  { seedId: 'bag.music', title: 'אוזניות ופלייליסט לצירים', category: 'mom', priority: 'optional' },

  // ───────── לתינוק ─────────
  {
    seedId: 'bag.baby-outfit',
    title: 'סט בגדי יציאה + כובע',
    category: 'baby',
    priority: 'must',
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'bag.car-seat',
    title: 'סלקל מותקן ברכב',
    notes: 'נבדק לפני השחרור. נגד כיוון הנסיעה, לא מול כרית אוויר פעילה.',
    category: 'baby',
    priority: 'must',
    source: SRC.beteremFirstGear,
  },
  { seedId: 'bag.baby-blanket', title: 'שמיכה דקה או עטיפה', category: 'baby', priority: 'nice' },
  {
    seedId: 'bag.baby-extra-clothes',
    title: 'בגד גוף ואוברול נוספים',
    category: 'baby',
    priority: 'nice',
    quantity: '2',
  },
  { seedId: 'bag.baby-socks', title: 'גרביים וכפפות', category: 'baby', priority: 'optional' },

  // ───────── למלווה ─────────
  { seedId: 'bag.partner-charger', title: 'מטען וסוללה ניידת', category: 'partner', priority: 'must' },
  {
    seedId: 'bag.partner-food',
    title: 'אוכל ושתייה',
    notes: 'לידה יכולה להימשך שעות ארוכות.',
    category: 'partner',
    priority: 'nice',
  },
  { seedId: 'bag.partner-clothes', title: 'בגדים להחלפה', category: 'partner', priority: 'nice' },
  { seedId: 'bag.parking-payment', title: 'אמצעי תשלום לחניה ולקפיטריה', category: 'partner', priority: 'nice' },
  { seedId: 'bag.contacts-list', title: 'רשימת אנשים לעדכן', category: 'partner', priority: 'nice' },
  { seedId: 'bag.camera', title: 'מקום פנוי בטלפון / מצלמה', category: 'partner', priority: 'optional' },
];
