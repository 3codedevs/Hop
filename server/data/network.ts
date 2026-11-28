import type { Place, Side, TravelMode } from '../../shared/types.js';

const p = (id: string, name: string, area: string, lng: number, lat: number, side: Side = 'mainland'): Place => ({
  id,
  name,
  area,
  lngLat: [lng, lat],
  side,
});

/** Demo coverage: the busiest commuter corridors, with approximate stop locations. */
export const PLACES: Place[] = [
  p('yaba', 'Yaba', 'Jibowu, Sabo', 3.3707, 6.515),
  p('unilag', 'UNILAG', 'Akoka', 3.397, 6.5158),
  p('surulere', 'Surulere', 'Ojuelegba', 3.364, 6.509),
  p('costain', 'Costain', 'Ebute Metta', 3.369, 6.489),
  p('ebute-metta', 'Oyingbo', 'Ebute Metta', 3.384, 6.487),
  p('fadeyi', 'Fadeyi', 'Ikorodu Road', 3.372, 6.533),
  p('maryland', 'Maryland', 'Ikorodu Road', 3.367, 6.5713),
  p('ojota', 'Ojota', 'Ikorodu Road', 3.3792, 6.5852),
  p('ketu', 'Ketu', 'Ikorodu Road', 3.389, 6.5975),
  p('mile12', 'Mile 12', 'Ikorodu Road', 3.3975, 6.608),
  p('ikorodu', 'Ikorodu', 'Ikorodu Garage', 3.5105, 6.6194),
  p('berger', 'Berger', 'Ojodu', 3.3707, 6.6407),
  p('ikeja', 'Ikeja', 'Allen, Obafemi Awolowo Way', 3.3515, 6.6018),
  p('ikeja-along', 'Ikeja Along', 'Abeokuta Expressway', 3.3235, 6.614),
  p('abule-egba', 'Abule Egba', 'Abeokuta Expressway', 3.3041, 6.6431),
  p('iyana-ipaja', 'Iyana Ipaja', 'Alimosho', 3.293, 6.611),
  p('agege', 'Agege', 'Pen Cinema', 3.32, 6.625),
  p('agbado', 'Agbado', 'Ifako-Ijaiye', 3.2858, 6.6835),
  p('airport', 'Lagos Airport', 'Murtala Muhammed, Ikeja', 3.3212, 6.5774),
  p('oshodi', 'Oshodi', 'Oshodi Interchange', 3.3434, 6.5551),
  p('mushin', 'Mushin', 'Idi-Araba', 3.355, 6.53),
  p('gbagada', 'Gbagada', 'Gbagada Expressway', 3.387, 6.555),
  p('mile2', 'Mile 2', 'Amuwo Odofin', 3.3083, 6.461),
  p('festac', 'Festac', 'Festac Town', 3.283, 6.466),
  p('apapa', 'Apapa', 'Apapa Wharf', 3.3592, 6.4489),
  p('national-theatre', 'National Theatre', 'Iganmu', 3.376, 6.477),
  p('cms', 'CMS', 'Lagos Island', 3.3897, 6.4527, 'island'),
  p('marina', 'Marina', 'Lagos Island', 3.394, 6.45, 'island'),
  p('obalende', 'Obalende', 'TBS, Lagos Island', 3.4035, 6.4485, 'island'),
  p('ikoyi', 'Ikoyi', 'Falomo', 3.4316, 6.4541, 'island'),
  p('vi', 'Victoria Island', 'Ozumba Mbadiwe', 3.4208, 6.4298, 'island'),
  p('lekki-phase-1', 'Lekki Phase 1', 'Admiralty Way', 3.4724, 6.4474, 'island'),
  p('ikate', 'Ikate', 'Lekki', 3.499, 6.439, 'island'),
  p('ajah', 'Ajah', 'Ajah Roundabout', 3.565, 6.4672, 'island'),
  p('sangotedo', 'Sangotedo', 'Lekki–Epe Expressway', 3.629, 6.47, 'island'),
];

export const PLACE_BY_ID = new Map(PLACES.map((x) => [x.id, x]));

export interface Line {
  id: string;
  mode: Extract<TravelMode, 'brt' | 'rail' | 'danfo'>;
  name: string;
  stops: string[];
  /** Minutes between vehicles off-peak and at rush hour. */
  every: [number, number];
  /** Drawn on the light map; BRT orange, each rail line its own colour. */
  color: string;
}

