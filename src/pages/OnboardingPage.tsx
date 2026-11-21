import { Copy } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useActions, useSession } from '../data/session';
import { isValidEmail } from '../data/store';
import { useToast } from '../data/toast';
import { firstName } from '../lib/format';
import { isValidIsoDate } from '../lib/pregnancy';

export function OnboardingPage() {
  const { user, loadError } = useSession();
  const actions = useActions();
  const { toast } = useToast();
  const [name, setName] = useState(`הבית של ${firstName(user?.name ?? '')}`.trim());
  const [dueDate, setDueDate] = useState('');
  const [partner, setPartner] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (partner && !isValidEmail(partner)) return toast('כתובת ה-Gmail של בן/בת הזוג לא תקינה', 'error');
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
    <main className="pt-safe mx-auto min-h-dvh max-w-md px-6 pt-10 pb-10">
      <h1 className="font-display text-4xl leading-tight">בואו נכין את הקן</h1>
      <p className="mt-2 text-lg text-twig-soft">
        שלוש שאלות, ואז תקבלו רשימות מוכנות: משימות, ציוד, תיק לידה וקישורים — ואפשר לשנות בהן הכול.
      </p>

      {loadError && <p className="mt-4 rounded-xl bg-brick-soft px-4 py-3 text-brick">{loadError}</p>}

      <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
        <div>
          <label className="label" htmlFor="o-name">
            איך לקרוא לבית?
          </label>
          <input id="o-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="o-due">
            תאריך לידה משוער
          </label>
          <input
            id="o-due"
            type="date"
            className="field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <p className="mt-1 text-sm text-twig-soft">לפיו המשימות מסודרות לפי שבועות. אפשר להוסיף גם אחר כך.</p>
        </div>
        <div>
          <label className="label" htmlFor="o-partner">
            ה-Gmail של בן/בת הזוג
          </label>
          <input
            id="o-partner"
            type="email"
            dir="ltr"
            className="field"
            placeholder="name@gmail.com"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
          <p className="mt-1 text-sm text-twig-soft">מי שהכתובת שלו כאן נכנס עם Google ורואה את אותן רשימות.</p>
        </div>
        <button type="submit" className="btn-primary mt-2 text-lg" disabled={busy}>
          {busy ? 'מכינים את הרשימות…' : 'יצירת הרשימות שלנו'}
        </button>
      </form>

      <section className="mt-10 rounded-[var(--radius-shelf)] border border-line p-4">
        <h2 className="font-semibold">בן/בת הזוג כבר יצר/ה?</h2>
        <p className="mt-1 text-twig-soft">בקשו להוסיף בהגדרות את הכתובת שלכם. ברגע שתתווסף, הרשימות יופיעו כאן לבד.</p>
        <button type="button" onClick={copyEmail} className="btn-outline mt-3 w-full">
          <Copy className="size-4" aria-hidden />
          <span dir="ltr">{user?.email}</span>
        </button>
        <button type="button" onClick={() => void actions.signOut()} className="btn-quiet mt-1 w-full">
          זה לא החשבון הנכון — התנתקות
        </button>
      </section>
    </main>
  );
}
