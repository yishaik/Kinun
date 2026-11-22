import { giraffeMood } from '../lib/giraffe';
import celebrate from '../assets/jungle/giraffe-celebrate.webp';
import sleepy from '../assets/jungle/giraffe-sleepy.webp';
import smile from '../assets/jungle/giraffe-smile.webp';

const SRC = { sleepy, smile, celebrate } as const;

const LABEL: Record<keyof typeof SRC, string> = {
  sleepy: 'הג׳ירפה ישנה — עוד בהתחלה',
  smile: 'הג׳ירפה מחייכת — מתקדמים יפה',
  celebrate: 'הג׳ירפה חוגגת — כמעט סיימנו',
};

/** Companion portrait that changes expression from combined checklist progress. */
export function ReactiveGiraffe({
  ratio,
  className = 'size-[4.5rem] shrink-0',
}: {
  ratio: number;
  className?: string;
}) {
  const mood = giraffeMood(ratio);
  return (
    <figure className={className}>
      <img
        src={SRC[mood]}
        alt={LABEL[mood]}
        width={144}
        height={144}
        className="size-full rounded-[1.35rem] object-cover"
      />
    </figure>
  );
}
