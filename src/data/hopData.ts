export type TravelMode = 'brt' | 'danfo' | 'ride' | 'rental' | 'walk';

export interface RouteAlternative {
  mode: TravelMode;
  label: string;
  costLabel: string;
  timeLabel: string;
  reliability: string;
}

export interface RouteScenario {
  id: string;
  chipLabel: string;
  query: string;
  origin: string;
  destination: string;
  departure: string;
  topPick: {
    mode: TravelMode;
    title: string;
    costLabel: string;
    timeLabel: string;
    savingsBadge: string;
    reason: string;
    legs: { label: string; mode: TravelMode; duration: string }[];
    pathD: string;
  };
  alternatives: RouteAlternative[];
}

export const ROUTE_SCENARIOS: RouteScenario[] = [
  {
    id: 'yaba-lekki',
    chipLabel: 'Yaba → Lekki (8am)',
    query: 'Yaba to Lekki by 8am, cheapest',
    origin: 'Yaba',
    destination: 'Lekki Phase 1',
    departure: '08:00 WAT',
    topPick: {
      mode: 'brt',
      title: 'BRT to CMS, then Lekki shuttle + 5 min walk',
      costLabel: 'About ₦900 – ₦1,300',
      timeLabel: '48 min',
      savingsBadge: 'Saves ₦3,200 & 18 min vs ride-hailing',
      reason:
        'Third Mainland southbound is heavy at 8am. Dedicated BRT lanes clear Fadeyi to CMS cleanly before crossing.',
      legs: [
        { label: 'Yaba BRT Stop', mode: 'walk', duration: '4m' },
        { label: 'BRT 102 → CMS', mode: 'brt', duration: '24m' },
        { label: 'Lekki Shuttle', mode: 'danfo', duration: '15m' },
        { label: 'Admiralty Way', mode: 'walk', duration: '5m' },
      ],
      pathD: 'M 24 58 C 90 18, 160 72, 230 34 C 280 12, 330 48, 376 26',
    },
    alternatives: [
      {
        mode: 'danfo',
        label: 'Danfo via Obalende',
        costLabel: 'About ₦700 – ₦1,100',
        timeLabel: '56 min',
        reliability: 'Moderate · cash only',
      },
      {
        mode: 'ride',
        label: 'Ride-hailing (est.)',
        costLabel: 'About ₦4,500',
        timeLabel: '66 min',
        reliability: 'Peak surge active',
      },
    ],
  },
  {
    id: 'four-stops',
    chipLabel: '4 stops across VI & Lekki',
    query: 'Ikeja → Yaba → VI → Lekki → Ikeja today',
    origin: 'Ikeja',
    destination: '4-stop day loop',
    departure: 'All day (09:00 – 19:00)',
    topPick: {
      mode: 'rental',
      title: 'Self-drive day rental (Toyota Corolla · Verified)',
      costLabel: '₦18,000 / day + fuel',
      timeLabel: 'Full day',
      savingsBadge: 'Saves ~₦6,000 vs 4 ride-hailing trips',
      reason:
        'Four separate ride-hailing legs today estimate at ₦24,000 with surge risk. Renting one car keeps your schedule under your control.',
      legs: [
        { label: 'Pickup Ikeja GRA', mode: 'rental', duration: '09:00' },
        { label: 'Yaba & VI', mode: 'rental', duration: '2 stops' },
        { label: 'Lekki Phase 1', mode: 'rental', duration: '15:30' },
        { label: 'Return Ikeja', mode: 'rental', duration: '19:00' },
      ],
      pathD: 'M 24 44 C 100 10, 170 76, 240 28 C 295 8, 335 64, 376 42',
    },
    alternatives: [
      {
        mode: 'ride',
        label: '4× Ride-hailing trips (est.)',
        costLabel: 'About ₦24,000',
        timeLabel: 'Surge risk',
        reliability: 'Wait time between stops',
      },
      {
        mode: 'brt',
        label: 'BRT + Danfo mix',
        costLabel: 'About ₦3,400 – ₦4,800',
        timeLabel: '3h 40m total',
        reliability: '4 transfers',
      },
    ],
  },
  {
    id: 'ikeja-marina',
    chipLabel: 'Ikeja → Marina (fastest)',
    query: 'Ikeja to Marina now, fastest',
    origin: 'Ikeja Along',
    destination: 'CMS / Marina',
    departure: 'Now (Live traffic)',
    topPick: {
      mode: 'brt',
      title: 'BRT Express from Ikeja Along to CMS',
      costLabel: 'About ₦650 – ₦850',
      timeLabel: '39 min',
      savingsBadge: 'Saves ₦4,100 & 22 min vs road traffic',
      reason:
        'Ikorodu Road has a stalled truck near Palmgrove. BRT corridor bypasses the bottleneck completely.',
      legs: [
        { label: 'Ikeja Along Terminal', mode: 'walk', duration: '3m' },
        { label: 'BRT Express → CMS', mode: 'brt', duration: '33m' },
        { label: 'Marina Walk', mode: 'walk', duration: '3m' },
      ],
      pathD: 'M 24 24 C 110 66, 200 18, 285 52 C 325 68, 355 34, 376 30',
    },
    alternatives: [
      {
        mode: 'ride',
        label: 'Ride-hailing (est.)',
        costLabel: 'About ₦4,900',
        timeLabel: '61 min',
        reliability: 'Palmgrove slowdown',
      },
      {
        mode: 'danfo',
        label: 'Danfo via Ojota',
        costLabel: 'About ₦500 – ₦800',
        timeLabel: '58 min',
        reliability: 'Moderate · 1 transfer',
      },
    ],
  },
];

