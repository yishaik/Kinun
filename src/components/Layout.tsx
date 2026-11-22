/**
 * App shell, iOS style: a translucent nav bar that shows a compact title once the page's large
 * title (`<PageTitle>` → `[data-large-title]`) scrolls under it, status banners, the page content,
 * and a frosted bottom tab bar.
 */
import { ChevronRight, House, LayoutGrid, ListChecks, Package, Timer, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useSession } from '../data/session';
import { useOnline } from '../lib/hooks';
import { HUB_PATHS } from '../pages/MorePage';
import { AppMark, Wordmark } from './AppMark';
import { Avatar } from './ui';

const NAV = [
  { to: '/', label: 'בית', icon: House },
  { to: '/tasks', label: 'משימות', icon: ListChecks },
  { to: '/gear', label: 'ציוד', icon: Package },
  { to: '/labor', label: 'לידה', icon: Timer },
  { to: '/more', label: 'עוד', icon: LayoutGrid },
] as const;

const NAV_BAR_HEIGHT = 44;

/** Tracks whether the page has scrolled and whether its large title is hidden under the nav bar. */
function useCollapsingTitle(pathname: string) {
  const [state, setState] = useState({ scrolled: false, compact: false, title: '' });
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = document.querySelector<HTMLElement>('[data-large-title]');
      const bar = document.querySelector<HTMLElement>('[data-nav-bar]');
      const barBottom = bar ? bar.getBoundingClientRect().bottom : NAV_BAR_HEIGHT;
      const scrolled = window.scrollY > 2;
      const compact = el ? el.getBoundingClientRect().bottom < barBottom + 4 : scrolled;
      const title = el?.textContent?.trim() ?? '';
      setState((s) =>
        s.scrolled === scrolled && s.compact === compact && s.title === title ? s : { scrolled, compact, title },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return state;
}

export function Layout({ children }: { children: ReactNode }) {
  const { store, user } = useSession();
  const online = useOnline();
  const location = useLocation();
  const navigate = useNavigate();
  const night = location.pathname === '/labor';
  const inSettings = location.pathname === '/settings';
  // Screens opened from the "עוד" hub get a back button and keep the "עוד" tab highlighted.
  const inHub = location.pathname !== '/more' && HUB_PATHS.includes(location.pathname);
  const showBack = inSettings || inHub;
  const { scrolled, compact, title } = useCollapsingTitle(location.pathname);
  const prevPath = useRef(location.pathname);

  // Each screen starts at the top (the router would otherwise keep the previous scroll position).
  useEffect(() => {
    if (prevPath.current !== location.pathname) window.scrollTo(0, 0);
    prevPath.current = location.pathname;
  }, [location.pathname]);

  // Labor mode is always dark — match the browser chrome / status bar.
  useEffect(() => {
    if (!night) return;
    const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')];
    const before = metas.map((m) => m.content);
    metas.forEach((m) => (m.content = '#000000'));
    return () => metas.forEach((m, i) => (m.content = before[i]));
  }, [night]);

  const barSolid = scrolled;

  return (
    <div className={`min-h-dvh ${night ? 'theme-dark bg-night text-night-text' : ''}`}>
      <header
        data-nav-bar
        className={`pt-safe sticky top-0 z-20 transition-[background-color,border-color] duration-200 ${
          barSolid
            ? `${night ? 'bg-night/75 backdrop-blur-xl backdrop-saturate-150' : 'material'} border-b-[0.5px] ${night ? 'border-night-3' : 'border-line'}`
            : `border-b-[0.5px] border-transparent ${night ? 'bg-night' : 'bg-shell'}`
        }`}
      >
        <div className="relative mx-auto flex h-11 max-w-xl items-center px-4">
          {showBack ? (
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(inHub ? '/more' : '/'))}
              className="press -ms-2 flex min-h-11 items-center gap-0.5 pe-2 text-body text-robin"
            >
              <ChevronRight className="size-6" strokeWidth={2.25} aria-hidden />
              חזרה
            </button>
          ) : (
            <NavLink to="/" className="press -ms-1 flex min-h-11 items-center gap-2 pe-2" aria-label="קינון, מסך הבית">
              <AppMark size={28} />
              <Wordmark
                className={`text-headline transition-opacity duration-200 ${compact ? 'opacity-0' : 'opacity-100'}`}
              />
            </NavLink>
          )}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-16 truncate text-center text-headline transition-opacity duration-200 ${
              compact ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {title}
          </span>
          {!inSettings && (
            <NavLink to="/settings" className="press ms-auto rounded-full" aria-label="הגדרות ומשק הבית">
              <Avatar name={user?.name ?? '?'} photoURL={user?.photoURL} size={32} />
            </NavLink>
          )}
        </div>
        {store.mode === 'demo' && (
          <p className="mx-auto max-w-xl px-4 pb-1.5 text-center text-caption text-twig-soft">
            מצב הדגמה · הנתונים נשמרים רק במכשיר הזה
          </p>
        )}
        {!online && (
          <p className="flex items-center justify-center gap-1.5 bg-twig px-4 py-1 text-center text-footnote text-shell">
            <WifiOff className="size-3.5" aria-hidden /> אין חיבור · השינויים יסונכרנו כשהחיבור יחזור
          </p>
        )}
      </header>

      <main className="px-safe mx-auto max-w-xl px-4 pt-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav
        aria-label="ניווט ראשי"
        className={`pb-safe fixed inset-x-0 bottom-0 z-30 border-t-[0.5px] ${
          night ? 'border-night-3 bg-night-2/80 backdrop-blur-xl backdrop-saturate-150' : 'material border-line'
        }`}
      >
        <ul className="mx-auto flex max-w-xl">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive: exact }) => {
                  const isActive = exact || (to === '/more' && HUB_PATHS.includes(location.pathname));
                  return `flex min-h-[50px] flex-col items-center justify-center gap-0.5 pt-1 text-caption2 font-medium transition-colors ${
                    isActive ? (night ? 'text-straw' : 'text-robin') : night ? 'text-night-soft' : 'text-twig-soft'
                  }`;
                }}
              >
                {({ isActive: exact }) => {
                  const isActive = exact || (to === '/more' && HUB_PATHS.includes(location.pathname));
                  return (
                    <>
                      <Icon className="size-[26px]" aria-hidden strokeWidth={isActive ? 2.1 : 1.6} />
                      {label}
                    </>
                  );
                }}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
