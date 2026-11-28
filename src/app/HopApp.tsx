import { useEffect } from 'react';
import { CarFront, CircleUser, Map as MapIcon, Moon, Route, Sun, Ticket, type LucideIcon } from 'lucide-react';
import { Link } from '../components/Link';
import { Logo } from '../components/Navbar';
import { useLocationKey } from '../lib/router';
import { AccountScreen } from './screens/AccountScreen';
import { CarScreen } from './screens/CarScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { PlanScreen } from './screens/PlanScreen';
import { RentScreen } from './screens/RentScreen';
import { TripsScreen } from './screens/TripsScreen';
import { themeStore, useDark, useRole } from './store';
import { Toaster } from './ui';

type Tab = 'plan' | 'map' | 'rent' | 'trips' | 'account';

const TABS: { id: Tab; label: string; path: string; icon: LucideIcon }[] = [
  { id: 'plan', label: 'Plan', path: '/app', icon: Route },
  { id: 'map', label: 'Live map', path: '/app/map', icon: MapIcon },
  { id: 'rent', label: 'Rent', path: '/app/rent', icon: CarFront },
  { id: 'trips', label: 'Trips', path: '/app/trips', icon: Ticket },
  { id: 'account', label: 'Account', path: '/app/account', icon: CircleUser },
];

const ROUTES: Record<string, { tab: Tab; title: string }> = {
  '/app': { tab: 'plan', title: 'Plan a trip' },
  '/app/plan': { tab: 'plan', title: 'Your options' },
  '/app/map': { tab: 'map', title: 'Live map' },
  '/app/rent': { tab: 'rent', title: 'Rent a car' },
  '/app/rent/car': { tab: 'rent', title: 'Car details' },
  '/app/trips': { tab: 'trips', title: 'Your trips' },
  '/app/account': { tab: 'account', title: 'Account' },
};


export default function HopApp() {
  const key = useLocationKey();
  const role = useRole();
  const dark = useDark();
  const url = new URL(key, window.location.origin);
  const path = url.pathname.replace(/\/$/, '') || '/app';
  const route = ROUTES[path] ?? ROUTES['/app'];
  const q = url.searchParams;

  useEffect(() => {
    document.title = `${route.title} · Hop`;
  }, [route.title]);

  // Page background and browser chrome follow the theme (the landing page stays light)
  useEffect(() => {
    const bg = dark ? '#121211' : '#F3F1EC';
    document.documentElement.style.background = bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    return () => {
      document.documentElement.style.background = '';
    };
  }, [dark]);

  let screen;
  switch (path) {
    case '/app/plan': screen = <PlanScreen params={q} />; break;
    case '/app/map': screen = <MapScreen />; break;
    case '/app/rent': screen = <RentScreen params={q} />; break;
    case '/app/rent/car': screen = <CarScreen id={q.get('id') ?? ''} params={q} />; break;
    case '/app/trips': screen = <TripsScreen />; break;
    case '/app/account': screen = <AccountScreen />; break;
    default: screen = <HomeScreen params={q} />;
  }

  return (
    <div className={`min-h-svh bg-paper text-ink ${dark ? 'hop-dark' : ''}`}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur sm:px-6">
        <Link to="/app" className="flex items-center gap-3" aria-label="Hop, plan a trip">
          <Logo />
          <span className="rounded-full border border-line px-2 py-0.5 text-[12px] text-muted">Demo</span>
        </Link>
        <nav className="hidden items-center gap-1 text-[14px] lg:flex" aria-label="App">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to={t.path}
              aria-current={route.tab === t.id ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 ${route.tab === t.id ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'}`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => themeStore.set(dark ? 'light' : 'dark')}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
          >
            {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <Link to="/app/account" className="inline-flex min-h-11 items-center gap-2 rounded-full pr-1 pl-2 text-[13px] text-muted hover:text-ink" aria-label={role === 'admin' ? 'Account, staff view on' : 'Account'}>
            <span className="hidden sm:inline">{role === 'admin' ? 'Staff view' : 'Ada'}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-signal text-[13px] font-semibold text-[#0E0F0C]">A</span>
          </Link>
        </div>
      </header>

      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">{screen}</div>

      {/* Phones: tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/96 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="App"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((t) => {
            const active = route.tab === t.id;
            return (
              <li key={t.id}>
                <Link
                  to={t.path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-[4.5rem] flex-col items-center justify-center gap-1 text-[11px] ${active ? 'font-semibold text-ink' : 'text-muted'}`}
                >
                  <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${active ? 'bg-ink text-paper' : ''}`}>
                    <t.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Toaster />
    </div>
  );
}