export interface LagosHub {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'clear' | 'busy' | 'alert';
  report: string;
  corridor: string;
}

export const LAGOS_HUBS: LagosHub[] = [
  {
    id: 'ikeja',
    name: 'Ikeja',
    x: 34,
    y: 22,
    status: 'clear',
    report: 'BRT Express boarding · 4m wait',
    corridor: 'Ikorodu Rd North',
  },
  {
    id: 'oshodi',
    name: 'Oshodi',
    x: 28,
    y: 44,
    status: 'busy',
    report: 'Terminal 2 busy · Danfo ₦400–₦600',
    corridor: 'Apapa–Oshodi',
  },
  {
    id: 'yaba',
    name: 'Yaba',
    x: 47,
    y: 48,
    status: 'clear',
    report: '3rd Mainland clear · 14m to Island',
    corridor: 'Mainland Hub',
  },
  {
    id: 'cms',
    name: 'CMS / Marina',
    x: 52,
    y: 72,
    status: 'alert',
    report: 'Ghost bus flagged 6m ago · use BRT 102',
    corridor: 'Island Terminal',
  },
  {
    id: 'vi',
    name: 'Victoria Island',
    x: 68,
    y: 78,
    status: 'clear',
    report: 'Ozumba Mbadiwe moving smoothly',
    corridor: 'VI Loop',
  },
  {
    id: 'lekki',
    name: 'Lekki Phase 1',
    x: 84,
    y: 74,
    status: 'busy',
    report: 'Admiralty toll slow · +9 min',
    corridor: 'Lekki–Epe',
  },
];

export interface RentalCar {
  id: string;
  name: string;
  year: number;
  source: 'Owner-listed' | 'Partner fleet';
  ownerName: string;
  rating: string;
  trips: number;
  location: string;
  pricePerDay: number;
  deposit: number;
  transmission: string;
  seats: number;
  tag: string;
  image?: string;
}

