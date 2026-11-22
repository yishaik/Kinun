import smile from '../assets/jungle/giraffe-smile.webp';

/** A small nodding giraffe, used as a loading companion. Still when reduced-motion is on. */
export function GiraffeNod({ size = 72, label = 'טוען' }: { size?: number; label?: string }) {
  return (
    <img
      src={smile}
      alt={label}
      aria-hidden={!label || undefined}
      width={size}
      height={size}
      className="giraffe-nod rounded-[1.35rem] object-cover"
      style={{ width: size, height: size }}
    />
  );
}
