import { Download, ExternalLink, LogOut, Share2, Trash2, UserPlus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Avatar, PageTitle } from '../components/ui';
import { CONTENT_RESEARCHED_AT, CONTENT_VERSION } from '../content';
import { useActions, useHousehold, useSession } from '../data/session';
import { isValidEmail, normalizeEmail } from '../data/store';
import { useToast } from '../data/toast';
import { formatIsoDate } from '../lib/format';
import { isIOS, isStandalone } from '../lib/platform';
import { isValidIsoDate } from '../lib/pregnancy';
import type { HospitalInfo } from '../lib/types';

const REPO_URL = 'https://github.com/yishaik/Kinun';

/** Presets for hospitals in the Tel Aviv area. Only verified phone numbers are filled in. */
const HOSPITAL_PRESETS: HospitalInfo[] = [
  {
    name: 'ליס (איכילוב)',
    phone: '03-6925633',
    address: 'ויצמן 6, תל אביב',
    url: 'https://www.tasmc.org.il/lis/about/info/',
    notes: 'מיון יולדות: 03-6925678',
  },
  {
    name: 'שיבא, תל השומר',
    phone: '',
    address: 'דרך שיבא 2, רמת גן',
    url: 'https://www.sheba.co.il/pregnancy/clinics/maternity-triage-er',
    notes: '',
  },
  { name: 'וולפסון', phone: '', address: 'הלוחמים 62, חולון', url: '', notes: '' },
  { name: 'בילינסון', phone: '', address: "ז'בוטינסקי 39, פתח תקווה", url: '', notes: '' },
  { name: 'מאיר', phone: '', address: 'טשרניחובסקי 59, כפר סבא', url: '', notes: '' },
];

