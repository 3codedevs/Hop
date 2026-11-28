import { PLACES } from '../server/data/network.js';
import { json } from '../server/http.js';

export function GET() {
  return json(PLACES, 200, { 'cache-control': 'public, s-maxage=3600' });
}
