import type { LngLat } from '../shared/types.js';
import { ROADS } from './data/roads.js';

function decode(str: string): LngLat[] {
  const out: LngLat[] = [];
  let i = 0, lat = 0, lng = 0;
  const next = () => {
    let shift = 0, result = 0, b: number;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (i < str.length) {
    lat += next();
    lng += next();
    out.push([lng / 1e5, lat / 1e5]);
  }
  return out;
}

export interface Road {
  km: number;
  path: LngLat[];
}

const cache = new Map<string, Road | null>();

/** Real road distance and shape from a to b, fetched once from OSRM at build time. */
export function road(aId: string, bId: string): Road | null {
  const key = `${aId}|${bId}`;
  if (cache.has(key)) return cache.get(key)!;
  let result: Road | null = null;
  const fwd = ROADS[key];
  const rev = ROADS[`${bId}|${aId}`];
  if (fwd) result = { km: fwd[0], path: decode(fwd[2]) };
  else if (rev) result = { km: rev[0], path: decode(rev[2]).reverse() };
  cache.set(key, result);
  return result;
}
