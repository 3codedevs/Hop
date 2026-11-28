import type { Corridor, LngLat, NetworkResponse, TrafficLevel } from '../shared/types.js';
import { LANDMARKS } from './data/landmarks.js';
import { LINES, PLACE_BY_ID } from './data/network.js';
import { road } from './roads.js';
import { simulatedTraffic, trafficLevel } from './traffic.js';

/** Roads Lagosians check before leaving, as stretches between two demo places. */
const CORRIDORS = [
  { id: 'third-mainland', name: 'Third Mainland Bridge', from: 'gbagada', to: 'obalende' },
  { id: 'ikorodu-road', name: 'Ikorodu Road', from: 'mile12', to: 'yaba' },
  { id: 'lekki-epe', name: 'Lekki–Epe Expressway', from: 'ajah', to: 'lekki-phase-1' },
  { id: 'eko-bridge', name: 'Eko Bridge', from: 'costain', to: 'cms' },
  { id: 'apapa-oshodi', name: 'Apapa–Oshodi Expressway', from: 'apapa', to: 'oshodi' },
  { id: 'abeokuta-exp', name: 'Lagos–Abeokuta Expressway', from: 'abule-egba', to: 'oshodi' },
];

const RANK: Record<TrafficLevel, number> = { clear: 0, moderate: 1, heavy: 2, gridlock: 3 };

function segmentPath(aId: string, bId: string, rail: boolean): LngLat[] {
  const a = PLACE_BY_ID.get(aId)!;
  const b = PLACE_BY_ID.get(bId)!;
  return (!rail && road(aId, bId)?.path) || [a.lngLat, b.lngLat];
}

/** The whole demo network, with traffic on each road segment for the given minute of the day. */
export function network(minuteOfDay: number, at: string): NetworkResponse {
  const t = simulatedTraffic(minuteOfDay);

  const lines = LINES.map((line) => {
    const rail = line.mode === 'rail';
    const path: LngLat[] = [];
    for (let i = 1; i < line.stops.length; i++) {
      const seg = segmentPath(line.stops[i - 1], line.stops[i], rail);
      path.push(...(path.length ? seg.slice(1) : seg));
    }
    return { id: line.id, mode: line.mode, name: line.name, color: line.color, path };
  });

  const stationModes = new Map<string, Set<'brt' | 'rail'>>();
  for (const line of LINES) {
    if (line.mode === 'danfo') continue;
    for (const id of line.stops) {
      const set = stationModes.get(id) ?? new Set();
      set.add(line.mode);
      stationModes.set(id, set);
    }
  }
  const stations = [...stationModes].map(([id, modes]) => {
    const p = PLACE_BY_ID.get(id)!;
    return { id, name: p.name, lngLat: p.lngLat, modes: [...modes] };
  });

  // Each road segment once, coloured by the worse of its two directions
  const seen = new Set<string>();
  const traffic: NetworkResponse['traffic'] = [];
  for (const line of LINES) {
    if (line.mode === 'rail') continue;
    for (let i = 1; i < line.stops.length; i++) {
      const [x, y] = [line.stops[i - 1], line.stops[i]].sort();
      if (seen.has(`${x}|${y}`)) continue;
      seen.add(`${x}|${y}`);
      const a = PLACE_BY_ID.get(x)!;
      const b = PLACE_BY_ID.get(y)!;
      const ab = trafficLevel(t.factor(a, b)).level;
      const ba = trafficLevel(t.factor(b, a)).level;
      traffic.push({ path: segmentPath(x, y, false), level: RANK[ab] >= RANK[ba] ? ab : ba });
    }
  }

  const corridors: Corridor[] = CORRIDORS.map((c) => {
    const a = PLACE_BY_ID.get(c.from)!;
    const b = PLACE_BY_ID.get(c.to)!;
    const km = road(a.id, b.id)?.km ?? 10;
    const way = (x: typeof a, y: typeof a) => {
      const f = t.factor(x, y);
      return { toward: y.name, toId: y.id, fromId: x.id, level: trafficLevel(f).level, minutes: Math.round((km / 34) * 60 * f) };
    };
    return { id: c.id, name: c.name, from: a.name, to: b.name, path: segmentPath(a.id, b.id, false), ways: [way(a, b), way(b, a)] };
  });

  return { at, lines, stations, landmarks: LANDMARKS, traffic, corridors };
}
