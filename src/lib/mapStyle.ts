import type { StyleSpecification } from 'maplibre-gl';

/**
 * A dark cartographic style for Lagos, drawn from OpenStreetMap data served by
 * OpenFreeMap (OpenMapTiles schema). Land is a warm near-black, water is a
 * cooler, deeper black, and roads are ranked by brightness so the expressways
 * and the Third Mainland Bridge read first.
 */

const INK = '#0B0B0A';
const LAND = '#161613';
const WATER = '#0A0F12';
const CHALK = '237, 235, 230';
const chalk = (a: number) => `rgba(${CHALK}, ${a})`;

type Zoomed = ['interpolate', ['exponential', number], ['zoom'], ...number[]];
const width = (stops: number[]): Zoomed => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];

const ROAD_CLASSES: { cls: string[]; color: string; w: number[] }[] = [
  { cls: ['service', 'track'], color: chalk(0.07), w: [13, 0.2, 18, 3] },
  { cls: ['minor'], color: chalk(0.1), w: [12, 0.2, 14, 0.8, 18, 6] },
  { cls: ['tertiary'], color: chalk(0.16), w: [10, 0.3, 14, 1.3, 18, 9] },
  { cls: ['secondary'], color: chalk(0.24), w: [9, 0.4, 14, 1.8, 18, 12] },
  { cls: ['primary'], color: chalk(0.34), w: [8, 0.5, 14, 2.4, 18, 16] },
  { cls: ['trunk', 'motorway'], color: chalk(0.5), w: [7, 0.7, 14, 3.2, 18, 20] },
];

export function lagosMapStyle(hiddenPlaceNames: string[] = []): StyleSpecification {
  const notHidden = ['!', ['in', ['get', 'name'], ['literal', hiddenPlaceNames]]] as const;
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      osm: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        attribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>',
      },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': LAND } },

      // Ground texture: green space and built-up areas, kept very quiet
      {
        id: 'park',
        type: 'fill',
        source: 'osm',
        'source-layer': 'park',
        paint: { 'fill-color': '#141a14', 'fill-opacity': 0.9 },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'wetland', 'farmland']]],
        paint: { 'fill-color': '#151a15', 'fill-opacity': 0.8 },
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial', 'retail']]],
        paint: { 'fill-color': '#1a1a17', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.4, 14, 0.8] },
      },
      {
        id: 'aeroway',
        type: 'fill',
        source: 'osm',
        'source-layer': 'aeroway',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#1c1c19' },
      },
      {
        id: 'runway',
        type: 'line',
        source: 'osm',
        'source-layer': 'aeroway',
        filter: ['in', ['get', 'class'], ['literal', ['runway', 'taxiway']]],
        paint: { 'line-color': chalk(0.12), 'line-width': width([10, 1, 15, 12]) },
      },

      // Water: lagoon, creeks, ocean
      { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': WATER } },
      {
        id: 'waterway',
        type: 'line',
        source: 'osm',
        'source-layer': 'waterway',
        paint: { 'line-color': WATER, 'line-width': width([10, 0.5, 16, 4]) },
      },
      {
        id: 'shoreline',
        type: 'line',
        source: 'osm',
        'source-layer': 'water',
        paint: { 'line-color': chalk(0.06), 'line-width': 0.6 },
      },

      // Buildings appear as you zoom in
      {
        id: 'building',
        type: 'fill',
        source: 'osm',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': '#22221e',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 15, 0.9],
          'fill-outline-color': chalk(0.05),
        },
      },

      // Rail
      {
        id: 'rail',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'rail'],
        paint: { 'line-color': chalk(0.18), 'line-width': width([10, 0.4, 16, 1.6]), 'line-dasharray': [3, 2] },
      },

      // Roads, faint to bright
      ...ROAD_CLASSES.map((r) => ({
        id: `road-${r.cls[0]}`,
        type: 'line' as const,
        source: 'osm',
        'source-layer': 'transportation',
        filter: ['all', ['in', ['get', 'class'], ['literal', r.cls]], ['!=', ['get', 'brunnel'], 'bridge']] as never,
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
        paint: { 'line-color': r.color, 'line-width': width(r.w) },
      })),

      // Bridges get a dark casing so they lift off the water
      {
        id: 'bridge-casing',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: ['all', ['==', ['get', 'brunnel'], 'bridge'], ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]]],
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: { 'line-color': INK, 'line-width': width([8, 1.6, 14, 6, 18, 26]) },
      },
      {
        id: 'bridge',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: ['all', ['==', ['get', 'brunnel'], 'bridge'], ['!=', ['get', 'class'], 'rail']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], chalk(0.55), chalk(0.3)],
          'line-width': width([8, 0.7, 14, 3.2, 18, 18]),
        },
      },

      // Labels: italic for water, upright for places, as on a printed map
      {
        id: 'water-name',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'water_name',
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Italic'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 14, 14],
          'text-letter-spacing': 0.08,
          'text-max-width': 8,
        },
        paint: { 'text-color': '#56656b', 'text-halo-color': WATER, 'text-halo-width': 1 },
      },
      {
        id: 'road-name',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
        },
        paint: { 'text-color': chalk(0.45), 'text-halo-color': INK, 'text-halo-width': 1.2 },
      },
      {
        id: 'place-minor',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'place',
        minzoom: 12,
        filter: ['all', ['in', ['get', 'class'], ['literal', ['neighbourhood', 'quarter']]], notHidden] as never,
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-max-width': 7,
        },
        paint: { 'text-color': chalk(0.35), 'text-halo-color': INK, 'text-halo-width': 1.2 },
      },
      {
        id: 'place-suburb',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'place',
        filter: ['all', ['in', ['get', 'class'], ['literal', ['suburb', 'town', 'village']]], notHidden] as never,
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 14, 14],
          'text-max-width': 7,
        },
        paint: { 'text-color': chalk(0.5), 'text-halo-color': INK, 'text-halo-width': 1.4 },
      },
    ],
  };
}