export const DANFO_COLOR = '#C98A0B';
const danfo = (id: string, stops: string[]): Line => ({ id, mode: 'danfo', name: '', stops, every: [4, 10], color: DANFO_COLOR });

/**
 * Lagos has no public BRT or rail timetable, so frequencies and stops are
 * estimates for the demo, labelled as such in the app.
 */
export const LINES: Line[] = [
  { id: 'brt-ikorodu', mode: 'brt', name: 'Ikorodu–TBS BRT', stops: ['ikorodu', 'mile12', 'ketu', 'ojota', 'maryland', 'fadeyi', 'yaba', 'costain', 'cms', 'obalende'], every: [8, 15], color: '#FF5A1F' },
  { id: 'brt-abule-egba', mode: 'brt', name: 'Oshodi–Abule Egba BRT', stops: ['abule-egba', 'iyana-ipaja', 'ikeja-along', 'oshodi'], every: [8, 15], color: '#E8590C' },
  { id: 'rail-red', mode: 'rail', name: 'Red Line', stops: ['agbado', 'agege', 'ikeja', 'oshodi', 'mushin', 'yaba', 'ebute-metta'], every: [30, 30], color: '#D7263D' },
  { id: 'rail-blue', mode: 'rail', name: 'Blue Line', stops: ['mile2', 'national-theatre', 'marina'], every: [15, 15], color: '#2563EB' },
  danfo('d-cms-ajah', ['cms', 'obalende', 'vi', 'lekki-phase-1', 'ikate', 'ajah']),
  danfo('d-obalende-ikoyi', ['obalende', 'ikoyi', 'lekki-phase-1']),
  danfo('d-ajah-sangotedo', ['ajah', 'sangotedo']),
  danfo('d-yaba-cms', ['yaba', 'ebute-metta', 'cms']),
  danfo('d-oshodi-obalende', ['oshodi', 'gbagada', 'obalende']),
  danfo('d-oshodi-yaba', ['oshodi', 'mushin', 'surulere', 'yaba']),
  danfo('d-ikeja-oshodi', ['ikeja', 'oshodi']),
  danfo('d-ikeja-yaba', ['ikeja', 'maryland', 'fadeyi', 'yaba']),
  danfo('d-berger-yaba', ['berger', 'ojota', 'maryland', 'yaba']),
  danfo('d-berger-ikeja', ['berger', 'ikeja']),
  danfo('d-ojota-ikorodu', ['ojota', 'ketu', 'mile12', 'ikorodu']),
  danfo('d-yaba-costain', ['yaba', 'surulere', 'costain']),
  danfo('d-yaba-unilag', ['yaba', 'unilag']),
  danfo('d-abule-oshodi', ['abule-egba', 'ikeja-along', 'oshodi']),
  danfo('d-ipaja-ikeja', ['iyana-ipaja', 'ikeja-along', 'ikeja']),
  danfo('d-agbado-agege', ['agbado', 'agege', 'ikeja']),
  danfo('d-airport-oshodi', ['airport', 'oshodi']),
  danfo('d-oshodi-apapa', ['oshodi', 'mile2', 'apapa']),
  danfo('d-mile2-festac', ['mile2', 'festac']),
  danfo('d-mile2-cms', ['mile2', 'national-theatre', 'costain', 'cms']),
  danfo('d-gbagada-ketu', ['gbagada', 'ketu']),
];

/** Approximate bridge alignments, so routes between the mainland and the Island bend the right way on the map. */
export const BRIDGES = {
  /** North to south: Oworonshoki, Adekunle, Adeniji Adele. */
  thirdMainland: [[3.3935, 6.547], [3.3875, 6.4985], [3.4015, 6.4625]] as [number, number][],
  eko: [[3.379, 6.47]] as [number, number][],
  /** Falomo, the way onto Lekki from the old Island. */
  falomo: [3.432, 6.45] as [number, number],
};

export const PRICES = {
  /** Pump price used for fuel estimates, ₦ per litre. */
  petrolPerLitre: 1050,
  /** Cheapest self-drive car in the demo fleet, ₦ per day. */
  rentalFromPerDay: 16500,
  rentalLitresPer100km: 8,
};
