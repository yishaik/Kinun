import type { ItemKind } from '../lib/types';
import stork from '../assets/jungle/animals/stork.webp';
import owl from '../assets/jungle/animals/owl.webp';
import tortoise from '../assets/jungle/animals/tortoise.webp';
import monkey from '../assets/jungle/animals/monkey.webp';
import toucan from '../assets/jungle/animals/toucan.webp';
import squirrel from '../assets/jungle/animals/squirrel.webp';
import nestBird from '../assets/jungle/animals/nest-bird.webp';
import elephant from '../assets/jungle/animals/elephant.webp';
import lion from '../assets/jungle/animals/lion.webp';
import deer from '../assets/jungle/animals/deer.webp';
import monkeys from '../assets/jungle/animals/monkeys.webp';

const ANIMALS = {
  stork,
  owl,
  tortoise,
  monkey,
  toucan,
  squirrel,
  'nest-bird': nestBird,
  elephant,
  lion,
  deer,
  monkeys,
} as const;

type Animal = keyof typeof ANIMALS;

const TASK: Record<string, Animal> = {
  hospital: 'stork',
  health: 'owl',
  rights: 'tortoise',
  work: 'monkey',
  paperwork: 'toucan',
  finance: 'squirrel',
  home: 'nest-bird',
  logistics: 'elephant',
  baby: 'lion',
  mom: 'deer',
  family: 'monkeys',
};

const GEAR: Record<string, Animal> = {
  sleep: 'owl',
  travel: 'elephant',
  feeding: 'squirrel',
  diapering: 'nest-bird',
  bath: 'tortoise',
  clothing: 'toucan',
  health: 'stork',
  home: 'monkey',
  mom: 'deer',
};

const BAG: Record<string, Animal> = {
  docs: 'toucan',
  mom: 'deer',
  baby: 'lion',
  partner: 'monkeys',
};

const LINK: Record<string, Animal> = {
  emergency: 'stork',
  hospital: 'stork',
  rights: 'tortoise',
  registration: 'toucan',
  health: 'owl',
  safety: 'elephant',
  support: 'monkeys',
};

const BY_KIND: Record<ItemKind, Record<string, Animal>> = {
  task: TASK,
  gear: GEAR,
  bag: BAG,
  link: LINK,
};

/** Decorative animal portrait for a known category. Hidden from AT (the title already names it). */
export function CategoryMark({
  kind,
  category,
  className = 'size-8 shrink-0 rounded-full object-cover',
}: {
  kind: ItemKind;
  category: string;
  className?: string;
}) {
  const key = BY_KIND[kind][category];
  if (!key) return null;
  return <img src={ANIMALS[key]} alt="" aria-hidden className={className} width={64} height={64} />;
}
