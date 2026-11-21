/**
 * Every external URL used by the default content, in one place.
 *
 * Rules (see docs/CONTENT.md):
 * - Prefer official sources: gov.il, btl.gov.il, kolzchut.org.il, health funds, hospitals, Beterem.
 * - Every URL here was opened/verified when added (research date: 2026-11-21).
 * - `npm run check:links` validates that the URLs still respond.
 */
export const SRC = {
  // ---------- ביטוח לאומי ----------
  btlBirthGrant: 'https://www.btl.gov.il/benefits/maternity/maanakleda/Pages/default.aspx',
  btlBirthGrantAmount: 'https://www.btl.gov.il/benefits/maternity/maanakleda/Pages/ShiurMaanakLeda.aspx',
  btlHospitalGrant:
    'https://www.btl.gov.il/benefits/maternity/Pages/%d7%9e%d7%a2%d7%a0%d7%a7%20%d7%90%d7%a9%d7%a4%d7%95%d7%96.aspx',
  btlMaternityHowToClaim:
    'https://www.btl.gov.il/benefits/maternity/Childbirth_Allowance/Pages/%d7%90%d7%95%d7%a4%d7%9f%20%d7%94%d7%92%d7%a9%d7%aa%20%d7%94%d7%aa%d7%91%d7%99%d7%a2%d7%94.aspx',
  btlMaternityEligibility:
    'https://www.btl.gov.il/benefits/maternity/Childbirth_Allowance/Pages/%D7%AA%D7%A0%D7%90%D7%99%20%D7%94%D7%96%D7%9B%D7%90%D7%95%D7%AA.aspx',
  govMaternityClaim: 'https://www.gov.il/he/service/claim_for_birth_payment',
  btlSavingsNewborn: 'https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/nolad.aspx',

  // ---------- כל זכות ----------
  kzGuideNewMother: 'https://www.kolzchut.org.il/he/מדריך_ליולדת',
  kzPartnerLeave: 'https://www.kolzchut.org.il/he/היעדרות_מעבודה_עקב_לידה_של_בת_הזוג_(חופשת_אבהות)',
  kzPartnerMaternityLeave: 'https://www.kolzchut.org.il/he/חופשת_לידה_לבן_זוג_של_יולדת',
  kzMaternityLeave: 'https://www.kolzchut.org.il/he/חופשת_לידה',
  kzNotifyEmployer: 'https://www.kolzchut.org.il/he/מסירת_הודעה_של_עובדת_למעסיק_לגבי_הריונה',
  kzPrenatalTestHours: 'https://www.kolzchut.org.il/he/תשלום_עבור_היעדרות_מהעבודה_עקב_בדיקות_היריון',
  kzTaxCredits: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה_להורה_לילד_עד_גיל_5',
  kzBreastfeedingRights: 'https://www.kolzchut.org.il/he/זכויות_נשים_מניקות',
  kzBirthNotice: 'https://www.kolzchut.org.il/he/רישום_הודעת_לידה_של_תינוק_שנולד_בארץ',
  kzTipatHalav: 'https://www.kolzchut.org.il/he/תחנות_לבריאות_המשפחה_(טיפות_חלב)',
  kzNewbornScreening: 'https://www.kolzchut.org.il/he/בדיקות_לזיהוי_מוקדם_של_מחלות_קשות_ליילודים',
  kzNewbornConsent: 'https://www.kolzchut.org.il/he/קבלת_הסכמת_ההורים_לטיפול_בתינוק_שנולד_(יילוד)_בבית_החולים',
  kzHearingScreening: 'https://www.kolzchut.org.il/he/בדיקות_סינון_שמיעה_ליילודים',
  kzNursingInsuranceKids: 'https://www.kolzchut.org.il/he/פטור_מתשלום_דמי_ביטוח_סיעודי_לתינוקות,_ילדים_ונוער',
  kzDaycare: 'https://www.kolzchut.org.il/he/רישום_למעון_יום_מוכר',
  kzEran: 'https://www.kolzchut.org.il/he/ער%22ן_-_עזרה_ראשונה_נפשית_בטלפון_ובאינטרנט',

  // ---------- gov.il ----------
  govNaming: 'https://www.gov.il/he/service/naming_baby',
  govTipatHalavAppointments: 'https://www.gov.il/he/service/appointment_for_family_health_centers',
  govTipatHalavHotline: 'https://www.gov.il/he/service/family-health-centers-call-center',
  govNewbornScreeningResults: 'https://www.gov.il/he/service/newborn-national-genetic-testing-results',
  govDaycareRegistration: 'https://www.gov.il/he/service/daycare-registration',

  // ---------- עיריית תל אביב-יפו ----------
  tlvTipatHalav: 'https://www.tel-aviv.gov.il/Residents/HealthAndSocial/Pages/TipotChalvLobi.aspx',
  tlvDaycare: 'https://www.tel-aviv.gov.il/Residents/Education/Pages/Daycare.aspx',

  // ---------- קופות חולים / איגודים ----------
  maccabiNewBaby: 'https://www.maccabi4u.co.il/31276/digital-services/administration/new_babies/',
  maccabiGlucoseTest:
    'https://www.maccabi4u.co.il/maccabi_circles/pregnancy-and-birth/pregnancy_birth/tests/glucose-challenge-test/',
  maccabiPertussis: 'https://www.maccabi4u.co.il/eligibilites/2538/',
  maccabiFlu: 'https://www.maccabi4u.co.il/healthguide/vaccines/flu/',
  maccabiGbs: 'https://www.maccabi4u.co.il/maccabi_circles/pregnancy-and-birth/pregnancy_birth/tests/gbs/',
  maccabiPregnancyEr: 'https://www.maccabi4u.co.il/healthguide/emergencies/emergency_situations/pregnancy_emergencies/',
  maccabiLabor: 'https://www.maccabi4u.co.il/healthguide/medicalconditions/לידה/',
  maccabiPostpartumDepression:
    'https://www.maccabi4u.co.il/healthguide/medicalconditions/postpartumpostnataldepression/',
  maccabiBabyEssentials: 'https://www.maccabi4u.co.il/maccabi_circles/children/infants/essentials/',
  maccabiIron: 'https://www.maccabi4u.co.il/maccabi_circles/children/nutrition/iron-deficiency/',
  maccabiPoison: 'https://www.maccabi4u.co.il/healthguide/emergencies/emergency_situations/accident/',
  mohGbsCircular:
    'https://midwives.org.il/wp-content/uploads/2024/01/הנחיות-לביצוע-סיקור-למניעת-אלח-דם-מוקדם-בחיידק-GBS-בילוד.pdf',
  mohInfantFeeding: 'https://www.pediatrics.org.il/images/nutrition-guide-infants-2021.pdf',
  earlyDischargeGuide: 'https://www.pediatrics.org.il/images/SHIHRURMUKDAMYOLDOT.pdf',
  rsvSeason: 'https://www.israelhayom.co.il/health/article/20933476',

  // ---------- בטיחות ----------
  beteremFirstGear:
    'https://beterem.org/new-parents/%D7%A6%D7%99%D7%95%D7%93-%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%99-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7-%D7%9E%D7%94-%D7%A6%D7%A8%D7%99%D7%9A-%D7%9C%D7%A7%D7%A0%D7%95%D7%AA/',
  beteremCarSeat:
    'https://beterem.org/%D7%9E%D7%9E%D7%94-%D7%A0%D7%A4%D7%92%D7%A2%D7%99%D7%9D-%D7%99%D7%9C%D7%93%D7%99%D7%9D/%D7%A1%D7%9B%D7%A0%D7%95%D7%AA-%D7%91%D7%A8%D7%9B%D7%91/',
  beteremSeatOrInfantCarrier:
    'https://beterem.org/new-parents/%D7%90%D7%97%D7%AA-%D7%95%D7%9C%D7%AA%D7%9E%D7%99%D7%93-%D7%A1%D7%9C%D7%A7%D7%9C-%D7%90%D7%95-%D7%9E%D7%95%D7%A9%D7%91-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA-%D7%9C%D7%AA%D7%99%D7%A0%D7%95%D7%A7/',
  beteremSeatTechnicians:
    'https://beterem.org/%D7%97%D7%95%D7%9E%D7%A8%D7%99%D7%9D-%D7%9E%D7%A7%D7%A6%D7%95%D7%A2%D7%99%D7%99%D7%9D/%D7%98%D7%9B%D7%A0%D7%90%D7%99-%D7%9E%D7%95%D7%A9%D7%91%D7%99-%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA/',
  beteremSafeCare:
    'https://beterem.org/new-parents/%D7%9B%D7%9C%D7%9C%D7%99%D7%9D-%D7%9C%D7%98%D7%99%D7%A4%D7%95%D7%9C-%D7%91%D7%98%D7%95%D7%97-%D7%91%D7%AA%D7%99%D7%A0%D7%95%D7%A7/',
  siiCrib: 'https://www.sii.org.il/he/crib/',

  // ---------- בתי חולים (אזור המרכז) ----------
  lisMain: 'https://www.tasmc.org.il/lis/',
  lisInfo: 'https://www.tasmc.org.il/lis/about/info/',
  lisTours: 'https://www.tasmc.org.il/lis/mamy-lis/tours/',
  lisMaternityEr: 'https://www.tasmc.org.il/lis/lis-units/obstetrics-and-pregnanc/er-women/',
  lisMamy: 'https://www.tasmc.org.il/lis/mamy-lis/',
  lisCourseSyllabus:
    'https://tasmc.org.il/media/0ucas2gm/%D7%A1%D7%99%D7%9C%D7%91%D7%95%D7%A1-%D7%A7%D7%95%D7%A8%D7%A1-%D7%94%D7%9B%D7%A0%D7%94-%D7%9C%D7%A0%D7%99%D7%AA%D7%95%D7%97-%D7%A7%D7%99%D7%A1%D7%A8%D7%99-2024.pdf',
  shebaTriage: 'https://www.sheba.co.il/pregnancy/clinics/maternity-triage-er',
  shebaTour:
    'https://maternity.sheba.co.il/%D7%A1%D7%99%D7%95%D7%A8_%D7%9C%D7%99%D7%93%D7%94-%D7%9E%D7%A4%D7%92%D7%A9_%D7%94%D7%99%D7%9B%D7%A8%D7%95%D7%AA',
  shebaCourses: 'https://maternity.sheba.co.il/%D7%A7%D7%95%D7%A8%D7%A1%D7%99%D7%9D',
  wolfsonBooklet: 'https://www.gov.il/BlobFolder/guide/medical-departments-units/he/maternity-v6-digital-1.pdf',
  beilinsonBooklet:
    'https://hospitals.clalit.co.il/rabin/he/departments-and-clinics/nashimbeilinson/pages/information_booklet_for_mother_and_her_partner.aspx',
  meirBirthPlan:
    'https://hospitals.clalit.co.il/meir/he/med/nafro/Documents/תוכנית%20לידה%20-%20מועדון%20יולדות%20מאיר.pdf',
  meirWhenToCome:
    'https://hospitals.clalit.co.il/meir/he/med/gyne/Documents/%d7%a9%d7%a2%d7%aa%20%d7%94%d7%a9%d7%99%d7%9f-%20%d7%92%d7%99%d7%9c%20%d7%a9%d7%9b%d7%98%d7%a8.pdf',

  // ---------- תמיכה ----------
  lllIsrael: 'https://www.lllisrael.org.il/',
} as const;

export type SourceKey = keyof typeof SRC;