export const MAP_COLORS = { INK, LAND, WATER };

/**
 * Hop's own daytime map: a printed-atlas look on the app's paper colour.
 * Roads are white with warm grey casings, the lagoon is a pale grey-blue, and
 * everything is kept quiet so routes, transit lines and traffic read first.
 */
export const PAPER = {
  land: '#F3F1EC',
  builtUp: '#ECE8E0',
  green: '#DCE4D0',
  water: '#C5D9E0',
  shore: '#A8C2CB',
  building: '#E3DED4',
  casing: '#CFC8BA',
  casingMajor: '#A89F8F',
  road: '#FFFFFF',
  roadMajor: '#FFFDF7',
  label: '#2F2E2A',
  labelSoft: '#77736A',
  waterLabel: '#4F7C8A',
};

export function hopPaperStyle(): StyleSpecification {
  const P = PAPER;
  const name = ['coalesce', ['get', 'name:en'], ['get', 'name']] as never;
  const roads = (cls: string[], bridge: boolean) =>
    ['all', ['in', ['get', 'class'], ['literal', cls]], bridge ? ['==', ['get', 'brunnel'], 'bridge'] : ['!=', ['get', 'brunnel'], 'bridge']] as never;
  const classes = [
    { id: 'minor', cls: ['minor', 'service'], fill: P.road, casing: P.casing, w: [12, 0.4, 14, 1.6, 18, 10], min: 12 },
    { id: 'tertiary', cls: ['tertiary'], fill: P.road, casing: P.casing, w: [10, 0.5, 14, 2.4, 18, 14], min: 10 },
    { id: 'secondary', cls: ['secondary'], fill: P.road, casing: P.casing, w: [9, 0.6, 14, 3.4, 18, 18], min: 9 },
    { id: 'primary', cls: ['primary'], fill: P.roadMajor, casing: P.casingMajor, w: [8, 0.8, 14, 4.4, 18, 22], min: 0 },
    { id: 'major', cls: ['trunk', 'motorway'], fill: P.roadMajor, casing: P.casingMajor, w: [7, 1.2, 14, 5.6, 18, 26], min: 0 },
  ];
  const casingWidth = (w: number[]) => width(w.map((v, i) => (i % 2 ? v + Math.max(1, v * 0.35) : v)));

  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: lagosMapStyle().sources,
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': P.land } },
      {
        id: 'landuse',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial', 'retail']]],
        paint: { 'fill-color': P.builtUp, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 14, 1] },
      },
      { id: 'park', type: 'fill', source: 'osm', 'source-layer': 'park', paint: { 'fill-color': P.green } },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'wetland', 'farmland']]],
        paint: { 'fill-color': P.green, 'fill-opacity': 0.7 },
      },
      { id: 'aeroway', type: 'fill', source: 'osm', 'source-layer': 'aeroway', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#E6E2D9' } },
      {
        id: 'runway',
        type: 'line',
        source: 'osm',
        'source-layer': 'aeroway',
        filter: ['in', ['get', 'class'], ['literal', ['runway', 'taxiway']]],
        paint: { 'line-color': '#D6D0C4', 'line-width': width([10, 1, 15, 14]) },
      },

      { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': P.water } },
      { id: 'waterway', type: 'line', source: 'osm', 'source-layer': 'waterway', paint: { 'line-color': P.water, 'line-width': width([10, 0.6, 16, 5]) } },
      { id: 'shoreline', type: 'line', source: 'osm', 'source-layer': 'water', paint: { 'line-color': P.shore, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.4, 15, 1.2] } },

      {
        id: 'building',
        type: 'fill',
        source: 'osm',
        'source-layer': 'building',
        minzoom: 14,
        paint: { 'fill-color': P.building, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.5, 1], 'fill-outline-color': '#D3CDC1' },
      },

      // Roads as on a printed map: a warm casing, then a white fill on top
      ...classes.map((r) => ({
        id: `road-${r.id}-casing`,
        type: 'line' as const,
        source: 'osm',
        'source-layer': 'transportation',
        minzoom: r.min,
        filter: roads(r.cls, false),
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
        paint: { 'line-color': r.casing, 'line-width': casingWidth(r.w) },
      })),
      ...classes.map((r) => ({
        id: `road-${r.id}`,
        type: 'line' as const,
        source: 'osm',
        'source-layer': 'transportation',
        minzoom: r.min,
        filter: roads(r.cls, false),
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
        paint: { 'line-color': r.fill, 'line-width': width(r.w) },
      })),
      {
        id: 'rail',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'rail'],
        paint: { 'line-color': '#9A9488', 'line-width': width([10, 0.6, 16, 2]), 'line-dasharray': [4, 3] },
      },
      {
        id: 'bridge-casing',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: roads(['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true),
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: { 'line-color': '#8E8677', 'line-width': width([8, 2.2, 14, 8, 18, 32]) },
      },
      {
        id: 'bridge',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: roads(['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': P.roadMajor, 'line-width': width([8, 1.2, 14, 5.6, 18, 26]) },
      },

      {
        id: 'water-name',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'water_name',
        layout: { 'text-field': name, 'text-font': ['Noto Sans Italic'], 'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 14, 14], 'text-letter-spacing': 0.1, 'text-max-width': 8 },
        paint: { 'text-color': P.waterLabel, 'text-halo-color': P.water, 'text-halo-width': 1.2 },
      },
      {
        id: 'road-name',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'transportation_name',
        minzoom: 13,
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
        layout: { 'symbol-placement': 'line', 'text-field': name, 'text-font': ['Noto Sans Regular'], 'text-size': 11 },
        paint: { 'text-color': P.labelSoft, 'text-halo-color': P.road, 'text-halo-width': 1.5 },
      },
      {
        id: 'place-minor',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'place',
        minzoom: 12.5,
        filter: ['in', ['get', 'class'], ['literal', ['neighbourhood', 'quarter']]],
        layout: { 'text-field': name, 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-max-width': 7 },
        paint: { 'text-color': P.labelSoft, 'text-halo-color': P.land, 'text-halo-width': 1.5 },
      },
      {
        id: 'place-suburb',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'place',
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'town', 'village', 'city']]],
        layout: { 'text-field': name, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 14, 14], 'text-max-width': 7, 'text-letter-spacing': 0.02 },
        paint: { 'text-color': P.label, 'text-halo-color': P.land, 'text-halo-width': 1.6 },
      },
    ],
  };
}
