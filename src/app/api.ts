import { useEffect, useState } from 'react';
import type { CarsResponse, Place, PlanResponse, Prefer } from '../../shared/types';

const cache = new Map<string, Promise<unknown>>();

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? 'Something went wrong. Please try again.');
  return body as T;
}

function cached<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = getJson<T>(url);
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

/** Fetches a URL once and keeps the answer for the session. Pass null to skip. */
export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{ url: string; data?: T; error?: string } | null>(null);
  useEffect(() => {
    if (!url) return;
    let live = true;
    cached<T>(url).then(
      (data) => live && setState({ url, data }),
      (e: Error) => live && setState({ url, error: e.message }),
    );
    return () => {
      live = false;
    };
  }, [url]);
  const current = state?.url === url ? state : null;
  return { data: current?.data, error: current?.error, loading: !!url && !current };
}

export const usePlaces = () => useApi<Place[]>('/api/places');
export const useCars = () => useApi<CarsResponse>('/api/cars');

export interface TripQuery {
  from: string;
  to: string;
  t: string;
  prefer: Prefer;
}

export const planUrl = (q: TripQuery) => `/api/plan?${new URLSearchParams({ ...q })}`;
export const usePlan = (q: TripQuery | null) => useApi<PlanResponse>(q ? planUrl(q) : null);
