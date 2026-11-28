import type { Prefer } from '../../shared/types';

type Params = Partial<{ from: string; to: string; t: string; prefer: Prefer; opt: string }>;

const qs = (p: Params) => {
  const s = new URLSearchParams(Object.entries(p).filter((e): e is [string, string] => !!e[1])).toString();
  return s ? `?${s}` : '';
};

export const planPath = (p: Params) => `/app/plan${qs(p)}`;
export const homePath = (p: Params = {}) => `/app${qs(p)}`;

export const DEMO_TRIP = { from: 'yaba', to: 'lekki-phase-1', t: '08:00' } as const;

export const POPULAR_TRIPS = [
  { from: 'ikorodu', to: 'obalende', t: '07:30' },
  { from: 'ikeja', to: 'vi', t: '08:00' },
  { from: 'festac', to: 'vi', t: '17:30' },
  { from: 'agbado', to: 'yaba', t: '08:00' },
] as const;

export const PREFS: { id: Prefer; label: string }[] = [
  { id: 'best', label: 'Best overall' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'fastest', label: 'Fastest' },
];
export const isPrefer = (v: string | null): v is Prefer => PREFS.some((p) => p.id === v);
