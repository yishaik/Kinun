import { Download, ExternalLink, LogOut, MinusCircle, Share2, UserPlus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Avatar, PageTitle } from '../components/ui';
import { ALLOWED_EMAILS } from '../lib/access';
import { CONTENT_RESEARCHED_AT, CONTENT_VERSION } from '../content';
import { useActions, useHousehold, useSession } from '../data/session';
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

function Group({ title, footer, children }: { title: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="list-header uppercase">{title}</h2>
      <div className="shelf ios-list overflow-hidden">{children}</div>
      {footer && <div className="list-footer">{footer}</div>}
    </section>
  );
}

/** iOS form cell: label at the leading edge, the field filling the rest. */
function FieldRow({ label, children, htmlFor }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center gap-3 ps-4 pe-4">
      <label htmlFor={htmlFor} className="w-32 shrink-0 text-body">
        {label}
      </label>
      {children}
    </div>
  );
}

const cellInput =
  'min-h-11 min-w-0 flex-1 bg-transparent py-2 text-twig placeholder:text-twig-faint focus:outline-none';

function ActionRow({
  children,
  onClick,
  tone = 'robin',
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'robin' | 'brick';
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`row-tap flex min-h-11 w-full items-center gap-3 px-4 text-start text-body ${tone === 'brick' ? 'text-brick' : 'text-robin'}`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
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

  // The app is private: only allowlisted accounts can be added (firestore.rules enforces the same).
  const addable = ALLOWED_EMAILS.filter((e) => !household.memberEmails.includes(e));
  const addEmail = (email: string) => {
    void actions.addMemberEmail(email);
    toast('נוסף לבית', 'success');
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

      <form onSubmit={saveDetails}>
        <Group title="הבית שלנו">
          <FieldRow label="שם" htmlFor="s-name">
            <input
              id="s-name"
              className={cellInput}
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="תאריך משוער" htmlFor="s-due">
            <input
              id="s-due"
              type="date"
              className={cellInput}
              value={details.dueDate}
              onChange={(e) => setDetails({ ...details, dueDate: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="תאריך לידה בפועל" htmlFor="s-birth">
            <input
              id="s-birth"
              type="date"
              className={cellInput}
              value={details.birthDate}
              onChange={(e) => setDetails({ ...details, birthDate: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="שם התינוק/ת" htmlFor="s-baby">
            <input
              id="s-baby"
              className={cellInput}
              placeholder="אפשר גם אחר כך"
              value={details.babyName}
              onChange={(e) => setDetails({ ...details, babyName: e.target.value })}
            />
          </FieldRow>
          <button
            type="submit"
            className="row-tap flex min-h-11 w-full items-center px-4 text-body font-semibold text-robin"
          >
            שמירה
          </button>
        </Group>
      </form>

      <form onSubmit={saveHospital}>
        <Group title="בית החולים" footer="את טלפון חדר הלידה כדאי לאמת מול אתר בית החולים או בסיור.">
          <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
            {HOSPITAL_PRESETS.map((h) => (
              <button
                key={h.name}
                type="button"
                aria-pressed={hospital.name === h.name}
                className={`press shrink-0 rounded-full px-3.5 py-1.5 text-subhead font-medium transition-colors ${
                  hospital.name === h.name ? 'bg-robin text-on-robin' : 'bg-fill text-twig'
                }`}
                onClick={() => setHospital({ ...h, phone: h.phone || hospital.phone })}
              >
                {h.name}
              </button>
            ))}
          </div>
          <FieldRow label="שם בית החולים" htmlFor="h-name">
            <input
              id="h-name"
              className={cellInput}
              value={hospital.name}
              onChange={(e) => setHospital({ ...hospital, name: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="טלפון חדר לידה" htmlFor="h-phone">
            <input
              id="h-phone"
              className={`${cellInput} text-end`}
              type="tel"
              dir="ltr"
              value={hospital.phone}
              onChange={(e) => setHospital({ ...hospital, phone: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="כתובת (לניווט)" htmlFor="h-address">
            <input
              id="h-address"
              className={cellInput}
              value={hospital.address}
              onChange={(e) => setHospital({ ...hospital, address: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="אתר" htmlFor="h-url">
            <input
              id="h-url"
              className={`${cellInput} text-end`}
              type="url"
              dir="ltr"
              value={hospital.url}
              onChange={(e) => setHospital({ ...hospital, url: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="הערות" htmlFor="h-notes">
            <input
              id="h-notes"
              className={cellInput}
              value={hospital.notes}
              onChange={(e) => setHospital({ ...hospital, notes: e.target.value })}
            />
          </FieldRow>
          <button
            type="submit"
            className="row-tap flex min-h-11 w-full items-center px-4 text-body font-semibold text-robin"
          >
            שמירה
          </button>
        </Group>
      </form>

      <Group
        title="מי משתמש באפליקציה"
        footer="האפליקציה פרטית: רק החשבונות המורשים יכולים להתחבר ולראות את הרשימות, מסונכרנות בזמן אמת."
      >
        {household.memberEmails.map((e) => {
          const profile = Object.values(household.members).find((m) => m.email === e);
          const isMe = e === user?.email;
          return (
            <div key={e} className="flex min-h-14 items-center gap-3 ps-4 pe-2">
              <Avatar name={profile?.name ?? e} photoURL={profile?.photoURL} size={36} />
              <div className="min-w-0 flex-1 py-2">
                <p className="truncate text-body">
                  {profile?.name ?? 'עוד לא התחבר/ה'}
                  {isMe && <span className="text-twig-soft"> (אני)</span>}
                </p>
                <p className="truncate text-footnote text-twig-soft" dir="ltr">
                  {e}
                </p>
              </div>
              {!isMe && (
                <button
                  type="button"
                  aria-label={`הסרת ${e}`}
                  className="press flex size-11 items-center justify-center rounded-full text-brick"
                  onClick={() => {
                    void actions.removeMemberEmail(e);
                    toast('הוסר', 'info', { label: 'ביטול', onClick: () => void actions.addMemberEmail(e) });
                  }}
                >
                  <MinusCircle className="size-5" aria-hidden />
                </button>
              )}
            </div>
          );
        })}
        {addable.map((e) => (
          <ActionRow key={e} onClick={() => addEmail(e)} icon={<UserPlus className="size-5 shrink-0" aria-hidden />}>
            הוספת <span dir="ltr">{e}</span>
          </ActionRow>
        ))}
        <ActionRow onClick={shareApp} icon={<Share2 className="size-5 shrink-0" aria-hidden />}>
          שליחת קישור לאפליקציה
        </ActionRow>
        {households.length > 1 && (
          <FieldRow label="משק בית" htmlFor="s-household">
            <select
              id="s-household"
              className={cellInput}
              value={household.id}
              onChange={(e) => selectHousehold(e.target.value)}
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </FieldRow>
        )}
      </Group>

      {!isStandalone() && (
        <Group title="התקנה בטלפון">
          <p className="px-4 py-3 text-subhead">
            {isIOS() ? (
              <>
                באייפון: פותחים ב-Safari, מקישים על כפתור השיתוף ואז על <strong>הוספה למסך הבית</strong>. אחרי ההתקנה
                צריך להתחבר פעם אחת גם מתוך האפליקציה.
              </>
            ) : (
              <>
                באנדרואיד: בתפריט של Chrome (שלוש הנקודות) בוחרים <strong>התקנת אפליקציה</strong> או{' '}
                <strong>הוספה למסך הבית</strong>.
              </>
            )}
          </p>
        </Group>
      )}

      <Group
        title="תוכן ברירת המחדל"
        footer={`גרסה ${CONTENT_VERSION}, נבדקה מול מקורות רשמיים ב-${formatIsoDate(CONTENT_RESEARCHED_AT)}. סכומים ומועדים משתנים — לפני פעולה כדאי לפתוח את המקור שמופיע בכל פריט.`}
      >
        {pending.length > 0 ? (
          <ActionRow
            onClick={async () => {
              const n = await actions.applyPendingContent();
              toast(`נוספו ${n} פריטים`, 'success');
            }}
          >
            הוספת {pending.length} פריטים חדשים מהתוכן המעודכן
          </ActionRow>
        ) : (
          <p className="flex min-h-11 items-center px-4 text-body text-twig-soft">כל התוכן העדכני כבר אצלכם.</p>
        )}
        {household.dismissedSeedIds.length > 0 && (
          <ActionRow
            onClick={async () => {
              const n = await actions.restoreDismissedContent();
              toast(`שוחזרו ${n} פריטים`, 'success');
            }}
          >
            שחזור {household.dismissedSeedIds.length} פריטים שמחקתם
          </ActionRow>
        )}
      </Group>

      <Group
        title="חשבון וגיבוי"
        footer={
          <>
            מחובר/ת כ-<span dir="ltr">{user?.email}</span>
            {store.mode === 'demo' && ' (מצב הדגמה)'}
          </>
        }
      >
        <ActionRow onClick={exportJson} icon={<Download className="size-5 shrink-0" aria-hidden />}>
          הורדת גיבוי (JSON)
        </ActionRow>
        <ActionRow
          tone="brick"
          onClick={() => void actions.signOut()}
          icon={<LogOut className="size-5 shrink-0" aria-hidden />}
        >
          התנתקות
        </ActionRow>
      </Group>

      <p className="mb-6 text-center text-footnote text-twig-soft">
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
