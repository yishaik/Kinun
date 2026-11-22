/** "סימני אזהרה" — when to call MDA 101, when to go to the maternity ER, when to get checked soon. */
import { Phone, Siren } from 'lucide-react';
import { Link } from 'react-router';
import { MedicalNote, SourceLink } from '../components/info';
import { PageTitle } from '../components/ui';
import { WARNING_GROUPS, type WarningGroup } from '../content/warnings';
import { useHousehold } from '../data/session';
import { telHref } from '../lib/format';

const GROUP_STYLE: Record<WarningGroup['id'], { bar: string; title: string }> = {
  mda: { bar: 'bg-brick', title: 'text-brick-ink' },
  er: { bar: 'bg-straw', title: 'text-straw-ink' },
  soon: { bar: 'bg-lagoon', title: 'text-lagoon' },
};

export function WarningsPage() {
  const household = useHousehold();
  const hospital = household.hospital;
  return (
    <>
      <PageTitle>סימני אזהרה</PageTitle>
      <p className="mb-4 px-1 text-subhead text-twig-soft">
        מתי מתקשרים למד״א, מתי נוסעים למיון היולדות ומתי מספיק להיבדק בהקדם. בכל ספק — פונים.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <a href="tel:101" className="btn-danger w-full">
          <Siren className="size-5" aria-hidden /> מד״א 101
        </a>
        {hospital?.phone ? (
          <a
            href={telHref(hospital.phone)}
            className="btn-primary w-full"
            aria-label={`חיוג לחדר הלידה, ${hospital.name}`}
          >
            <Phone className="size-5" aria-hidden /> חדר הלידה
          </a>
        ) : (
          <Link to="/settings" className="btn-outline w-full">
            הוספת חדר לידה
          </Link>
        )}
      </div>

      {WARNING_GROUPS.map((g) => {
        const style = GROUP_STYLE[g.id];
        return (
          <section key={g.id} className="widget mb-5 overflow-hidden" aria-labelledby={`warn-${g.id}`}>
            <div className={`h-1.5 ${style.bar}`} aria-hidden />
            <div className="p-4 pb-2">
              <h2 id={`warn-${g.id}`} className={`text-title3 ${style.title}`}>
                {g.title}
              </h2>
              <p className="mt-1 text-subhead text-twig-soft">{g.intro}</p>
            </div>
            <ul className="ios-list">
              {g.items.map((it) => (
                <li key={it.text} className="px-4 py-3">
                  <p className="text-body font-semibold leading-snug">{it.text}</p>
                  {it.detail && <p className="mt-1 text-subhead text-twig-soft">{it.detail}</p>}
                  <SourceLink url={it.source} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <MedicalNote />
    </>
  );
}