export const RENTAL_FLEET: RentalCar[] = [
  {
    id: 'corolla-2019',
    name: 'Toyota Corolla LE',
    year: 2019,
    source: 'Owner-listed',
    ownerName: 'Tunde A.',
    rating: '4.9',
    trips: 42,
    location: 'Yaba · 6 min away',
    pricePerDay: 18000,
    deposit: 25000,
    transmission: 'Auto · AC',
    seats: 5,
    tag: 'Best for 4+ trip days',
    image: '/img/corolla-sedan.jpg',
  },
  {
    id: 'civic-2020',
    name: 'Honda Civic Touring',
    year: 2020,
    source: 'Partner fleet',
    ownerName: 'MetroDrive NG',
    rating: '4.8',
    trips: 118,
    location: 'Victoria Island',
    pricePerDay: 24000,
    deposit: 30000,
    transmission: 'Auto · CarPlay',
    seats: 5,
    tag: 'Instant confirm',
  },
  {
    id: 'corolla-hatch-2021',
    name: 'Toyota Corolla Hatch',
    year: 2021,
    source: 'Owner-listed',
    ownerName: 'Amaka O.',
    rating: '5.0',
    trips: 27,
    location: 'Ikeja GRA',
    pricePerDay: 16500,
    deposit: 20000,
    transmission: 'Auto · Eco',
    seats: 5,
    tag: 'Fuel saver',
    image: '/img/corolla-hatch.jpg',
  },
  {
    id: 'rx350-2018',
    name: 'Lexus RX 350',
    year: 2018,
    source: 'Partner fleet',
    ownerName: 'Island Fleet',
    rating: '4.9',
    trips: 64,
    location: 'Lekki Phase 1',
    pricePerDay: 42000,
    deposit: 50000,
    transmission: 'Auto · AWD',
    seats: 5,
    tag: 'Group & luggage',
  },
];

export const WHY_HOP = [
  {
    num: '01',
    label: 'Time of day',
    title: '7am advice is not 2pm advice.',
    body: 'Live Google Maps traffic, weighted by years of Lagos rush-hour patterns, so you are never routed into a jam everyone saw coming.',
  },
  {
    num: '02',
    label: 'Honest fares',
    title: 'Danfo prices shown as real ranges.',
    body: 'Unscheduled buses have no fixed ticket. Hop shows a range like ₦300 to ₦600 and marks every estimate as one.',
  },
  {
    num: '03',
    label: 'BRT terminals',
    title: 'The right terminal, and the right bay.',
    body: 'Find the closest BRT stop, see every route that passes through it, and walk straight to where you board.',
  },
  {
    num: '04',
    label: 'Live reports',
    title: 'One tap flags a ghost bus.',
    body: 'Commuters report delays, closures and buses that never came. Routes update for everyone on that corridor.',
  },
  {
    num: '05',
    label: 'Split costs',
    title: 'Share the car, split the fare.',
    body: 'Going to VI or Lekki with friends? Split a rental or a shared ride in the app, so nobody chases transfers later.',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'How is Hop different from Google Maps?',
    a: 'Maps gives you a route. Hop ranks walking, BRT, danfo, ride-hailing and self-drive rental against each other for the hour you travel, then tells you why one wins.',
  },
  {
    q: 'Why does Hop show a range for danfo fares?',
    a: 'Danfo fares move with fuel prices, time of day and demand. A range is honest. A single exact number would be made up.',
  },
  {
    q: 'How does self-drive verification work?',
    a: 'Renters upload a valid ID and driver’s licence before approval, pay a refundable deposit through Paystack, and both sides log pickup and return photos.',
  },
  {
    q: 'Can I list my own car?',
    a: 'Yes. Individual owners list next to verified partner fleets, so there are cars available from day one and owners earn from idle time.',
  },
];

/** One row per hour for the scroll-controlled rush-hour chapter (Yaba to Lekki Phase 1). */
export type DayPhase = 'early' | 'rush' | 'midday' | 'evening' | 'night';

export interface HourSnapshot {
  hour: number;
  phase: DayPhase;
  traffic: number; // 0–100 congestion on Third Mainland southbound
  best: string;
  mode: TravelMode;
  cost: string;
  time: string;
  rideHail: string;
  note: string;
}

