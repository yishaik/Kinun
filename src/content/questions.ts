/**
 * Suggested questions for the doctor / midwife / delivery-room tour. Each one comes from a point
 * the official source tells you to ask about. Researched 2026-11-23.
 */
import { SRC } from './sources';

export const SUGGESTED_QUESTIONS: { text: string; source: string }[] = [
  { text: 'אילו אמצעים להקלה על כאב יש בחדר הלידה שבחרנו?', source: SRC.mohPainRelief },
  {
    text: 'יש לי רקע רפואי (למשל בעמוד השדרה או תרופות לדילול דם) — כדאי להתייעץ מראש עם מרדים לגבי אפידורל?',
    source: SRC.mohPainRelief,
  },
  { text: 'אם יומלץ על זירוז — למה, איך הוא מתבצע ומה צפוי?', source: SRC.mohInduction },
  { text: 'כמה מלווים מותר להכניס לחדר הלידה?', source: SRC.mohLaborSupport },
  { text: 'מה כולל סל ההריון והלידה בקופה שלנו (למשל החזר על דולה או מיילדת)?', source: SRC.mohLaborSupport },
  { text: 'אפשר להיפגש מראש עם מיילדת להכנה אישית ללידה?', source: SRC.mohLaborPlan },
];
