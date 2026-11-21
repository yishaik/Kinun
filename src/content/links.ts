/**
 * Default links & phone numbers (קישורים). Research date 2026-11-21.
 * Phone numbers render as tap-to-call buttons; keep them in the format people dial.
 */
import type { SeedLink } from './schema';
import { SRC } from './sources';

export const SEED_LINKS: SeedLink[] = [
  // ───────── חירום וקווים חמים ─────────
  {
    seedId: 'link.mda',
    title: 'מד״א — מוקד חירום',
    notes: 'בכל מצב חירום רפואי.',
    category: 'emergency',
    phone: '101',
  },
  {
    seedId: 'link.poison-center',
    title: 'המרכז הארצי למידע בהרעלות (רמב״ם)',
    notes: 'בבליעה או חשד להרעלה, כשהמצב יציב. במצב חירום — 101.',
    category: 'emergency',
    phone: '04-7771900',
    source: SRC.maccabiPoison,
  },
  {
    seedId: 'link.eran',
    title: 'ער״ן — עזרה ראשונה נפשית',
    notes: 'קו חם אנונימי וחינמי, מסביב לשעון — גם לקשיים רגשיים סביב הלידה.',
    category: 'emergency',
    phone: '1201',
    url: SRC.kzEran,
    source: SRC.kzEran,
  },
  {
    seedId: 'link.tipat-halav-hotline',
    title: 'מוקד טיפת חלב',
    notes: 'אחיות, יועצות הנקה ושינה ותזונאיות — להורים לילדים עד גיל 6.',
    category: 'emergency',
    phone: '*5400',
    url: SRC.govTipatHalavHotline,
    source: SRC.govTipatHalavHotline,
  },

  // ───────── בתי חולים ─────────
  {
    seedId: 'link.lis-info',
    title: 'ליס (איכילוב) — חדרי לידה',
    notes: 'מיון יולדות: 03-6925678. בהגעה ללידה — תעודת זהות (והפניה אם יש).',
    category: 'hospital',
    phone: '03-6925633',
    url: SRC.lisInfo,
    source: SRC.lisInfo,
  },
  {
    seedId: 'link.lis-tours',
    title: 'ליס — סיורים בחדרי לידה',
    notes: 'ללא תשלום, כשעה וחצי, בהרשמה מראש.',
    category: 'hospital',
    url: SRC.lisTours,
  },
  {
    seedId: 'link.lis-mamy',
    title: 'מאמי ליס — מועדון היולדות',
    notes: 'קורסי הכנה, סדנאות ומלונית.',
    category: 'hospital',
    url: SRC.lisMamy,
  },
  {
    seedId: 'link.sheba-triage',
    title: 'שיבא — מיון יולדות: מתי להגיע',
    category: 'hospital',
    url: SRC.shebaTriage,
  },
  {
    seedId: 'link.sheba-tour',
    title: 'שיבא — סיור לידה',
    notes: 'יש גם סיור וירטואלי.',
    category: 'hospital',
    url: SRC.shebaTour,
  },
  {
    seedId: 'link.wolfson-booklet',
    title: 'וולפסון — חוברת מידע ליולדת (PDF)',
    category: 'hospital',
    url: SRC.wolfsonBooklet,
  },
  {
    seedId: 'link.beilinson-booklet',
    title: 'בילינסון — חוברת מידע ליולדת ולמלווה',
    category: 'hospital',
    url: SRC.beilinsonBooklet,
  },
  {
    seedId: 'link.meir-when-to-come',
    title: 'מאיר — מתי להגיע לחדר הלידה (PDF)',
    category: 'hospital',
    url: SRC.meirWhenToCome,
  },

  // ───────── זכויות וביטוח לאומי ─────────
  {
    seedId: 'link.kz-guide',
    title: 'כל זכות — מדריך ליולדת',
    notes: 'כל הזכויות מהלידה ועד סוף השנה הראשונה, במקום אחד.',
    category: 'rights',
    url: SRC.kzGuideNewMother,
  },
  {
    seedId: 'link.btl-birth-grant',
    title: 'ביטוח לאומי — מענק לידה',
    category: 'rights',
    url: SRC.btlBirthGrant,
  },
  {
    seedId: 'link.btl-maternity-claim',
    title: 'ביטוח לאומי — איך מקבלים דמי לידה',
    category: 'rights',
    url: SRC.btlMaternityHowToClaim,
  },
  {
    seedId: 'link.btl-maternity-eligibility',
    title: 'ביטוח לאומי — תנאי זכאות לדמי לידה',
    category: 'rights',
    url: SRC.btlMaternityEligibility,
  },
  {
    seedId: 'link.gov-maternity-claim',
    title: 'gov.il — תביעה מקוונת לדמי לידה',
    category: 'rights',
    url: SRC.govMaternityClaim,
  },
  {
    seedId: 'link.btl-savings',
    title: 'ביטוח לאומי — חיסכון לכל ילד',
    notes: 'בוחרים קופה ומסלול תוך 6 חודשים מהלידה.',
    category: 'rights',
    url: SRC.btlSavingsNewborn,
  },
  {
    seedId: 'link.kz-partner-leave',
    title: 'כל זכות — היעדרות בן/בת הזוג אחרי לידה',
    category: 'rights',
    url: SRC.kzPartnerLeave,
  },
  {
    seedId: 'link.kz-maternity-leave',
    title: 'כל זכות — חופשת לידה',
    category: 'rights',
    url: SRC.kzMaternityLeave,
  },
  {
    seedId: 'link.kz-breastfeeding-rights',
    title: 'כל זכות — זכויות מניקות ושעת הורות',
    category: 'rights',
    url: SRC.kzBreastfeedingRights,
  },
  {
    seedId: 'link.kz-tax-credits',
    title: 'כל זכות — נקודות זיכוי להורים',
    category: 'rights',
    url: SRC.kzTaxCredits,
  },

  // ───────── רישום ומסמכים ─────────
  {
    seedId: 'link.gov-naming',
    title: 'רשות האוכלוסין — רישום שם הנולד',
    notes: 'אונליין וללא עלות.',
    category: 'registration',
    url: SRC.govNaming,
  },
  {
    seedId: 'link.kz-birth-notice',
    title: 'כל זכות — הודעת לידה ורישום התינוק',
    category: 'registration',
    url: SRC.kzBirthNotice,
  },
  {
    seedId: 'link.maccabi-new-baby',
    title: 'מכבי — רישום תינוק חדש',
    notes: 'בקופות אחרות — חפשו "רישום תינוק" באתר או באפליקציה.',
    category: 'registration',
    url: SRC.maccabiNewBaby,
  },
  {
    seedId: 'link.gov-daycare',
    title: 'gov.il — רישום למעונות יום',
    category: 'registration',
    url: SRC.govDaycareRegistration,
  },
  {
    seedId: 'link.tlv-daycare',
    title: 'עיריית תל אביב — מעונות יום',
    category: 'registration',
    url: SRC.tlvDaycare,
  },

  // ───────── בריאות ─────────
  {
    seedId: 'link.tlv-tipat-halav',
    title: 'טיפות חלב בתל אביב',
    notes: '15 תחנות עירוניות, חינם לתושבי העיר. תורים ב"דיגיתל שלי" או ב-106.',
    category: 'health',
    url: SRC.tlvTipatHalav,
  },
  {
    seedId: 'link.gov-tipat-halav',
    title: 'איתור טיפת חלב וקביעת תור',
    category: 'health',
    url: SRC.govTipatHalavAppointments,
  },
  {
    seedId: 'link.maccabi-pregnancy-er',
    title: 'הריון — מתי לפנות למיון',
    category: 'health',
    url: SRC.maccabiPregnancyEr,
  },
  {
    seedId: 'link.kz-newborn-screening',
    title: 'כל זכות — בדיקות סקר ליילודים',
    category: 'health',
    url: SRC.kzNewbornScreening,
  },
  {
    seedId: 'link.gov-screening-results',
    title: 'gov.il — תוצאות סקר יילודים',
    category: 'health',
    url: SRC.govNewbornScreeningResults,
  },
  {
    seedId: 'link.maccabi-ppd',
    title: 'דיכאון בהריון ואחרי לידה — מידע',
    category: 'health',
    url: SRC.maccabiPostpartumDepression,
  },
  {
    seedId: 'link.moh-infant-feeding',
    title: 'קווים מנחים להזנת תינוקות (PDF)',
    notes: 'כולל ויטמין D מהלידה וברזל מגיל 4 חודשים.',
    category: 'health',
    url: SRC.mohInfantFeeding,
  },

  // ───────── בטיחות וציוד ─────────
  {
    seedId: 'link.beterem-first-gear',
    title: 'בטרם — ציוד ראשוני לתינוק',
    category: 'safety',
    url: SRC.beteremFirstGear,
  },
  {
    seedId: 'link.beterem-car-seat',
    title: 'בטרם — מושב בטיחות לתינוק',
    category: 'safety',
    url: SRC.beteremCarSeat,
  },
  {
    seedId: 'link.beterem-technicians',
    title: 'בטרם — טכנאי מושבי בטיחות',
    category: 'safety',
    url: SRC.beteremSeatTechnicians,
  },
  {
    seedId: 'link.beterem-safe-care',
    title: 'בטרם — כללים לטיפול בטוח בתינוק',
    category: 'safety',
    url: SRC.beteremSafeCare,
  },
  {
    seedId: 'link.sii-crib',
    title: 'מכון התקנים — מיטה, עריסה ולול',
    category: 'safety',
    url: SRC.siiCrib,
  },

  // ───────── תמיכה והנקה ─────────
  {
    seedId: 'link.lll-israel',
    title: 'ליגת לה לצ׳ה ישראל — תמיכה בהנקה',
    notes: 'מתנדבות, קבוצות וקו תמיכה.',
    category: 'support',
    url: SRC.lllIsrael,
  },
];
