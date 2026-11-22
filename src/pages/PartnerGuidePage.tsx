/** "מדריך לבן/בת הזוג" — practical tips for the birth partner, before, during and after. */
import { Link } from 'react-router';
import { MedicalNote, SourceLink } from '../components/info';
import { Chevron, PageTitle } from '../components/ui';
import { PARTNER_GUIDE } from '../content/partnerGuide';

export function PartnerGuidePage() {
  return (
    <>
      <PageTitle>מדריך לבן/בת הזוג</PageTitle>
      <p className="mb-6 px-1 text-subhead text-twig-soft">
        מה אפשר לעשות כדי לעזור — מההכנות ועד השעות הראשונות עם התינוק.
      </p>
      {PARTNER_GUIDE.map((s) => (
        <section key={s.id} className="mb-7" aria-labelledby={`pg-${s.id}`}>
          <h2 id={`pg-${s.id}`} className="px-4 pb-2 text-title3">
            {s.title}
          </h2>
          <ul className="shelf ios-list overflow-hidden" style={{ ['--sep-inset' as string]: '1rem' }}>
            {s.tips.map((t) => (
              <li key={t.text} className="px-4 py-3">
                <p className="text-body font-semibold leading-snug">{t.text}</p>
                {t.detail && <p className="mt-1 text-subhead text-twig">{t.detail}</p>}
                <div className="mt-1 flex flex-wrap items-center gap-x-4">
                  <SourceLink url={t.source} />
                  {t.to && (
                    <Link
                      to={t.to.path}
                      className="inline-flex min-h-6 items-center gap-0.5 text-footnote font-semibold text-robin"
                    >
                      {t.to.label}
                      <Chevron />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <MedicalNote />
    </>
  );
}
