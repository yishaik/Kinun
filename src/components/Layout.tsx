/** App shell: top bar, status banners, page content and the bottom navigation. */
import { BookOpen, House, ListChecks, Package, Timer, WifiOff } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useSession } from '../data/session';
import { useOnline } from '../lib/hooks';
import { Avatar } from './ui';

const NAV = [
  { to: '/', label: 'בית', icon: House },
  { to: '/tasks', label: 'משימות', icon: ListChecks },
  { to: '/gear', label: 'ציוד', icon: Package },
  { to: '/labor', label: 'לידה', icon: Timer },
  { to: '/links', label: 'קישורים', icon: BookOpen },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { store, user, household } = useSession();
  const online = useOnline();
  const location = useLocation();
  const night = location.pathname === '/labor';

  // Each screen starts at the top (the router would otherwise keep the previous scroll position).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`min-h-dvh ${night ? 'bg-night text-night-text' : ''}`}>
      <header className="pt-safe sticky top-0 z-20 backdrop-blur-sm">
        <div className={`mx-auto flex max-w-xl items-center gap-3 px-4 py-3 ${night ? 'bg-night/90' : 'bg-shell/90'}`}>
          <NavLink to="/" className="font-display text-2xl leading-none" aria-label="קינון — מסך הבית">
            קינון
          </NavLink>
          {household && (
            <span className={`truncate text-sm ${night ? 'text-night-text/70' : 'text-twig-soft'}`}>
              {household.name}
            </span>
          )}
          <NavLink to="/settings" className="ms-auto rounded-full" aria-label="הגדרות ומשק הבית">
            <Avatar name={user?.name ?? '?'} photoURL={user?.photoURL} size={36} />
          </NavLink>
        </div>
        {store.mode === 'demo' && (
          <p className="bg-straw-soft px-4 py-1.5 text-center text-sm text-twig">
            מצב הדגמה: הנתונים נשמרים רק במכשיר הזה. לסנכרון בין שניכם — מחברים Firebase (ראו README).
          </p>
        )}
        {!online && (
          <p className="flex items-center justify-center gap-2 bg-twig px-4 py-1.5 text-center text-sm text-shell">
            <WifiOff className="size-4" aria-hidden /> אין חיבור. אפשר להמשיך — השינויים יסונכרנו כשהחיבור יחזור.
          </p>
        )}
      </header>

      <main className="mx-auto max-w-xl px-4 pt-2 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">{children}</main>

      <nav
        aria-label="ניווט ראשי"
        className={`pb-safe fixed inset-x-0 bottom-0 z-30 border-t ${night ? 'border-night-2 bg-night' : 'border-line bg-paper'}`}
      >
        <ul className="mx-auto flex max-w-xl">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[13px] font-semibold ${
                    isActive ? (night ? 'text-straw' : 'text-robin') : night ? 'text-night-text/60' : 'text-twig-soft'
                  }`
                }
              >
                <Icon className="size-6" aria-hidden strokeWidth={1.8} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
