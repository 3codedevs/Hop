import { useSyncExternalStore } from 'react';

/** Tiny localStorage-backed store so demo choices survive a reload. */
function createStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let value: T = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    /* private mode or bad JSON: keep the fallback */
  }
  return {
    get: () => value,
    set(next: T) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export type Role = 'commuter' | 'admin';
export const roleStore = createStore<Role>('hop.role', 'commuter');
export const useRole = () => useSyncExternalStore(roleStore.subscribe, roleStore.get);

export interface RecentTrip {
  from: string;
  to: string;
  t: string;
}
export const recentStore = createStore<RecentTrip[]>('hop.recent', []);
export const useRecent = () => useSyncExternalStore(recentStore.subscribe, recentStore.get);

export function rememberTrip(trip: RecentTrip) {
  const rest = recentStore.get().filter((r) => !(r.from === trip.from && r.to === trip.to));
  recentStore.set([trip, ...rest].slice(0, 6));
}

export type ThemePref = 'system' | 'light' | 'dark';
export const themeStore = createStore<ThemePref>('hop.theme', 'system');
export const useThemePref = () => useSyncExternalStore(themeStore.subscribe, themeStore.get);

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
const subscribeSystem = (l: () => void) => {
  const q = darkQuery();
  q.addEventListener('change', l);
  return () => q.removeEventListener('change', l);
};
/** The theme actually showing: the user's choice, or the phone's setting. */
export function useDark() {
  const pref = useThemePref();
  const systemDark = useSyncExternalStore(subscribeSystem, () => darkQuery().matches);
  return pref === 'dark' || (pref === 'system' && systemDark);
}

const desktopQuery = () => window.matchMedia('(min-width: 1024px)');
const subscribeDesktop = (l: () => void) => {
  const q = desktopQuery();
  q.addEventListener('change', l);
  return () => q.removeEventListener('change', l);
};
export const useDesktop = () => useSyncExternalStore(subscribeDesktop, () => desktopQuery().matches);

const toastListeners = new Set<(msg: string) => void>();
export const onToast = (l: (msg: string) => void) => {
  toastListeners.add(l);
  return () => {
    toastListeners.delete(l);
  };
};
export const toast = (msg: string) => toastListeners.forEach((l) => l(msg));
export const soon = (feature: string) => toast(`${feature} is coming soon.`);