export const DAY_PHASES: { id: DayPhase; label: string; from: number }[] = [
  { id: 'early', label: 'Early', from: 6 },
  { id: 'rush', label: 'Morning rush', from: 7 },
  { id: 'midday', label: 'Midday', from: 10 },
  { id: 'evening', label: 'Evening rush', from: 16 },
  { id: 'night', label: 'Night', from: 20 },
];

export const TIME_OF_DAY: HourSnapshot[] = [
  { hour: 6, phase: 'early', traffic: 22, best: 'Ride-hail straight across Third Mainland', mode: 'ride', cost: '₦3,100', time: '27 min', rideHail: '₦3,100 · 27 min', note: 'Roads are still open. The fastest door-to-door option is also fair on price.' },
  { hour: 7, phase: 'rush', traffic: 71, best: 'BRT 102 to CMS, then the Lekki shuttle', mode: 'brt', cost: '₦900 to ₦1,300', time: '46 min', rideHail: '₦4,200 · 58 min', note: 'Third Mainland is filling up. Dedicated BRT lanes clear Fadeyi to CMS.' },
  { hour: 8, phase: 'rush', traffic: 92, best: 'BRT 102 to CMS, then the Lekki shuttle', mode: 'brt', cost: '₦900 to ₦1,300', time: '48 min', rideHail: '₦4,500 · 66 min', note: 'Peak surge. The bus lane is the only part of the bridge that moves.' },
  { hour: 9, phase: 'rush', traffic: 78, best: 'BRT 102 to CMS, then the Lekki shuttle', mode: 'brt', cost: '₦900 to ₦1,300', time: '44 min', rideHail: '₦4,100 · 57 min', note: 'Still heavy past Adeniji. BRT keeps its lead for one more hour.' },
  { hour: 11, phase: 'midday', traffic: 41, best: 'Danfo via Obalende', mode: 'danfo', cost: '₦700 to ₦1,100', time: '50 min', rideHail: '₦3,300 · 34 min', note: 'Traffic eases. Danfo is the cheapest seat, ride-hail the quickest.' },
  { hour: 13, phase: 'midday', traffic: 38, best: 'Danfo via Obalende', mode: 'danfo', cost: '₦700 to ₦1,100', time: '48 min', rideHail: '₦3,200 · 32 min', note: 'Quietest window of the day to cross to the Island.' },
  { hour: 15, phase: 'midday', traffic: 52, best: 'Danfo via Obalende', mode: 'danfo', cost: '₦700 to ₦1,100', time: '52 min', rideHail: '₦3,500 · 39 min', note: 'School runs start. Lekki toll gate begins to slow.' },
  { hour: 17, phase: 'evening', traffic: 88, best: 'BRT to CMS, then walk to the jetty ferry', mode: 'brt', cost: '₦1,400 to ₦1,900', time: '55 min', rideHail: '₦5,200 · 78 min', note: 'Island to Mainland is jammed, and the Lekki side is close behind.' },
  { hour: 18, phase: 'evening', traffic: 95, best: 'BRT to CMS, then walk to the jetty ferry', mode: 'brt', cost: '₦1,400 to ₦1,900', time: '57 min', rideHail: '₦5,600 · 84 min', note: 'Worst hour of the day. Ride-hail costs four times more and is slower.' },
  { hour: 19, phase: 'evening', traffic: 74, best: 'BRT 102 to CMS, then the Lekki shuttle', mode: 'brt', cost: '₦900 to ₦1,300', time: '51 min', rideHail: '₦4,400 · 61 min', note: 'Easing slowly. BRT still wins on both cost and time.' },
  { hour: 21, phase: 'night', traffic: 30, best: 'Ride-hail straight across Third Mainland', mode: 'ride', cost: '₦3,300', time: '29 min', rideHail: '₦3,300 · 29 min', note: 'BRT frequency drops after 9pm. A direct ride is safer and quick.' },
  { hour: 22, phase: 'night', traffic: 18, best: 'Ride-hail straight across Third Mainland', mode: 'ride', cost: '₦3,400', time: '25 min', rideHail: '₦3,400 · 25 min', note: 'Clear roads. Late-night surge is mild.' },
];
