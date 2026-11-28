import { badRequest, json, lagosMinuteNow, parseClock } from '../server/http.js';
import { network } from '../server/network.js';
import { clock } from '../server/planner.js';

export function GET(request: Request) {
  const t = new URL(request.url).searchParams.get('t');
  const minuteOfDay = t ? parseClock(t) : lagosMinuteNow();
  if (minuteOfDay === null) return badRequest('Time must look like 08:30.');
  return json(network(minuteOfDay, clock(minuteOfDay)), 200, { 'cache-control': 'public, s-maxage=300' });
}
