export type TravelMode = 'brt' | 'rail' | 'danfo' | 'keke' | 'ride' | 'rental' | 'walk';
export type LngLat = [number, number];
export type Side = 'mainland' | 'island';
export type Prefer = 'best' | 'cheapest' | 'fastest';
export type TrafficLevel = 'clear' | 'moderate' | 'heavy' | 'gridlock';

export interface Place {
  id: string;
  name: string;
  area: string;
  lngLat: LngLat;
  side: Side;
}

export interface Money {
  min: number;
  max: number;
  /** True when the price is a range we estimate, not a fixed fare. */
  estimate: boolean;
}

export interface Leg {
  mode: TravelMode;
  /** Line colour for BRT and rail legs (each line has its own). */
  color?: string;
  from: string;
  to: string;
  minutes: number;
  cost: Money | null;
  instruction: string;
  detail?: string;
  path: LngLat[];
}

export interface TripOption {
  id: string;
  mode: TravelMode;
  title: string;
  minutes: number;
  cost: Money;
  legs: Leg[];
  arriveAt: string;
  tags: ('best' | 'cheapest' | 'fastest')[];
  note: string;
}

export interface Car {
  id: string;
  name: string;
  year: number;
  image?: string;
  /** Required for Creative Commons photos. */
  photoCredit?: string;
  kind: 'Sedan' | 'Hatchback' | 'SUV' | 'Bus';
  source: 'Owner-listed' | 'Partner fleet';
  owner: string;
  rating: number;
  trips: number;
  placeId: string;
  pricePerDay: number;
  /** Extra per day for a chauffeur. */
  driverPerDay: number;
  deposit: number;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  litresPer100km: number;
  features: string[];
  /** Only offered with a driver. */
  driverOnly?: boolean;
}

export interface CarsResponse {
  petrolPerLitre: number;
  cars: (Car & { area: string })[];
}

export interface Landmark {
  name: string;
  lngLat: LngLat;
  kind: 'bridge' | 'market' | 'landmark';
}

export interface NetworkResponse {
  at: string;
  lines: { id: string; mode: 'brt' | 'rail' | 'danfo'; name: string; color: string; path: LngLat[] }[];
  stations: { id: string; name: string; lngLat: LngLat; modes: ('brt' | 'rail')[] }[];
  landmarks: Landmark[];
  traffic: { path: LngLat[]; level: TrafficLevel }[];
  corridors: Corridor[];
}

export interface Corridor {
  id: string;
  name: string;
  from: string;
  to: string;
  path: LngLat[];
  /** Travel each way at this time: towards `to`, then back towards `from`. */
  ways: { toward: string; toId: string; fromId: string; level: TrafficLevel; minutes: number }[];
}

export interface PlanResponse {
  from: Place;
  to: Place;
  departAt: string;
  prefer: Prefer;
  distanceKm: number;
  traffic: { level: TrafficLevel; label: string; source: 'simulated' | 'google' };
  headline: string;
  reason: string;
  options: TripOption[];
}
