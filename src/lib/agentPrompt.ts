/**
 * The prompt a person copies from Settings and pastes to an AI agent so it can connect to Kinun's MCP server
 * (mcp-worker/, docs/MCP.md). The token is a secret, so it only ever lives in this device's localStorage.
 */

export const TOKEN_PLACEHOLDER = '<הטוקן>';

/** Origin of the worker ("https://kinun-mcp.example.workers.dev"), or null if it isn't a usable https URL. */
export function normalizeMcpBase(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const u = new URL(text);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && u.hostname === 'localhost')) return null;
    return u.origin;
  } catch {
    return null;
  }
}

export function buildAgentPrompt(opts: { baseUrl: string; token?: string }): string {
  const base = normalizeMcpBase(opts.baseUrl) ?? 'https://<כתובת-השרת>';
  const token = opts.token?.trim() || TOKEN_PLACEHOLDER;
  const endpoint = `${base}/mcp`;

  return [
    'את/ה מתחבר/ת לקינון — אפליקציה משותפת לזוג לקראת הלידה, עם ארבע רשימות: משימות, ציוד, תיק לידה וקישורים.',
    'הרשימות מסונכרנות בזמן אמת, כך שכל מה שתכתוב/י יופיע אצל שניהם בטלפון.',
    '',
    'חיבור (שרת MCP מרוחק, Streamable HTTP):',
    `- כתובת: ${endpoint}`,
    `- אימות: הכותרת Authorization: Bearer ${token}`,
    `- אם הלקוח מקבל רק כתובת, בלי כותרות (למשל מחבר מותאם אישית ב-claude.ai): ${endpoint}/${token}`,
    `- Claude Code: claude mcp add --transport http kinun ${endpoint} --header "Authorization: Bearer ${token}"`,
    '',
    'כללי עבודה:',
    '1. מתחילים ב-get_overview, ולפני שמוסיפים משהו בודקים עם list_items שהוא עוד לא קיים.',
    '2. כותרות הפריטים בעברית, קצרות, בלי נקודה בסוף. קטגוריות לפי list_categories.',
    '3. אפשר לקרוא, להוסיף, לערוך ולסמן כבוצע (mark_done). אי אפשר למחוק, ולא צריך.',
    '4. לא מוסיפים עצות רפואיות כטקסט חופשי. מידע על בריאות או זכויות מוסיפים רק עם קישור למקור רשמי.',
    '5. לפני שינוי של פריט קיים מראים לי מה עומד להשתנות, אלא אם ביקשתי במפורש.',
    '6. הטוקן הוא סוד. לא מדפיסים אותו, לא שומרים אותו בקבצים או בהיסטוריית git, ולא שולחים אותו הלאה.',
  ].join('\n');
}
