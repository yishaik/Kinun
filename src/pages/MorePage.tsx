/** "עוד" — hub for the reference screens and tools that don't need a bottom-tab of their own. */
import { BookOpen, BookA, CalendarHeart, ClipboardPen, Footprints, Hand, TriangleAlert } from 'lucide-react';
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
    title: 'כלים',
    entries: [
      {
        to: '/kicks',
        icon: Hand,
        tone: 'robin',
        title: 'מונה תנועות',
        subtitle: 'סופרים יחד עד 10, עם היסטוריה',
      },
      {
        to: '/birth-plan',
        icon: ClipboardPen,
        tone: 'lagoon',
        title: 'תוכנית לידה',
        subtitle: 'ממלאים יחד ומדפיסים',
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
export const HUB_PATHS = ['/more', ...HUB_SECTIONS.flatMap((s) => s.entries.map((e) => e.to)), '/birth-plan/print'];

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
