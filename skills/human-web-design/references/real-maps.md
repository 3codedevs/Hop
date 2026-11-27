# Real maps, free and without an API key

A dot grid with made-up pins looks fake. A real map with the city's actual roads, water and neighbourhood names, styled to match the page, looks like a real product.

## Stack

- **MapLibre GL JS** (open source). Use **version 6.20 or later**: versions up to 6.4 have a critical XSS advisory (GHSA-jrc7-96c5-q579).
- **OpenFreeMap** vector tiles from OpenStreetMap data: free, no API key, no usage limits. Tilejson: `https://tiles.openfreemap.org/planet`. Fonts: `https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf` (has "Noto Sans Regular", "Noto Sans Bold" and "Noto Sans Italic").
- **OSRM** public router for real road routes between points: `https://router.project-osrm.org/route/v1/driving/{lng,lat;lng,lat;...}?overview=full&geometries=geojson`. It is a demo server, so fetch once while building, simplify the line, and save it as a data file. Do not call it from visitors' browsers.

Attribution is required. Put it on the map and in the footer: "OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors".

## Install and load lazily

MapLibre is about 300 KB gzipped. Load it only when the map section is near the viewport.

```bash
npm i maplibre-gl@^6.20.0
```

MapLibre 6 is ES-module only and runs a separate worker file. With Vite, import the worker as a URL and tell MapLibre where it is:

```tsx
const [ml, worker] = await Promise.all([
  import('maplibre-gl'),
  import('maplibre-gl/dist/maplibre-gl-worker.mjs?url'),
  import('maplibre-gl/dist/maplibre-gl.css'),
]);
ml.setWorkerUrl(new URL(worker.default, location.href).href);

const map = new ml.Map({
  container,                       // see the sizing trap below
  style: myStyle(),                // your own style object
  bounds: routeBounds,             // frame the content, not a fixed zoom
  fitBoundsOptions: { padding },   // keep overlays (cards, legends) clear
  maxBounds,                       // stop people wandering off to another continent
  minZoom: 9.5, maxZoom: 17,
  cooperativeGestures: true,       // Ctrl+scroll / two fingers to zoom, so the page still scrolls
  dragRotate: false, pitchWithRotate: false,
  attributionControl: { compact: true },
});
map.touchZoomRotate.disableRotation();
map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-left');
```

## A custom style

Write your own small style object instead of using a stock one, so the map matches the page. Source layers in the OpenMapTiles schema: `water`, `waterway`, `landcover`, `landuse`, `park`, `aeroway`, `building`, `transportation` (class: motorway, trunk, primary, secondary, tertiary, minor, service, rail; `brunnel`: bridge or tunnel), `transportation_name`, `place`, `water_name`.

Principles for a dark style:
- Land a warm near-black (#161613), water a cooler, deeper black (#0A0F12).
- Roads in the page's "chalk" colour with opacity ranked by class: motorway about 0.5, primary 0.34, secondary 0.24, tertiary 0.16, minor 0.1. Widths grow exponentially with zoom.
- Bridges get a dark casing so they lift off the water.
- Buildings fade in from zoom 13 to 15.
- Labels: water names in italic (as on printed maps), places upright and quiet, road names only from zoom 13. Hide base labels that duplicate your own pins.
- Your own data (routes, pins) goes in the one accent colour.

```ts
const chalk = (a: number) => `rgba(237, 235, 230, ${a})`;
const width = (stops: number[]) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];

layers: [
  { id: 'land', type: 'background', paint: { 'background-color': '#161613' } },
  { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': '#0A0F12' } },
  { id: 'road-primary', type: 'line', source: 'osm', 'source-layer': 'transportation',
    filter: ['in', ['get', 'class'], ['literal', ['primary']]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': chalk(0.34), 'line-width': width([8, 0.5, 14, 2.4, 18, 16]) } },
  { id: 'water-name', type: 'symbol', source: 'osm', 'source-layer': 'water_name',
    layout: { 'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Italic'], 'text-size': 12 },
    paint: { 'text-color': '#56656b', 'text-halo-color': '#0A0F12', 'text-halo-width': 1 } },
  // ...minor roads, bridges, buildings, place labels
]
```

## Route and pins

- Simplify the OSRM line (Douglas–Peucker, about 0.00008° tolerance, roughly 9 m) and round coordinates to 5 decimals. A 40 km city route drops from about 1,000 points to about 170.
- Draw it as two line layers in the accent colour: a wide blurred glow (width 14, blur 10, opacity 0.35) under a crisp core (width 2.5 to 5 by zoom). Insert both below the label layers.
- Animate the drawing once, when the map is on screen: grow the coordinate list over about 2.5 seconds with `source.setData()`. Show the whole line at once under reduced motion.
- Pins as HTML markers at real coordinates. In React, create one empty element per marker and render the pin into it with `createPortal`, so clicks and state stay in React.
- Selecting a pin calls `map.flyTo({ center, zoom: 14.5, padding })` (or `jumpTo` under reduced motion). Offer a "Whole corridor" button that calls `fitBounds` again.

## Traps

- **Sizing:** `maplibre-gl.css` sets `position: relative` on the map container and is not in a cascade layer, so it beats Tailwind v4 utilities like `absolute inset-0`. The container collapses to 0px high and the map is invisible. Give the container an explicit `width: 100%; height: 100%` inside a sized parent.
- **Screenshots:** headless Chromium renders WebGL fine with its default launch. Adding `--use-angle=swiftshader` flags can hang screenshots.
- **Scroll trapping:** without `cooperativeGestures`, the map swallows wheel and touch scrolling and the page feels broken.
- **Fallback:** if WebGL is unavailable the map throws. Catch it and show a short sentence in place of the map.
