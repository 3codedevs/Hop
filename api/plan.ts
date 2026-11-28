import type { Prefer } from '../shared/types.js';
import { PLACE_BY_ID } from '../server/data/network.js';
import { badRequest, json, lagosMinuteNow, parseClock } from '../server/http.js';
import { plan } from '../server/planner.js';

const PREFS: Prefer[] = ['best', 'cheapest', 'fastest'];

export function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const from = q.get('from') ?? '';
  const to = q.get('to') ?? '';
  if (!PLACE_BY_ID.has(from) || !PLACE_BY_ID.has(to)) return badRequest('Choose a start and a destination from the list.');
  if (from === to) return badRequest('Your start and destination are the same place.');

  const t = q.get('t');
  const minuteOfDay = t ? parseClock(t) : lagosMinuteNow();
  if (minuteOfDay === null) return badRequest('Leave time must look like 08:30.');

  const p = q.get('prefer') as Prefer | null;
  const prefer = p && PREFS.includes(p) ? p : 'best';

  return json(plan({ from, to, minuteOfDay, prefer }), 200, { 'cache-control': 'public, s-maxage=60' });
}
