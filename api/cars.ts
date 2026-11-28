import type { CarsResponse } from '../shared/types.js';
import { FLEET } from '../server/data/fleet.js';
import { PLACE_BY_ID, PRICES } from '../server/data/network.js';
import { json } from '../server/http.js';

export function GET() {
  const body: CarsResponse = {
    petrolPerLitre: PRICES.petrolPerLitre,
    cars: FLEET.map((c) => ({ ...c, area: PLACE_BY_ID.get(c.placeId)?.name ?? '' })),
  };
  return json(body, 200, { 'cache-control': 'public, s-maxage=300' });
}
