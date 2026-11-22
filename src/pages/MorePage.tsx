/** "עוד" — hub for the reference screens and tools that don't need a bottom-tab of their own. */
import { BookOpen, BookA, CalendarHeart, Footprints, TriangleAlert } from 'lucide-react';
import { NavRow, type IconTone } from '../components/info';
import { PageTitle, Section } from '../components/ui';
import type { LucideIcon } from 'lucide-react';

interface HubEntry {
  to: string;
  icon: LucideIcon;
  tone: IconTone;
  title: string;
  subtitle: string;
}

export const HUB_SECTIONS: { title: string; entries: HubEntry[] }[] = [
  {
    title: 'לפני הלידה',
    entries: [
      {
        to: '/week',
        icon: CalendarHeart,
        tone: 'leaf',
        title: 'השבוע שלכם',
        subtitle: 'מה קורה לתינוק, ליולדת, ומה לעשות',
      },
      {
        to: '/warnings',
        icon: TriangleAlert,
        tone: 'brick',
        title: 'סימני אזהרה',
        subtitle: 'מתי לחדר הלידה ומתי למד״א 101',
      },
    ],
  },
  {
    title: 'מידע',
    entries: [
      {
        to: '/stages',
        icon: Footprints,
        tone: 'leaf',
        title: 'שלבי הלידה',
        subtitle: 'מה קורה בכל שלב, ואיך מקלים על הכאב',
      },
      {
        to: '/glossary',
        icon: BookA,
        tone: 'straw',
        title: 'מילון מונחים',
        subtitle: 'פתיחה, מחיקה, אפידורל ועוד',
      },
      {
        to: '/links',
        icon: BookOpen,
        tone: 'lagoon',
        title: 'קישורים וטלפונים',
        subtitle: 'זכויות, בתי חולים, קווים חמים',
      },
    ],
  },
];

/** Routes that belong to the "עוד" tab (for the bottom-nav highlight). */
export const HUB_PATHS = ['/more', ...HUB_SECTIONS.flatMap((s) => s.entries.map((e) => e.to))];

export function MorePage() {
  return (
    <>
      <PageTitle>עוד</PageTitle>
      {HUB_SECTIONS.map((s) => (
        <Section key={s.title} title={s.title} collapsible={false} inset="3.75rem">
          {s.entries.map((e) => (
            <NavRow key={e.to} {...e} />
          ))}
        </Section>
      ))}
    </>
  );
}
