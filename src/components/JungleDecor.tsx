/**
 * Soft mural-inspired marks for sign-in and other open screens.
 * Decorative only (aria-hidden); colors come from design tokens.
 */
export function JungleDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Sun, top-end (left in RTL), like the mural lamp. */}
      <svg viewBox="0 0 160 160" className="absolute -top-8 -end-8 size-40 text-sun opacity-80" fill="none">
        <circle cx="88" cy="72" r="36" fill="currentColor" />
        {([0, 45, 90, 135, 180, 225, 270, 315] as const).map((deg) => (
          <rect
            key={deg}
            x="85"
            y="10"
            width="6"
            height="18"
            rx="3"
            fill="currentColor"
            transform={`rotate(${deg} 88 72)`}
          />
        ))}
      </svg>
      {/* Monstera, bottom-start (right in RTL). */}
      <svg
        viewBox="0 0 140 140"
        className="absolute -bottom-10 -start-8 size-44 text-leaf opacity-25"
        fill="currentColor"
      >
        <path d="M86 128c-18-4-42-24-50-50-6-20 2-44 22-54 8 18 10 34 6 50 18-16 34-18 50-10-8 22-16 44-28 64z" />
        <path d="M54 86c-16 2-30-8-36-22 14-4 26-2 36 8-2-16 4-30 16-40 2 22 0 38-16 54z" />
        <path d="M70 36c8-16 24-24 40-20-6 16-18 24-34 26 16 2 28 12 32 26-18 2-30-6-38-32z" />
      </svg>
      {/* Smaller teal leaf, bottom-end. */}
      <svg viewBox="0 0 80 80" className="absolute -bottom-6 end-6 size-24 text-lagoon opacity-20" fill="currentColor">
        <path d="M12 68c8-28 28-48 56-56-4 32-20 52-48 60 8-16 8-32 4-48-8 12-14 28-12 44z" />
      </svg>
    </div>
  );
}
