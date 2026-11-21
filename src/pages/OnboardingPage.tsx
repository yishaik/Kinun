import { Copy } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useActions, useSession } from '../data/session';
import { isValidEmail } from '../data/store';
import { isAllowedEmail, suggestedPartnerEmail } from '../lib/access';
import { useToast } from '../data/toast';
import { firstName } from '../lib/format';
import { isValidIsoDate } from '../lib/pregnancy';

export function OnboardingPage() {
  const { user, loadError } = useSession();
  const actions = useActions();
  const { toast } = useToast();
  const [name, setName] = useState(`הבית של ${firstName(user?.name ?? '')}`.trim());
  const [dueDate, setDueDate] = useState('');
  const [partner, setPartner] = useState(() => suggestedPartnerEmail(user?.email));
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (partner && !isValidEmail(partner)) return toast('כתובת ה-Gmail של בן/בת הזוג לא תקינה', 'error');
    // The app is private — firestore.rules rejects a household with anyone outside the allowlist.
    if (partner && !isAllowedEmail(partner)) return toast('האפליקציה פרטית — אפשר להוסיף רק חשבון מורשה', 'error');
    if (dueDate && !isValidIsoDate(dueDate)) return toast('התאריך לא תקין', 'error');
    setBusy(true);
    try {
      await actions.createHousehold({
        name: name.trim() || 'הבית שלנו',
        dueDate: dueDate || null,
        partnerEmail: partner.trim() || null,
      });
    } catch (err) {
      toast(`לא הצלחנו ליצור: ${(err as Error).message}`, 'error');
      setBusy(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user?.email ?? '');
      toast('הכתובת הועתקה', 'success');
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="pt-safe mx-auto min-h-dvh max-w-md px-4 pt-12 pb-10">
      <div className="px-2">
        <h1 className="text-large-title">בואו נכין את הקן</h1>
        <p className="mt-2 text-body text-twig-soft">
          שלוש שאלות, ואז תקבלו רשימות מוכנות: משימות, ציוד, תיק לידה וקישורים — ואפשר לשנות בהן הכול.
        </p>
      </div>

      {loadError && <p className="mt-4 rounded-xl bg-brick-soft px-4 py-3 text-subhead text-brick-ink">{loadError}</p>}

      <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
        <div>
          <label className="label px-4" htmlFor="o-name">
            איך לקרוא לבית?
          </label>
          <input id="o-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label px-4" htmlFor="o-due">
            תאריך לידה משוער
          </label>
          <input
            id="o-due"
            type="date"
            className="field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <p className="list-footer">לפיו המשימות מסודרות לפי שבועות. אפשר להוסיף גם אחר כך.</p>
        </div>
        <div>
          <label className="label px-4" htmlFor="o-partner">
            ה-Gmail של בן/בת הזוג
          </label>
          <input
            id="o-partner"
            type="email"
            dir="ltr"
            className="field text-end"
            placeholder="name@gmail.com"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
          <p className="list-footer">
            האפליקציה פרטית: אפשר לצרף רק חשבון מורשה. הוא נכנס עם Google ורואה את אותן רשימות.
          </p>
        </div>
        <button type="submit" className="btn-primary mt-2 min-h-[50px]" disabled={busy}>
          {busy ? 'מכינים את הרשימות…' : 'יצירת הרשימות שלנו'}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="list-header">בן/בת הזוג כבר יצר/ה?</h2>
        <div className="shelf ios-list overflow-hidden">
          <button
            type="button"
            onClick={copyEmail}
            className="row-tap flex min-h-11 w-full items-center gap-3 px-4 text-robin"
          >
            <Copy className="size-5 shrink-0" aria-hidden />
            <span dir="ltr" className="min-w-0 flex-1 truncate text-start">
              {user?.email}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void actions.signOut()}
            className="row-tap flex min-h-11 w-full items-center px-4 text-start text-brick"
          >
            זה לא החשבון הנכון — התנתקות
          </button>
        </div>
        <p className="list-footer">בקשו להוסיף בהגדרות את הכתובת שלכם. ברגע שתתווסף, הרשימות יופיעו כאן לבד.</p>
      </section>
    </main>
  );
}
