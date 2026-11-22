/** The painted baby-giraffe mark. Cream square, rounded to match the PWA icon. */
import mark from '../assets/giraffe-mark.png';

export function AppMark({ size = 88 }: { size?: number }) {
  const shadow =
    size >= 64 ? 'shadow-[0_10px_28px_-12px_rgb(60_42_34_/_0.4)]' : 'shadow-[0_1px_2px_rgb(60_42_34_/_0.16)]';
  return (
    <img
      src={mark}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-[22%] object-cover ${shadow}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-display font-normal ${className}`.trim()}>קינון</span>;
}