const emptyHospital: HospitalInfo = { name: '', phone: '', address: '', url: '', notes: '' };

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 font-display text-xl">{title}</h2>
      <div className="shelf p-4">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const household = useHousehold();
  const { user, items, households, selectHousehold, store } = useSession();
  const actions = useActions();
  const { toast } = useToast();

  const [details, setDetails] = useState({
    name: household.name,
    dueDate: household.dueDate ?? '',
    birthDate: household.birthDate ?? '',
    babyName: household.babyName ?? '',
  });
  const [hospital, setHospital] = useState<HospitalInfo>(household.hospital ?? emptyHospital);
  const [email, setEmail] = useState('');
  const pending = actions.pendingContent();

  const saveDetails = (e: FormEvent) => {
    e.preventDefault();
    if (details.dueDate && !isValidIsoDate(details.dueDate)) return toast('תאריך משוער לא תקין', 'error');
    if (details.birthDate && !isValidIsoDate(details.birthDate)) return toast('תאריך לידה לא תקין', 'error');
    void actions.updateHousehold({
      name: details.name.trim() || household.name,
      dueDate: details.dueDate || null,
      birthDate: details.birthDate || null,
      babyName: details.babyName.trim() || null,
    });
    toast('נשמר', 'success');
  };

  const saveHospital = (e: FormEvent) => {
    e.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(hospital).map(([k, v]) => [k, v.trim()]),
    ) as unknown as HospitalInfo;
    void actions.updateHousehold({ hospital: clean.name ? clean : null });
    toast('פרטי בית החולים נשמרו', 'success');
  };

  const addEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return toast('כתובת אימייל לא תקינה', 'error');
    const normalized = normalizeEmail(email);
    if (household.memberEmails.includes(normalized)) return toast('הכתובת כבר ברשימה', 'info');
    void actions.addMemberEmail(normalized);
    setEmail('');
    toast('נוסף. עכשיו שלחו את הקישור לאפליקציה והתחברו עם אותו חשבון Google.', 'success');
  };

  const shareApp = async () => {
    const url = window.location.origin;
    const text = 'הוספתי אותך לקינון — הרשימות שלנו לקראת הלידה. נכנסים עם חשבון Google:';
    try {
      if (navigator.share) await navigator.share({ title: 'קינון', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast('הקישור הועתק', 'success');
      }
    } catch {
      /* user cancelled */
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), household, items }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kinun-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <>
      <PageTitle>הגדרות</PageTitle>

      <Card title="הבית שלנו">
        <form className="flex flex-col gap-3" onSubmit={saveDetails}>
          <div>
            <label className="label" htmlFor="s-name">
              שם
            </label>
            <input
              id="s-name"
              className="field"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="s-due">
                תאריך משוער
              </label>
              <input
                id="s-due"
                type="date"
                className="field"
                value={details.dueDate}
                onChange={(e) => setDetails({ ...details, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="s-birth">
                תאריך לידה בפועל
              </label>
              <input
                id="s-birth"
                type="date"
                className="field"
                value={details.birthDate}
                onChange={(e) => setDetails({ ...details, birthDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="s-baby">
              שם התינוק/ת
            </label>
            <input
              id="s-baby"
              className="field"
              value={details.babyName}
              onChange={(e) => setDetails({ ...details, babyName: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary self-start">
            שמירה
          </button>
        </form>
      </Card>

      <Card title="בית החולים">
        <form className="flex flex-col gap-3" onSubmit={saveHospital}>
          <div className="-mx-1 flex flex-wrap gap-2">
            {HOSPITAL_PRESETS.map((h) => (
              <button
                key={h.name}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${hospital.name === h.name ? 'border-robin bg-robin-soft text-robin-deep' : 'border-line'}`}
                onClick={() => setHospital({ ...h, phone: h.phone || hospital.phone })}
              >
                {h.name}
              </button>
            ))}
          </div>
          <div>
            <label className="label" htmlFor="h-name">
              שם בית החולים
            </label>
            <input
              id="h-name"
              className="field"
              value={hospital.name}
              onChange={(e) => setHospital({ ...hospital, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="h-phone">
              טלפון חדר לידה / מיון יולדות
            </label>
            <input
              id="h-phone"
              className="field"
              type="tel"
              dir="ltr"
              value={hospital.phone}
              onChange={(e) => setHospital({ ...hospital, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="h-address">
              כתובת (לניווט)
            </label>
            <input
              id="h-address"
              className="field"
              value={hospital.address}
              onChange={(e) => setHospital({ ...hospital, address: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="h-url">
              אתר
            </label>
            <input
              id="h-url"
              className="field"
              type="url"
              dir="ltr"
              value={hospital.url}
              onChange={(e) => setHospital({ ...hospital, url: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="h-notes">
              הערות
            </label>
            <input
              id="h-notes"
              className="field"
              value={hospital.notes}
              onChange={(e) => setHospital({ ...hospital, notes: e.target.value })}
            />
          </div>
          <p className="text-sm text-twig-soft">את טלפון חדר הלידה כדאי לאמת מול אתר בית החולים או בסיור.</p>
          <button type="submit" className="btn-primary self-start">
            שמירה
          </button>
        </form>
      </Card>

      <Card title="מי משתמש באפליקציה">
        <ul className="mb-4 flex flex-col gap-3">
          {household.memberEmails.map((e) => {
            const profile = Object.values(household.members).find((m) => m.email === e);
            const isMe = e === user?.email;
            return (
              <li key={e} className="flex items-center gap-3">
                <Avatar name={profile?.name ?? e} photoURL={profile?.photoURL} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{profile?.name ?? 'עוד לא התחבר/ה'}</p>
                  <p className="truncate text-sm text-twig-soft" dir="ltr">
                    {e}
                  </p>
                </div>
                {!isMe && (
                  <button
                    type="button"
                    aria-label={`הסרת ${e}`}
                    className="rounded-full p-2 text-twig-soft hover:bg-line"
                    onClick={() => {
                      void actions.removeMemberEmail(e);
                      toast('הוסר', 'info', { label: 'ביטול', onClick: () => void actions.addMemberEmail(e) });
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <form className="flex gap-2" onSubmit={addEmail}>
          <input
            className="field flex-1"
            type="email"
            dir="ltr"
            placeholder="partner@gmail.com"
            aria-label="כתובת Gmail להוספה"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary shrink-0" aria-label="הוספה">
            <UserPlus className="size-5" aria-hidden />
          </button>
        </form>
        <p className="mt-2 text-sm text-twig-soft">
          מי שהכתובת שלו ברשימה נכנס עם Google ורואה את כל הרשימות, מסונכרן בזמן אמת.
        </p>
        <button type="button" className="btn-outline mt-3 w-full" onClick={shareApp}>
          <Share2 className="size-4" aria-hidden /> שליחת קישור לאפליקציה
        </button>
        {households.length > 1 && (
          <div className="mt-4">
            <label className="label" htmlFor="s-household">
              מעבר בין משקי בית
            </label>
            <select
              id="s-household"
              className="field"
              value={household.id}
              onChange={(e) => selectHousehold(e.target.value)}
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {!isStandalone() && (
        <Card title="התקנה בטלפון">
          {isIOS() ? (
            <p>
              באייפון: פתחו את האפליקציה ב-Safari, הקישו על כפתור השיתוף ואז על <strong>הוספה למסך הבית</strong>. אחרי
              ההתקנה צריך להתחבר פעם אחת גם מתוך האפליקציה.
            </p>
          ) : (
            <p>
              באנדרואיד: בתפריט של Chrome (שלוש הנקודות) בחרו <strong>התקנת אפליקציה</strong> או{' '}
              <strong>הוספה למסך הבית</strong>.
            </p>
          )}
        </Card>
      )}

      <Card title="תוכן ברירת המחדל">
        <p className="mb-3 text-twig-soft">
          גרסה {CONTENT_VERSION}, נבדקה מול מקורות רשמיים ב-{formatIsoDate(CONTENT_RESEARCHED_AT)}. סכומים ומועדים
          משתנים — לפני פעולה כדאי לפתוח את המקור שמופיע בכל פריט.
        </p>
        {pending.length > 0 ? (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={async () => {
              const n = await actions.applyPendingContent();
              toast(`נוספו ${n} פריטים`, 'success');
            }}
          >
            הוספת {pending.length} פריטים חדשים מהתוכן המעודכן
          </button>
        ) : (
          <p className="text-sm">כל התוכן העדכני כבר אצלכם.</p>
        )}
        {household.dismissedSeedIds.length > 0 && (
          <button
            type="button"
            className="btn-quiet mt-2 px-2"
            onClick={async () => {
              const n = await actions.restoreDismissedContent();
              toast(`שוחזרו ${n} פריטים`, 'success');
            }}
          >
            שחזור {household.dismissedSeedIds.length} פריטים שמחקתם
          </button>
        )}
      </Card>

      <Card title="חשבון וגיבוי">
        <p className="mb-3">
          מחובר/ת כ-<span dir="ltr">{user?.email}</span>
          {store.mode === 'demo' && ' (מצב הדגמה)'}
        </p>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn-outline w-full" onClick={exportJson}>
            <Download className="size-4" aria-hidden /> הורדת גיבוי (JSON)
          </button>
          <button type="button" className="btn-outline w-full" onClick={() => void actions.signOut()}>
            <LogOut className="size-4" aria-hidden /> התנתקות
          </button>
        </div>
      </Card>

      <p className="mb-6 text-center text-sm text-twig-soft">
        הקוד של קינון נמצא ב-{' '}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-4"
        >
          GitHub <ExternalLink className="size-3" aria-hidden />
        </a>
      </p>
    </>
  );
}
