import { useSyncExternalStore } from 'react';

const EVENT = 'hop:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const current = () => window.location.pathname + window.location.search;

/** The current path and query string, e.g. "/app/plan?from=yaba". */
export function useLocationKey() {
  return useSyncExternalStore(subscribe, current);
}

export function navigate(to: string, { replace = false } = {}) {
  if (to === current()) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to);
  window.dispatchEvent(new Event(EVENT));
  if (!replace) window.scrollTo(0, 0);
}

export const isAppPath = (path: string) => path === '/app' || path.startsWith('/app/') || path.startsWith('/app?');
