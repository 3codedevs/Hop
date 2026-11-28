import type { Leg, LngLat, Money, Place, PlanResponse, Prefer, TravelMode, TripOption } from '../shared/types.js';
import { BRIDGES, LINES, PLACES, PLACE_BY_ID, PRICES, type Line } from './data/network.js';
import { road } from './roads.js';
import { simulatedTraffic, trafficLevel, type Traffic } from './traffic.js';

/** Value of a commuter's minute in naira, used to balance cost against time. */
const NAIRA_PER_MINUTE = 30;
const WALK_MAX_KM = 1.2;
const KEKE_MAX_KM = 4;

const round50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);
const round100 = (n: number) => Math.max(100, Math.round(n / 100) * 100);
export const naira = (n: number) => `₦${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
export const clock = (minuteOfDay: number) => {
  const m = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const mid = (m: Money) => (m.min + m.max) / 2;

export function km(a: LngLat, b: LngLat) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Real road distance where we have it; otherwise an estimate, longer across the lagoon. */
const roadKm = (a: Place, b: Place) => road(a.id, b.id)?.km ?? km(a.lngLat, b.lngLat) * (a.side !== b.side ? 1.5 : 1.3);
const railKm = (a: Place, b: Place) => km(a.lngLat, b.lngLat) * 1.1;

function roadPath(a: Place, b: Place): LngLat[] {
  const real = road(a.id, b.id);
  if (real) return real.path;
  if (a.side === b.side) return [a.lngLat, b.lngLat];
  const [main, island] = a.side === 'mainland' ? [a, b] : [b, a];
  const lat = main.lngLat[1];
  // Join the Third Mainland Bridge at the first ramp south of you; south of Yaba, take Eko Bridge
  const bridge = lat > 6.505 ? BRIDGES.thirdMainland.filter((pt) => pt[1] < lat) : BRIDGES.eko;
  const pts: LngLat[] = [main.lngLat, ...bridge];
  if (island.lngLat[0] > 3.44) pts.push(BRIDGES.falomo);
  pts.push(island.lngLat);
  return a.side === 'mainland' ? pts : pts.reverse();
}

// ---------------------------------------------------------------- transit search

interface Edge {
  from: string;
  to: string;
  via: string; // line id, 'walk' or 'keke'
  minutes: number;
  waitMinutes: number;
  money: number;
}

export const LINE_BY_ID = new Map(LINES.map((l) => [l.id, l]));
const rush = (t: Traffic) => Math.min(1, t.base);

function waitFor(line: Line, t: Traffic) {
  if (line.mode === 'danfo') return 4 + 8 * rush(t);
  if (line.mode === 'brt') return 5 + 12 * rush(t); // queues at the terminals in rush hour
  return line.every[rush(t) > 0.5 ? 1 : 0] / 2;
}

function rideMinutes(line: Line, a: Place, b: Place, t: Traffic) {
  const d = line.mode === 'rail' ? railKm(a, b) : roadKm(a, b);
  if (line.mode === 'danfo') return (d / 24) * 60 * t.factor(a, b);
  if (line.mode === 'brt') return (d / 30) * 60 * (1 + 0.15 * t.base) + 0.5; // mostly a dedicated lane
  return (d / 45) * 60 + 1;
}

function boardFare(line: Line) {
  return line.mode === 'danfo' ? 150 : line.mode === 'brt' ? 300 : 500;
}

function perKm(line: Line) {
  return line.mode === 'danfo' ? 39 : 25;
}

/** Cheapest path by generalised cost (minutes plus fare in minutes), over lines the filter allows. */
function searchTransit(from: Place, to: Place, t: Traffic, allow: (l: Line) => boolean): Edge[] | null {
  const startKey = `${from.id}|start`;
  const dist = new Map<string, number>([[startKey, 0]]);
  const prev = new Map<string, { key: string; edge: Edge }>();
  const done = new Set<string>();

  for (;;) {
    let key: string | null = null;
    let best = Infinity;
    for (const [k, v] of dist) if (!done.has(k) && v < best) { best = v; key = k; }
    if (!key) return null;
    done.add(key);
    const [placeId, cur] = key.split('|');
    if (placeId === to.id) {
      const edges: Edge[] = [];
      for (let k = key; prev.has(k); k = prev.get(k)!.key) edges.unshift(prev.get(k)!.edge);
      return edges;
    }
    const here = PLACE_BY_ID.get(placeId)!;

    const relax = (edge: Edge, boards: boolean) => {
      const k = `${edge.to}|${edge.via}`;
      const cost = best + edge.minutes + edge.money / NAIRA_PER_MINUTE + (boards ? 3 : 0);
      if (cost < (dist.get(k) ?? Infinity)) {
        dist.set(k, cost);
        prev.set(k, { key: key!, edge });
      }
    };

    for (const line of LINES) {
      if (!allow(line)) continue;
      const i = line.stops.indexOf(placeId);
      if (i < 0) continue;
      for (const j of [i - 1, i + 1]) {
        const nextId = line.stops[j];
        if (!nextId) continue;
        const next = PLACE_BY_ID.get(nextId)!;
        const boards = cur !== line.id;
        const wait = boards ? waitFor(line, t) : 0;
        relax(
          {
            from: placeId,
            to: nextId,
            via: line.id,
            minutes: rideMinutes(line, here, next, t) + wait,
            waitMinutes: wait,
            money: (boards ? boardFare(line) : 0) + perKm(line) * (line.mode === 'rail' ? railKm(here, next) : roadKm(here, next)),
          },
          boards,
        );
      }
    }

    for (const other of PLACES) {
      if (other.id === placeId) continue;
      const d = km(here.lngLat, other.lngLat);
      if (d <= WALK_MAX_KM && cur !== 'walk') {
        relax({ from: placeId, to: other.id, via: 'walk', minutes: ((d * 1.25) / 4.8) * 60, waitMinutes: 0, money: 0 }, false);
      }
      const kekeOk = (cur === 'start' || other.id === to.id) && cur !== 'keke' && here.side === other.side && d > WALK_MAX_KM && d <= KEKE_MAX_KM;
      if (kekeOk) {
        const wait = 3;
        relax(
          { from: placeId, to: other.id, via: 'keke', minutes: ((d * 1.3) / 18) * 60 * (1 + 0.3 * t.base) + wait, waitMinutes: wait, money: 150 + 100 * d },
          true,
        );
      }
    }
  }
}

function legFare(mode: TravelMode, roadDistance: number, t: Traffic): Money | null {
  if (mode === 'walk') return null;
  if (mode === 'danfo') {
    const min = Math.max(200, round50(roadDistance * 28));
    const max = Math.max(min + 100, round50(roadDistance * 50 * (1 + 0.25 * rush(t))) + 100);
    return { min, max, estimate: true };
  }
  if (mode === 'keke') {
    const min = Math.max(200, round50(150 + roadDistance * 80));
    return { min, max: min + 200, estimate: true };
  }
  const fare = round50((mode === 'brt' ? 300 : 500) + 25 * roadDistance);
  return { min: fare, max: fare, estimate: true };
}

/** Collapse consecutive edges on the same line into one leg with instructions. */
function edgesToLegs(edges: Edge[], t: Traffic): Leg[] {
  const legs: Leg[] = [];
  let i = 0;
  while (i < edges.length) {
    const via = edges[i].via;
    let j = i;
    while (j + 1 < edges.length && edges[j + 1].via === via) j++;
    const run = edges.slice(i, j + 1);
    const from = PLACE_BY_ID.get(run[0].from)!;
    const to = PLACE_BY_ID.get(run[run.length - 1].to)!;
    const minutes = run.reduce((s, e) => s + e.minutes, 0);
    const wait = run[0].waitMinutes;
    let distance = 0;
    const path: LngLat[] = [];
    for (const e of run) {
      const a = PLACE_BY_ID.get(e.from)!;
      const b = PLACE_BY_ID.get(e.to)!;
      const rail = LINE_BY_ID.get(via)?.mode === 'rail';
      distance += via === 'walk' ? km(a.lngLat, b.lngLat) * 1.25 : rail ? railKm(a, b) : roadKm(a, b);
      const seg = rail ? [a.lngLat, b.lngLat] : roadPath(a, b);
      path.push(...(path.length ? seg.slice(1) : seg));
    }

    const line = LINE_BY_ID.get(via);
    const mode: TravelMode = line ? line.mode : (via as TravelMode);
    const stops = run.length;
    let instruction: string;
    let detail: string;
    if (line?.mode === 'brt') {
      instruction = `BRT to ${to.name}`;
      detail = `${line.name} · ${stops} stop${stops > 1 ? 's' : ''} · queue and wait about ${Math.round(wait)} min`;
    } else if (line?.mode === 'rail') {
      instruction = `${line.name} train to ${to.name}`;
      detail = `${stops} stop${stops > 1 ? 's' : ''} · trains about every ${line.every[0]} min`;
    } else if (line) {
      const forward = line.stops.indexOf(to.id) > line.stops.indexOf(from.id);
      const terminus = PLACE_BY_ID.get(forward ? line.stops[line.stops.length - 1] : line.stops[0])!;
      instruction = `Danfo to ${to.name}`;
      detail = `From ${from.name} bus stop, board a bus calling “${terminus.name}”`;
    } else if (via === 'keke') {
      instruction = `Keke to ${to.name}`;
      detail = 'Short hop · agree the fare before you get in';
    } else {
      instruction = `Walk to ${to.name}`;
      detail = `About ${distance.toFixed(1)} km`;
    }

    legs.push({ mode, color: line && line.mode !== 'danfo' ? line.color : undefined, from: from.name, to: to.name, minutes: Math.round(minutes), cost: legFare(mode, distance, t), instruction, detail, path });
    i = j + 1;
  }
  return legs;
}

// ---------------------------------------------------------------- options

const LABEL: Record<TravelMode, string> = {
  brt: 'BRT',
  rail: 'Train',
  danfo: 'Danfo',
  keke: 'Keke',
  ride: 'Ride-hail',
  rental: 'Self-drive',
  walk: 'Walk',
};

function sumMoney(legs: Leg[]): Money {
  let min = 0, max = 0, estimate = false;
  for (const l of legs) {
    if (!l.cost) continue;
    min += l.cost.min;
    max += l.cost.max;
    estimate ||= l.cost.estimate;
  }
  return { min, max, estimate };
}

function transitTitle(legs: Leg[]) {
  const names: string[] = [];
  for (const l of legs) {
    if (l.mode === 'walk') continue;
    const name = l.mode === 'rail' ? l.instruction.split(' train')[0] : LABEL[l.mode];
    if (names[names.length - 1] !== name) names.push(name);
  }
  return names.map((n, i) => (i === 0 ? n : n === 'BRT' || n.endsWith('Line') ? n : n.toLowerCase())).join(', then ');
}

function primaryMode(legs: Leg[]): TravelMode {
  for (const m of ['rail', 'brt', 'danfo', 'keke'] as const) if (legs.some((l) => l.mode === m)) return m;
  return 'walk';
}

function transitOptions(from: Place, to: Place, t: Traffic, depart: number): TripOption[] {
  const runs: ((l: Line) => boolean)[] = [
    (l) => l.mode !== 'rail',
    (l) => l.mode !== 'brt',
    (l) => l.mode === 'danfo',
    () => true,
  ];
  const byMode = new Map<TravelMode, TripOption>();
  const seen = new Set<string>();
  for (const allow of runs) {
    const edges = searchTransit(from, to, t, allow);
    if (!edges) continue;
    const legs = edgesToLegs(edges, t);
    const mode = primaryMode(legs);
    if (mode === 'walk') continue;
    const sig = legs.map((l) => `${l.mode}:${l.to}`).join('>');
    if (seen.has(sig)) continue;
    seen.add(sig);
    const minutes = legs.reduce((s, l) => s + l.minutes, 0);
    const option: TripOption = {
      id: mode,
      mode,
      title: transitTitle(legs),
      minutes,
      cost: sumMoney(legs),
      legs,
      arriveAt: clock(depart + minutes),
      tags: [],
      note: '',
    };
    const existing = byMode.get(mode);
    if (!existing || score(option) < score(existing)) byMode.set(mode, option);
  }
  // Drop routes that another route beats on both time and cost
  const all = [...byMode.values()];
  return all.filter((o) => !all.some((x) => x !== o && x.minutes <= o.minutes && mid(x.cost) <= mid(o.cost)));
}

function roadOptions(from: Place, to: Place, t: Traffic, depart: number): TripOption[] {
  const d = roadKm(from, to);
  const drive = (d / 34) * 60 * t.factor(from, to);
  const path = roadPath(from, to);
  const options: TripOption[] = [];

  const pickup = Math.round(4 + 5 * rush(t));
  const surge = 1 + 0.6 * rush(t);
  const fare = (600 + 140 * d + 18 * drive) * surge;
  const rideMin = Math.round(pickup + drive);
  const rideCost: Money = { min: round100(fare * 0.9), max: round100(fare * 1.15), estimate: true };
  options.push({
    id: 'ride',
    mode: 'ride',
    title: 'Ride-hail',
    minutes: rideMin,
    cost: rideCost,
    legs: [{ mode: 'ride', from: from.name, to: to.name, minutes: rideMin, cost: rideCost, instruction: `Ride-hail to ${to.name}`, detail: `Pickup in about ${pickup} min${surge > 1.25 ? ' · rush-hour pricing' : ''}`, path }],
    arriveAt: clock(depart + rideMin),
    tags: [],
    note: '',
  });

  const fuel = (d * PRICES.rentalLitresPer100km * PRICES.petrolPerLitre) / 100;
  const total = round100(PRICES.rentalFromPerDay + fuel);
  const driveMin = Math.round(drive + 3);
  const rentCost: Money = { min: total, max: total, estimate: true };
  options.push({
    id: 'rental',
    mode: 'rental',
    title: 'Self-drive',
    minutes: driveMin,
    cost: rentCost,
    legs: [{ mode: 'rental', from: from.name, to: to.name, minutes: driveMin, cost: rentCost, instruction: `Drive yourself to ${to.name}`, detail: `Car from ${naira(PRICES.rentalFromPerDay)} a day, plus about ${naira(fuel)} fuel`, path }],
    arriveAt: clock(depart + driveMin),
    tags: [],
    note: '',
  });

  const straight = km(from.lngLat, to.lngLat) * 1.25;
  if (straight <= 3) {
    const walkMin = Math.round((straight / 4.8) * 60);
    options.push({
      id: 'walk',
      mode: 'walk',
      title: 'Walk',
      minutes: walkMin,
      cost: { min: 0, max: 0, estimate: false },
      legs: [{ mode: 'walk', from: from.name, to: to.name, minutes: walkMin, cost: null, instruction: `Walk to ${to.name}`, detail: `About ${straight.toFixed(1)} km`, path: [from.lngLat, to.lngLat] }],
      arriveAt: clock(depart + walkMin),
      tags: [],
      note: '',
    });
  }
  return options;
}

const transitLegs = (o: TripOption) => o.legs.filter((l) => l.mode !== 'walk').length;
function score(o: TripOption) {
  return o.minutes + mid(o.cost) / NAIRA_PER_MINUTE + 4 * Math.max(0, transitLegs(o) - 1);
}

function noteFor(o: TripOption, t: Traffic): string {
  switch (o.mode) {
    case 'brt': return t.base > 0.6 ? 'Its own lane skips most of the traffic.' : 'Steady, cheap and air-conditioned.';
    case 'rail': return 'No traffic on the rails, but trains run less often.';
    case 'danfo': return 'Cheapest. Fares move, so confirm before you board.';
    case 'ride': return t.base > 0.8 ? 'Door to door, but stuck in the same traffic.' : 'Door to door and quick right now.';
    case 'rental': return 'Worth it for a day of stops, not one trip.';
    case 'walk': return 'No fare and no waiting.';
    default: return '';
  }
}

function explain(winner: TripOption, options: TripOption[], trafficLabel: string, at: string): string {
  const ride = options.find((o) => o.mode === 'ride');
  if (winner.mode === 'walk') return 'It’s close enough to walk, and walking beats waiting for a bus.';
  if (winner.mode === 'ride') {
    const alt = options.filter((o) => o.mode !== 'ride' && o.mode !== 'rental').sort((a, b) => score(a) - score(b))[0];
    if (!alt) return `${trafficLabel} at ${at}. A ride is the simplest way across.`;
    const saved = alt.minutes - winner.minutes;
    const extra = round100(mid(winner.cost) - mid(alt.cost));
    return saved > 0
      ? `${trafficLabel} at ${at}. A ride saves about ${saved} minutes over ${alt.title.toLowerCase()}, for about ${naira(extra)} more.`
      : `${trafficLabel} at ${at}. A ride is the simplest way across.`;
  }
  if (!ride) return `${trafficLabel} at ${at}.`;
  const sooner = ride.minutes - winner.minutes;
  const cheaper = round100(mid(ride.cost) - mid(winner.cost));
  const how = winner.mode === 'brt' ? 'The BRT lane skips most of it' : winner.mode === 'rail' ? 'The train runs clear of it' : 'Public transport is the better deal';
  if (sooner >= 3) return `${trafficLabel} at ${at}. ${how}, so you arrive about ${sooner} minutes sooner than a ride and save about ${naira(cheaper)}.`;
  if (sooner > -5) return `${trafficLabel} at ${at}. About as fast as a ride and roughly ${naira(cheaper)} cheaper.`;
  return `${trafficLabel} at ${at}. About ${naira(cheaper)} cheaper than a ride, for ${-sooner} more minutes on the road.`;
}

export interface PlanInput {
  from: string;
  to: string;
  minuteOfDay: number;
  prefer: Prefer;
}

export function plan({ from: fromId, to: toId, minuteOfDay, prefer }: PlanInput, traffic: Traffic = simulatedTraffic(minuteOfDay)): PlanResponse {
  const from = PLACE_BY_ID.get(fromId);
  const to = PLACE_BY_ID.get(toId);
  if (!from || !to) throw new Error('Unknown place');

  const options = [...transitOptions(from, to, traffic, minuteOfDay), ...roadOptions(from, to, traffic, minuteOfDay)];
  for (const o of options) o.note = noteFor(o, traffic);

  // Self-drive is shown for comparison but never wins a single trip: renting pays off over a day of stops.
  const trip = options.filter((o) => o.mode !== 'rental');
  const byCost = (a: TripOption, b: TripOption) => mid(a.cost) - mid(b.cost) || a.minutes - b.minutes;
  const byTime = (a: TripOption, b: TripOption) => a.minutes - b.minutes || mid(a.cost) - mid(b.cost);
  const byScore = (a: TripOption, b: TripOption) => score(a) - score(b);
  [...trip].sort(byCost)[0].tags.push('cheapest');
  [...trip].sort(byTime)[0].tags.push('fastest');
  [...trip].sort(byScore)[0].tags.push('best');

  const sorted = [
    ...trip.sort(prefer === 'cheapest' ? byCost : prefer === 'fastest' ? byTime : byScore),
    ...options.filter((o) => o.mode === 'rental'),
  ];

  const level = trafficLevel(traffic.factor(from, to));
  const at = clock(minuteOfDay);
  return {
    from,
    to,
    departAt: at,
    prefer,
    distanceKm: Math.round(roadKm(from, to) * 10) / 10,
    traffic: { ...level, source: 'simulated' },
    headline: sorted[0].title,
    reason: explain(sorted[0], sorted, level.label, at),
    options: sorted,
  };
}
