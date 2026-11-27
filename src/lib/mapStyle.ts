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
