/**
 * Default tasks (משימות), researched for Israel / Tel Aviv area — research date 2026-11-21.
 * See docs/RESEARCH.md for the reasoning and docs/CONTENT.md for how to edit.
 *
 * Amounts and dates that change yearly are written with the year they refer to.
 */
import type { SeedTask } from './schema';
import { SRC } from './sources';

export const SEED_TASKS: SeedTask[] = [
  // ───────────────────────── במהלך ההריון ─────────────────────────
  {
    seedId: 'task.notify-employer',
    title: 'להודיע למעסיק על ההריון (עד החודש החמישי)',
    notes:
      'עובדת צריכה להודיע למעסיק על ההריון בחודש החמישי (אפשר גם במייל). מאותו שלב חלות מגבלות על שעות נוספות ועבודה במנוחה השבועית, ואסור לפטר עובדת בגלל הריונה.',
    category: 'work',
    phase: 'pregnancy',
    dueWeek: 20,
    source: SRC.kzNotifyEmployer,
  },
  {
    seedId: 'task.prenatal-test-hours',
    title: 'לנצל שעות היעדרות בתשלום לבדיקות הריון',
    notes:
      'עובדת במשרה מלאה זכאית ל-40 שעות היעדרות בשכר מלא לבדיקות הריון שגרתיות (מי שעובדת עד 4 שעות ביום — 20 שעות), בלי קשר לוותק.',
    category: 'work',
    phase: 'pregnancy',
    source: SRC.kzPrenatalTestHours,
  },
  {
    seedId: 'task.partner-sick-days',
    title: 'בן/בת הזוג: ימי מחלה כדי ללוות לבדיקות וללידה',
    notes:
      'בן/בת הזוג יכולים להיעדר על חשבון ימי מחלה (עד 7 ימים בשנה) בשל ההריון והלידה. יום הלידה ושני ימי המחלה שאחריו נספרים בתוך המכסה.',
    category: 'work',
    phase: 'pregnancy',
    source: SRC.kzPartnerLeave,
  },
  {
    seedId: 'task.choose-hospital',
    title: 'לבחור בית חולים ללידה',
    notes:
      'כדאי להשוות: זמן נסיעה, מרכז ללידה טבעית, מדיניות מלווים, מלונית וייעוץ הנקה. בהגעה ללידה מציגים תעודת זהות (והפניה — אם יש). אחרי הבחירה שמרו את הפרטים בהגדרות — מסך "לידה" משתמש בהם.',
    category: 'hospital',
    phase: 'pregnancy',
    dueWeek: 30,
    source: SRC.lisMain,
    links: [
      { label: 'ליס (איכילוב)', url: SRC.lisMain },
      { label: 'שיבא — מיון יולדות', url: SRC.shebaTriage },
      { label: 'וולפסון — חוברת יולדות', url: SRC.wolfsonBooklet },
      { label: 'בילינסון — חוברת מידע', url: SRC.beilinsonBooklet },
    ],
  },
  {
    seedId: 'task.birth-course',
    title: 'להירשם לקורס הכנה ללידה',
    notes:
      'בליס הקורסים מיועדים משבוע 30, ומומלץ לשריין מקום כבר משבוע 20. יש קורסים ייעודיים (למשל לניתוח קיסרי), חלקם בזום.',
    category: 'hospital',
    phase: 'pregnancy',
    dueWeek: 28,
    source: SRC.lisCourseSyllabus,
    links: [
      { label: 'מאמי ליס — קורסים וסיורים', url: SRC.lisMamy },
      { label: 'שיבא — קורסים וסיורים', url: SRC.shebaCourses },
    ],
  },
  {
    seedId: 'task.hospital-tour',
    title: 'להירשם לסיור בחדרי הלידה',
    notes: 'בליס ובשיבא הסיורים ללא תשלום, נמשכים כשעה וחצי ודורשים הרשמה מראש. בשיבא יש גם סיור וירטואלי.',
    category: 'hospital',
    phase: 'pregnancy',
    dueWeek: 34,
    source: SRC.lisTours,
    links: [
      { label: 'ליס — סיורים', url: SRC.lisTours },
      { label: 'שיבא — סיור לידה', url: SRC.shebaTour },
    ],
  },
  {
    seedId: 'task.doula',
    title: 'להחליט אם רוצים דולה',
    notes:
      'דולה מלווה רגשית ופיזית לאורך הלידה. ליס, למשל, מציין ליווי דולה כאחת האפשרויות — בדקו את מדיניות המלווים בבית החולים שבחרתם.',
    category: 'hospital',
    phase: 'pregnancy',
    dueWeek: 30,
    optional: true,
    source: SRC.lisMain,
  },
  {
    seedId: 'task.cord-blood',
    title: 'להחליט לגבי דם טבורי',
    notes:
      'שלוש אפשרויות: תרומה לבנק ציבורי (ללא עלות), שימור בבנק פרטי (בתשלום), או לא לאסוף. כל אפשרות דורשת תיאום מראש.',
    category: 'hospital',
    phase: 'pregnancy',
    dueWeek: 34,
    optional: true,
  },
  {
    seedId: 'task.glucose-test',
    title: 'בדיקת העמסת סוכר (שבועות 24–28)',
    notes: 'בדיקת סקר לסוכרת הריון, לפי הפניית הרופא/ה. ההעמסה החלקית (50 גרם) נעשית ללא צום.',
    category: 'health',
    phase: 'pregnancy',
    dueWeek: 28,
    source: SRC.maccabiGlucoseTest,
  },
  {
    seedId: 'task.tdap',
    title: 'חיסון שעלת (Tdap) — בשבועות 27–36',
    notes:
      'משרד הבריאות ממליץ על החיסון בכל הריון. הנוגדנים עוברים דרך השליה ומגנים על התינוק עד שיקבל את החיסון הראשון שלו. מביאים לחיסון את כרטיס מעקב ההריון.',
    category: 'health',
    phase: 'pregnancy',
    dueWeek: 36,
    source: SRC.maccabiPertussis,
  },
  {
    seedId: 'task.flu-vaccine',
    title: 'חיסון שפעת עונתי',
    notes: 'משרד הבריאות ממליץ על חיסון שפעת לנשים בהריון (קבוצת סיכון) ולכלל הציבור מגיל חצי שנה — כולל בן/בת הזוג.',
    category: 'health',
    phase: 'pregnancy',
    source: SRC.maccabiFlu,
  },
  {
    seedId: 'task.emotional-screening',
    title: 'שאלון מצב רגשי (אדינבורו) בהריון',
    notes:
      'שאלון קצר במרפאת הנשים או בטיפת חלב, בהריון סביב שבוע 27 ושוב אחרי הלידה. קשיים רגשיים סביב לידה שכיחים ומטופלים — גם אצל בני זוג.',
    category: 'mom',
    phase: 'pregnancy',
    dueWeek: 28,
    source: SRC.maccabiPostpartumDepression,
  },
  {
    seedId: 'task.plan-leave',
    title: 'לתכנן את חופשת הלידה ואיך מתחלקים בה',
    notes:
      'יולדת שעבדה שנה אצל המעסיק זכאית ל-26 שבועות חופשה (פחות משנה — 15). דמי לידה: 15 שבועות למי ששילמה ביטוח לאומי 10 מתוך 14 החודשים שלפני היציאה (או 15 מתוך 22), ו-8 שבועות למי ששילמה 6 מתוך 14. בן/בת הזוג יכולים לקחת שבוע אחד במקביל ליולדת, ואחרי 6 שבועות — להחליף אותה בחלק מהחופשה.',
    category: 'work',
    phase: 'pregnancy',
    dueWeek: 30,
    source: SRC.kzMaternityLeave,
    links: [
      { label: 'ביטוח לאומי — תנאי זכאות לדמי לידה', url: SRC.btlMaternityEligibility },
      { label: 'כל זכות — חופשת לידה לבן/בת זוג', url: SRC.kzPartnerMaternityLeave },
    ],
  },
  {
    seedId: 'task.address-update',
    title: 'לוודא שהכתובת במשרד הפנים מעודכנת',
    notes:
      'אחרי רישום שם התינוק נשלחים בדואר ספחי תעודת הזהות של שני ההורים ותעודת הלידה — לכתובת הרשומה במרשם האוכלוסין.',
    category: 'paperwork',
    phase: 'pregnancy',
    dueWeek: 32,
    source: SRC.govNaming,
  },
  {
    seedId: 'task.car-seat-get',
    title: 'להשיג סלקל או מושב בטיחות לתינוק',
    notes:
      'זה חלק מנוהל השחרור — הצוות מוודא שיש לכם סלקל או מושב בטיחות. תינוקות נוסעים נגד כיוון הנסיעה (בטרם ממליצים: לפחות עד גיל שנתיים), במושב האחורי, ולעולם לא מול כרית אוויר פעילה.',
    category: 'logistics',
    phase: 'pregnancy',
    dueWeek: 34,
    source: SRC.beteremFirstGear,
    links: [
      { label: 'בטרם — סלקל או מושב בטיחות?', url: SRC.beteremSeatOrInfantCarrier },
      { label: 'בטרם — מושב בטיחות לתינוק', url: SRC.beteremCarSeat },
    ],
  },
  {
    seedId: 'task.first-aid-course',
    title: 'קורס עזרה ראשונה לתינוקות',
    notes: 'החייאה וטיפול בחנק אצל תינוקות — שווה לשני ההורים, וגם לסבים ולסבתות.',
    category: 'baby',
    phase: 'pregnancy',
    dueWeek: 34,
    optional: true,
  },
  {
    seedId: 'task.beneficiaries',
    title: 'לעדכן מוטבים בפנסיה, בביטוחים ובחסכונות',
    notes: 'שינוי משפחתי הוא זמן טוב לעבור על המוטבים, על ביטוח החיים ועל צוואה.',
    category: 'finance',
    phase: 'pregnancy',
    optional: true,
  },

  // ───────────────────────── לקראת הלידה ─────────────────────────
  {
    seedId: 'task.birth-plan',
    title: 'לכתוב תוכנית לידה',
    notes:
      'מה חשוב לכם: שיכוך כאבים, תנועה ותנוחות, מלווים, עור-לעור, הנקה ראשונה, ביות. הדפיסו עותק ומסרו למיילדת בקבלה. לבית החולים מאיר יש תבנית לדוגמה.',
    category: 'hospital',
    phase: 'prebirth',
    dueWeek: 35,
    source: SRC.meirBirthPlan,
    links: [{ label: 'תבנית תוכנית לידה (מאיר)', url: SRC.meirBirthPlan }],
  },
  {
    seedId: 'task.save-hospital-details',
    title: 'לשמור באפליקציה את טלפון חדר הלידה והכתובת',
    notes:
      'בהגדרות ← בית החולים. מסך "לידה" משתמש בהם לכפתורי חיוג וניווט. בליס, למשל: חדרי לידה 03-6925633, מיון יולדות 03-6925678.',
    category: 'logistics',
    phase: 'prebirth',
    dueWeek: 34,
    source: SRC.lisInfo,
  },
  {
    seedId: 'task.maternity-pay-form100',
    title: 'לבקש מהמעסיק לשדר לביטוח לאומי טופס 100',
    notes:
      'כך דמי הלידה משולמים בלי להגיש תביעה (גם מעסיק שיש לו הסדר עם ביטוח לאומי מעביר את התביעה בעצמו). אחרת מגישים תביעה מקוונת אחרי הלידה. דמי הלידה מחושבים לפי השכר הממוצע ב-3 (או 6) החודשים שלפני היציאה לחופשה, עד תקרה.',
    category: 'rights',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.btlMaternityHowToClaim,
    links: [{ label: 'gov.il — תביעה לדמי לידה', url: SRC.govMaternityClaim }],
  },
  {
    seedId: 'task.bank-details',
    title: 'להכין פרטי חשבון בנק לבית החולים',
    notes:
      'מענק הלידה משולם אוטומטית תוך חודש מהלידה; בלידה הראשונה — לחשבון שנמסר בבית החולים (2,103 ₪ לילד ראשון, נכון ל-2026). את עלות האשפוז ביטוח לאומי משלם ישירות לבית החולים.',
    category: 'rights',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.btlBirthGrant,
    links: [
      { label: 'סכומי מענק הלידה', url: SRC.btlBirthGrantAmount },
      { label: 'מימון אשפוז היולדת', url: SRC.btlHospitalGrant },
    ],
  },
  {
    seedId: 'task.gbs-test',
    title: 'בדיקת GBS (סטרפטוקוק מקבוצה B) — שבועות 35–37',
    notes:
      'משרד הבריאות ממליץ על בדיקת סקר (משטח) לכל הנשים ההרות בשבועות 35–37. תוצאה חיובית = אנטיביוטיקה במהלך הלידה, לכן מביאים את התוצאה לחדר הלידה ומעדכנים את הצוות.',
    category: 'health',
    phase: 'prebirth',
    dueWeek: 37,
    source: SRC.mohGbsCircular,
    links: [{ label: 'מכבי — הכול על בדיקת GBS', url: SRC.maccabiGbs }],
  },
  {
    seedId: 'task.pediatrician',
    title: 'לבחור רופא/ת ילדים',
    notes:
      'כדאי לבחור מראש מרפאה ורופא/ה בקופה — את הביקור הראשון קובעים כבר בימים שאחרי השחרור (ובשחרור מוקדם — מיד).',
    category: 'health',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.earlyDischargeGuide,
  },
  {
    seedId: 'task.tipat-halav-find',
    title: 'לאתר את טיפת החלב הקרובה',
    notes:
      'בתל אביב יש 15 תחנות עירוניות, והשירות חינם לכל תושבי העיר בלי קשר לקופה. התחנה נקבעת לפי הכתובת; תורים ב"דיגיתל שלי" או במוקד 106. בשאר הארץ — באתר משרד הבריאות.',
    category: 'health',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.tlvTipatHalav,
    links: [{ label: 'איתור טיפת חלב וקביעת תור', url: SRC.govTipatHalavAppointments }],
  },
  {
    seedId: 'task.car-seat-install',
    title: 'להתקין את הסלקל ברכב ולתרגל חגירה',
    notes:
      'מתקינים לפי הוראות היצרן, במושב האחורי ונגד כיוון הנסיעה. אפשר להיעזר בטכנאי מושבי בטיחות מוסמך (הכשרה בהובלת בטרם).',
    category: 'logistics',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.beteremSeatTechnicians,
    links: [{ label: 'בטרם — מושב בטיחות לתינוק', url: SRC.beteremCarSeat }],
  },
  {
    seedId: 'task.pack-hospital-bag',
    title: 'לארוז את תיק הלידה',
    notes: 'כדאי שיהיה מוכן סביב שבוע 36. הרשימה המלאה נמצאת במסך "ציוד" ← "תיק לידה".',
    category: 'hospital',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.maccabiLabor,
  },
  {
    seedId: 'task.safe-sleep-setup',
    title: 'להכין פינת שינה בטוחה',
    notes:
      'עריסה או מיטה עם תו תקן, מזרן קשיח בגודל מדויק (בלי רווחים) וסדין — וזהו. בלי כריות, שמיכות עבות, מגני ראש ובובות; במקום שמיכה — שק שינה. התינוק ישן על הגב, בחדר ההורים אבל במיטה נפרדת.',
    category: 'home',
    phase: 'prebirth',
    dueWeek: 36,
    source: SRC.beteremFirstGear,
    links: [
      { label: 'בטרם — כללים לטיפול בטוח בתינוק', url: SRC.beteremSafeCare },
      { label: 'מכון התקנים — מיטה, עריסה ולול', url: SRC.siiCrib },
    ],
  },
  {
    seedId: 'task.hospital-route',
    title: 'לתכנן את הנסיעה לבית החולים',
    notes:
      'מסלול חלופי בשעות עומס, איפה חונים, מי נוהג ומי מגבה. אם אין רכב — לתאם מראש מונית ולוודא שיש מושב בטיחות לחזרה.',
    category: 'logistics',
    phase: 'prebirth',
    dueWeek: 36,
  },
  {
    seedId: 'task.help-plan',
    title: 'לתאם עזרה לשבועות הראשונים',
    notes: 'מי מגיע ומתי, ומה באמת עוזר: בישול, כביסה, קניות, או לשמור על התינוק כשאתם ישנים.',
    category: 'family',
    phase: 'prebirth',
    dueWeek: 36,
  },
  {
    seedId: 'task.wash-baby-clothes',
    title: 'לכבס בגדים, סדינים וחיתולי בד ראשונים',
    notes: 'עם אבקה או נוזל כביסה שמתאימים לתינוקות.',
    category: 'home',
    phase: 'prebirth',
    dueWeek: 37,
    source: SRC.maccabiBabyEssentials,
  },
  {
    seedId: 'task.freezer-meals',
    title: 'לבשל ולהקפיא ארוחות לשבועות הראשונים',
    notes: 'וגם רשימה של משלוחי אוכל ומכולת שאפשר להזמין בלחיצה.',
    category: 'home',
    phase: 'prebirth',
    dueWeek: 37,
  },
  {
    seedId: 'task.notify-list',
    title: 'להכין רשימת אנשים לעדכן אחרי הלידה',
    notes: 'מי מקבל טלפון, מי הודעה, ומי מעדכן את מי — כדי לא לחשוב על זה ברגע האמת.',
    category: 'family',
    phase: 'prebirth',
    dueWeek: 37,
  },
  {
    seedId: 'task.health-fund-insurance',
    title: 'לבדוק צירוף התינוק לביטוח משלים וסיעודי בקופה',
    notes:
      'בדרך כלל התינוק משויך לקופת החולים של ההורה שמקבל את קצבת הילדים. ביטוח משלים וסיעודי — לפי כללי הקופה: במכבי, למשל, אפשר לצרף תינוק לביטוח הסיעודי בתוך 12 חודשים מהלידה בלי חיתום רפואי, ויש קופות שמצרפות אוטומטית.',
    category: 'finance',
    phase: 'prebirth',
    dueWeek: 38,
    source: SRC.maccabiNewBaby,
    links: [{ label: 'כל זכות — ביטוח סיעודי לתינוקות', url: SRC.kzNursingInsuranceKids }],
  },
  {
    seedId: 'task.private-insurance',
    title: 'לבדוק ביטוחים פרטיים או מהעבודה לצירוף התינוק',
    notes: 'בפוליסות רבות יש חלון זמן אחרי הלידה שבו אפשר לצרף את התינוק בלי הצהרת בריאות — בדקו בפוליסה עד מתי.',
    category: 'finance',
    phase: 'prebirth',
    dueWeek: 38,
    optional: true,
  },
  {
    seedId: 'task.baby-name',
    title: 'שם לתינוק — לבחור, או לצמצם לרשימה קצרה',
    notes:
      'את השם אפשר למסור כבר בהודעת הלידה בבית החולים. אם לא הספקתם — רושמים אחר כך באתר רשות האוכלוסין, ללא עלות.',
    category: 'paperwork',
    phase: 'prebirth',
    dueWeek: 38,
    source: SRC.govNaming,
    links: [{ label: 'כל זכות — הודעת לידה', url: SRC.kzBirthNotice }],
  },
  {
    seedId: 'task.overdue-monitoring',
    title: 'אם עוברים את התאריך המשוער — מעקב הריון עודף',
    notes: 'לפי הנחיות הרופא/ה ובית החולים. בליס, למשל, פועל מיון אמבולטורי למעקב הריון משבוע 39 (07:30–13:30).',
    category: 'health',
    phase: 'prebirth',
    dueWeek: 40,
    source: SRC.lisMaternityEr,
  },

  // ───────────────────────── בלידה ─────────────────────────
  {
    seedId: 'task.labor-when-to-go',
    title: 'מתי נוסעים לבית החולים?',
    notes:
      'צירים סדירים וכואבים כל 5 דקות במשך שעתיים (בלידה ראשונה) או שעה (בלידה חוזרת). ירידת מים — להגיע תוך 1–2 שעות. דימום, או ירידה בתנועות העובר — לפנות מיד. בכל ספק — מתקשרים לחדר הלידה.',
    category: 'hospital',
    phase: 'labor',
    source: SRC.maccabiPregnancyEr,
    links: [
      { label: 'מכבי — לידה קרבה', url: SRC.maccabiLabor },
      { label: 'מאיר — מתי להגיע לחדר לידה', url: SRC.meirWhenToCome },
    ],
  },
  {
    seedId: 'task.labor-docs',
    title: 'לקחת: תעודות זהות, תיק מעקב הריון ותוצאות בדיקות',
    notes: 'ברישום מבקשים תעודת זהות ואת תיק ההריון המלא (והפניה — אם יש). כולל תוצאת GBS ותוכנית לידה אם הכנתם.',
    category: 'hospital',
    phase: 'labor',
    source: SRC.maccabiLabor,
  },
  {
    seedId: 'task.labor-call',
    title: 'להתקשר לחדר הלידה ולצאת לדרך',
    notes: 'כפתורי החיוג והניווט נמצאים במסך "לידה".',
    category: 'logistics',
    phase: 'labor',
  },
  {
    seedId: 'task.labor-notify',
    title: 'לעדכן את מי שצריך שהלידה התחילה',
    notes: 'למשל מי ששומר על ילדים או על בעלי חיים בבית. את כל השאר — אחרי הלידה.',
    category: 'family',
    phase: 'labor',
  },

  // ───────────────────────── בבית החולים ─────────────────────────
  {
    seedId: 'task.hosp-newborn-checks',
    title: 'להכיר את הבדיקות והחיסונים שהתינוק מקבל',
    notes:
      'בימים הראשונים כל יילוד זכאי לבדיקות סקר ולחיסונים: ויטמין K בזריקה, חיסון ראשון נגד צהבת B, בדיקת דם לסקר יילודים ובדיקת שמיעה. נדרשת הסכמת ההורים, ומותר לשאול כל שאלה לפני.',
    category: 'health',
    phase: 'hospital',
    source: SRC.kzNewbornConsent,
    links: [
      { label: 'כל זכות — בדיקות סקר ליילודים', url: SRC.kzNewbornScreening },
      { label: 'כל זכות — בדיקת שמיעה ליילודים', url: SRC.kzHearingScreening },
      { label: 'gov.il — תוצאות סקר יילודים', url: SRC.govNewbornScreeningResults },
    ],
  },
  {
    seedId: 'task.hosp-rsv',
    title: 'לוודא שהתינוק קיבל הגנה מפני RSV',
    notes:
      'לפי דיווח מיולי 2026, תינוקות שנולדים באוגוסט–מרץ מקבלים נוגדנים נגד RSV בבית החולים סמוך ללידה (ונולדי אפריל–יולי — בטיפת חלב בסתיו). שאלו את הצוות לפני השחרור.',
    category: 'health',
    phase: 'hospital',
    source: SRC.rsvSeason,
  },
  {
    seedId: 'task.hosp-birth-notice',
    title: 'הודעת לידה — למסור פרטים (ושם, אם בחרתם)',
    notes:
      'בית החולים מעביר את הודעת הלידה לרשות האוכלוסין באופן מקוון ומיידי. אם השם עוד לא נבחר — רושמים אותו אחר כך אונליין.',
    category: 'paperwork',
    phase: 'hospital',
    source: SRC.kzBirthNotice,
    links: [{ label: 'רישום שם הנולד', url: SRC.govNaming }],
  },
  {
    seedId: 'task.hosp-bank',
    title: 'למסור פרטי חשבון בנק (למענק הלידה)',
    notes: 'בלידה הראשונה המענק משולם לחשבון שנמסר בבית החולים, תוך חודש מהלידה.',
    category: 'rights',
    phase: 'hospital',
    source: SRC.btlBirthGrant,
  },
  {
    seedId: 'task.hosp-breastfeeding-help',
    title: 'לבקש הדרכת הנקה במחלקה',
    notes: 'כל יולדת זכאית להדרכת הנקה פעם ביום בכל יום אשפוז במחלקת היולדות. אחרי השחרור — בטיפת חלב ובמוקד *5400.',
    category: 'baby',
    phase: 'hospital',
    source: SRC.kzBreastfeedingRights,
    links: [
      { label: 'מוקד טיפת חלב *5400', url: SRC.govTipatHalavHotline },
      { label: 'ליגת לה לצ׳ה ישראל', url: SRC.lllIsrael },
    ],
  },
  {
    seedId: 'task.hosp-first-appointment',
    title: 'לקבוע ביקור ראשון לתינוק — טיפת חלב או רופא/ת ילדים',
    notes:
      'בדרך כלל משתחררים יום-יומיים אחרי לידה רגילה. בשחרור מוקדם צריך לקבוע ביקור מיידי בטיפת חלב או אצל רופא/ת הילדים. שאלו גם מה ההנחיות למעקב צהבת.',
    category: 'health',
    phase: 'hospital',
    source: SRC.earlyDischargeGuide,
  },
  {
    seedId: 'task.hosp-discharge-letters',
    title: 'לקבל ולשמור את מכתבי השחרור (יולדת ותינוק)',
    notes: 'צלמו ושמרו עותק — מבקשים אותם בטיפת חלב, אצל רופא/ת הילדים ובבדיקה אחרי הלידה.',
    category: 'paperwork',
    phase: 'hospital',
  },
  {
    seedId: 'task.hosp-car-seat',
    title: 'להביא את הסלקל לשחרור ולחגור נכון',
    notes: 'רצועות צמודות לגוף, מושב מעוגן נגד כיוון הנסיעה. בגדי יציאה וכובע — מהתיק.',
    category: 'logistics',
    phase: 'hospital',
    source: SRC.beteremSafeCare,
  },

  // ───────────────────────── השבועות הראשונים ─────────────────────────
  {
    seedId: 'task.home-vitamin-d',
    title: 'ויטמין D לתינוק — מהימים הראשונים',
    notes:
      'קווי ההזנה של משרד הבריאות כוללים תוסף ויטמין D מהלידה ועד גיל שנה. מוצר ומינון — לפי טיפת חלב או רופא/ת הילדים.',
    category: 'baby',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 7,
    source: SRC.mohInfantFeeding,
  },
  {
    seedId: 'task.home-partner-days',
    title: 'בן/בת הזוג: ימי ההיעדרות שאחרי הלידה',
    notes:
      'מותר להיעדר עד 5 ימים קלנדריים אחרי יום הלידה בלי הסכמת המעסיק: הימים 1–3 על חשבון חופשה שנתית, 4–5 על חשבון ימי מחלה. אפשר גם לקחת שבוע חופשת לידה במקביל ליולדת (היא מוותרת בכתב על דמי הלידה לאותו שבוע).',
    category: 'work',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 6,
    source: SRC.kzPartnerLeave,
  },
  {
    seedId: 'task.home-tipat-halav-file',
    title: 'לפתוח תיק בטיפת חלב (עד שבועיים מהלידה)',
    notes:
      'מומלץ להגיע תוך שבועיים מהלידה לפתיחת תיק ובדיקה ראשונה. אחרי לידה ראשונה יש גם ביקור בית של אחות, לפי הצורך.',
    category: 'health',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 14,
    source: SRC.kzTipatHalav,
    links: [
      { label: 'טיפות חלב בתל אביב', url: SRC.tlvTipatHalav },
      { label: 'איתור טיפת חלב וקביעת תור', url: SRC.govTipatHalavAppointments },
    ],
  },
  {
    seedId: 'task.home-register-name',
    title: 'לרשום את שם התינוק (אם לא נרשם בבית החולים)',
    notes: 'אונליין באתר רשות האוכלוסין, ללא עלות. אחרי הרישום נשלחים ספחי ת״ז ותעודת לידה בדואר.',
    category: 'paperwork',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 14,
    source: SRC.govNaming,
  },
  {
    seedId: 'task.home-feeding-log',
    title: 'לעקוב אחרי האכלות וחיתולים בימים הראשונים',
    notes: 'בביקורים הראשונים שואלים כמה האכלות וחיתולים רטובים היו ביממה. פתק בטלפון מספיק.',
    category: 'baby',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 14,
  },
  {
    seedId: 'task.home-visitors',
    title: 'לקבוע כללי ביקורים',
    notes: 'מתי, לכמה זמן, ושמי שמגיע יהיה בריא. מבקר טוב מביא אוכל ולוקח כביסה.',
    category: 'family',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 3,
  },
  {
    seedId: 'task.home-welcome-ceremony',
    title: 'טקס או מפגש קבלת פנים לתינוק (אם רלוונטי)',
    notes: 'ברית, בריתה, זבד הבת או מפגש משפחתי — מה שמתאים לכם. כדאי להחליט מראש מי מארגן.',
    category: 'family',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 8,
    optional: true,
  },
  {
    seedId: 'task.home-maternity-pay',
    title: 'דמי לידה — לוודא שהתשלום בדרך',
    notes:
      'אם המעסיק שידר טופס 100 או שיש לו הסדר עם ביטוח לאומי — התשלום אוטומטי. אחרת מגישים תביעה מקוונת. מי שקיבלה אחר כך תשלום נוסף מהמעסיק (בונוס, הבראה) עשויה להיות זכאית להפרשים.',
    category: 'rights',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 30,
    source: SRC.btlMaternityHowToClaim,
    links: [{ label: 'gov.il — תביעה לדמי לידה', url: SRC.govMaternityClaim }],
  },
  {
    seedId: 'task.home-health-fund',
    title: 'לוודא שהתינוק רשום בקופה ולהשלים פרטים',
    notes:
      'בדרך כלל השיוך לקופה אוטומטי. משלימים פרטים ומצרפים לביטוחים באתר או באפליקציה של הקופה (במכבי: "רישום תינוק").',
    category: 'paperwork',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 30,
    source: SRC.maccabiNewBaby,
  },
  {
    seedId: 'task.home-id-appendix',
    title: 'לוודא שהגיעו ספחי ת״ז ותעודת לידה',
    notes: 'אחרי רישום השם מונפקים לשני ההורים ספחים חדשים תוך כחמישה ימי עסקים, ונשלחים בדואר לכתובת הרשומה.',
    category: 'paperwork',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 30,
    source: SRC.govNaming,
  },
  {
    seedId: 'task.home-tax-credit',
    title: 'לעדכן טופס 101 אצל המעסיקים — נקודות זיכוי',
    notes: 'שני ההורים זכאים לנקודות זיכוי ממס הכנסה בגין הילד החל משנת הלידה. מעדכנים בטופס 101.',
    category: 'finance',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 30,
    source: SRC.kzTaxCredits,
  },
  {
    seedId: 'task.home-birth-grant',
    title: 'לוודא שמענק הלידה נכנס לחשבון',
    notes: 'משולם אוטומטית תוך חודש מהלידה. 2,103 ₪ לילד ראשון (נכון ל-2026).',
    category: 'rights',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 35,
    source: SRC.btlBirthGrant,
    links: [{ label: 'סכומי מענק הלידה', url: SRC.btlBirthGrantAmount }],
  },
  {
    seedId: 'task.home-mood',
    title: 'לשים לב למצב הרוח — של שניכם',
    notes:
      'דכדוך בשבועיים הראשונים (בייבי בלוז) שכיח וחולף. אם התחושות נמשכות, מחמירות או מפחידות — פונים לטיפת חלב, לרופא/ה, או לער״ן בטלפון 1201. דיכאון אחרי לידה יכול להופיע גם חודשים אחריה, וגם אצל בני זוג.',
    category: 'mom',
    phase: 'firstWeeks',
    source: SRC.maccabiPostpartumDepression,
    links: [{ label: 'ער״ן — עזרה ראשונה נפשית', url: SRC.kzEran }],
  },
  {
    seedId: 'task.home-postpartum-checkup',
    title: 'בדיקה אצל רופא/ת נשים כ-6 שבועות אחרי הלידה',
    notes: 'החלמה, דימום, רצפת אגן, אמצעי מניעה ומצב רגשי.',
    category: 'mom',
    phase: 'firstWeeks',
    dueDaysAfterBirth: 42,
  },

  // ───────────────────────── החודשים הראשונים ─────────────────────────
  {
    seedId: 'task.months-vaccines',
    title: 'חיסוני שגרה בטיפת חלב',
    notes:
      'לפי תוכנית החיסונים של משרד הבריאות. בסוף כל ביקור התחנה קובעת את התור הבא — כדאי להעתיק אותו ליומן המשותף.',
    category: 'health',
    phase: 'firstMonths',
    dueDaysAfterBirth: 60,
    source: SRC.tlvTipatHalav,
  },
  {
    seedId: 'task.months-iron',
    title: 'תוסף ברזל מגיל 4 חודשים',
    notes:
      'משרד הבריאות ממליץ על תוסף ברזל לכל התינוקות החל מגיל 4 חודשים. מוצר ומינון — לפי טיפת חלב או רופא/ת הילדים.',
    category: 'baby',
    phase: 'firstMonths',
    dueDaysAfterBirth: 120,
    source: SRC.maccabiIron,
    links: [{ label: 'קווים מנחים להזנת תינוקות', url: SRC.mohInfantFeeding }],
  },
  {
    seedId: 'task.months-savings',
    title: 'חיסכון לכל ילד — לבחור קופה ומסלול (עד 6 חודשים)',
    notes:
      'ביטוח לאומי מפקיד 58 ₪ בחודש (2026), ואפשר להכפיל ב-58 ₪ נוספים מקצבת הילדים. מי שלא בוחר תוך 6 חודשים מהלידה — לילד ראשון החיסכון מנוהל בקופת גמל להשקעה במסלול סיכון מוגבר.',
    category: 'finance',
    phase: 'firstMonths',
    dueDaysAfterBirth: 150,
    source: SRC.btlSavingsNewborn,
  },
  {
    seedId: 'task.months-return-to-work',
    title: 'לתאם חזרה לעבודה',
    notes:
      'מי שרוצה לקצר את חופשת הלידה (לא פחות מ-15 שבועות) מודיעה למעסיק מראש — והמעסיק יכול לדחות את החזרה בעד 3 שבועות.',
    category: 'work',
    phase: 'firstMonths',
    dueDaysAfterBirth: 90,
    source: SRC.kzMaternityLeave,
  },
  {
    seedId: 'task.months-parent-hour',
    title: 'שעת הורות (שעת הנקה) אחרי החזרה לעבודה',
    notes:
      'עובדת במשרה מלאה זכאית לשעה ביום ללא ניכוי משכר, במשך 4 חודשים מתום חופשת הלידה — גם בלי להניק בפועל. אפשר לחלוק את הזכות עם בן/בת הזוג.',
    category: 'work',
    phase: 'firstMonths',
    source: SRC.kzBreastfeedingRights,
  },
  {
    seedId: 'task.months-daycare',
    title: 'מעון או משפחתון — לבדוק ולהירשם בחלון הרישום',
    notes:
      'הרישום למעונות יום מוכרים נפתח פעם בשנה (בשנים האחרונות בפברואר–מרץ) לשנת הלימודים שמתחילה בספטמבר. מעונות מפוקחים מקבלים מגיל 3 חודשים. סמנו ביומן את מועד הרישום הבא.',
    category: 'logistics',
    phase: 'firstMonths',
    source: SRC.govDaycareRegistration,
    links: [
      { label: 'כל זכות — רישום למעון יום מוכר', url: SRC.kzDaycare },
      { label: 'עיריית תל אביב — מעונות יום', url: SRC.tlvDaycare },
    ],
  },
  {
    seedId: 'task.months-passport',
    title: 'דרכון לתינוק (אם מתכננים טיסה)',
    notes: 'גם לתינוק צריך דרכון משלו. כדאי לקבוע תור מראש בלשכת רשות האוכלוסין.',
    category: 'paperwork',
    phase: 'firstMonths',
    optional: true,
  },
];
