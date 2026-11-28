import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers as LayersIcon, X } from 'lucide-react';
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { Leg, LngLat, NetworkResponse, TrafficLevel, TravelMode } from '../../shared/types';
import { hopPaperStyle, lagosMapStyle, PAPER } from '../lib/mapStyle';
import { loadMapLibre } from '../lib/maplibre';
import { MODE_META } from '../lib/ui';
import { useApi } from './api';
import { lagosNow } from './format';
import type { MapPadding } from './MapLayout';
import { useDark } from './store';

export interface MapPoint {
  lngLat: LngLat;
  kind: 'from' | 'to';
}

type LayerKey = 'traffic' | 'brt' | 'rail' | 'danfo' | 'stations' | 'landmarks';
type Layers = Record<LayerKey, boolean>;

const TRAFFIC_COLORS: Record<TrafficLevel, string> = { clear: '#2E9D68', moderate: '#E9A23B', heavy: '#E5484D', gridlock: '#8E1B1B' };
const TRAFFIC_LABEL: Record<TrafficLevel, string> = { clear: 'Clear', moderate: 'Slow', heavy: 'Heavy', gridlock: 'Jammed' };

const LAYER_GROUPS: Record<LayerKey, string[]> = {
  traffic: ['traffic'],
  brt: ['net-brt-casing', 'net-brt'],
  rail: ['net-rail', 'net-rail-ties'],
  danfo: ['net-danfo'],
  stations: ['stations', 'station-labels'],
  landmarks: ['landmarks', 'landmark-labels'],
};

const LAYER_ROWS: { key: LayerKey; label: string; swatch: string }[] = [
  { key: 'traffic', label: 'Traffic', swatch: `linear-gradient(90deg, ${TRAFFIC_COLORS.clear}, ${TRAFFIC_COLORS.moderate}, ${TRAFFIC_COLORS.heavy})` },
  { key: 'brt', label: 'BRT lines', swatch: '#FF5A1F' },
  { key: 'rail', label: 'Red and Blue Line trains', swatch: 'linear-gradient(90deg, #D7263D 50%, #2563EB 50%)' },
  { key: 'danfo', label: 'Danfo routes', swatch: MODE_META.danfo.line },
  { key: 'stations', label: 'BRT and train stations', swatch: '#FFFFFF' },
  { key: 'landmarks', label: 'Landmarks', swatch: '#77736A' },
];

const DEFAULT_LAYERS: Layers = { traffic: true, brt: true, rail: true, danfo: false, stations: true, landmarks: true };
const LAGOS: [LngLat, LngLat] = [[3.29, 6.42], [3.6, 6.66]];
const NO_LEGS: Leg[] = [];
const NO_POINTS: MapPoint[] = [];
const EDGE: MapPadding = { top: 40, right: 40, bottom: 40, left: 40 };
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fc = <T,>(features: T[]) => ({ type: 'FeatureCollection' as const, features });
const lineFeature = (path: LngLat[], properties: Record<string, unknown>) => ({ type: 'Feature' as const, properties, geometry: { type: 'LineString' as const, coordinates: path } });
const pointFeature = (p: LngLat, properties: Record<string, unknown>) => ({ type: 'Feature' as const, properties, geometry: { type: 'Point' as const, coordinates: p } });

/** Colours that change with the theme. Map paint can't read CSS variables. */
const tone = (dark: boolean) => ({
  halo: dark ? '#161613' : PAPER.land,
  casing: dark ? '#0B0B0A' : '#FFFFFF',
  stationFill: dark ? '#1C1C1A' : '#FFFFFF',
  label: dark ? '#ECEAE4' : '#0E0F0C',
  landmark: dark ? '#A9A79F' : '#5A564C',
  ties: dark ? '#161613' : '#FFFFFF',
  legLine: (mode: TravelMode) => (dark && (mode === 'ride' || mode === 'rental') ? '#EDEBE6' : dark && mode === 'walk' ? '#A9A79F' : MODE_META[mode].line),
});

/** Rounded to 15 minutes so traffic requests are shared and cached. */
function quarterHour(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(Math.floor(m / 15) * 15).padStart(2, '0')}`;
}

function pinElement(kind: MapPoint['kind']) {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText =
    kind === 'from'
      ? 'width:18px;height:18px;border-radius:999px;background:#fff;border:5px solid #0E0F0C;box-shadow:0 2px 8px rgb(14 15 12/.35)'
      : 'width:24px;height:24px;border-radius:999px;background:#FF5A1F;border:4px solid #fff;box-shadow:0 3px 12px rgb(14 15 12/.4)';
  return el;
}

interface Props {
  legs?: Leg[];
  points?: MapPoint[];
  /** Leave time ("08:00") for the traffic layer. Defaults to now in Lagos. */
  time?: string;
  /** Space covered by the sheet or panel, so routes are framed in the visible part. */
  padding?: MapPadding;
}

/** Pass stable arrays (from state or useMemo): the map refits whenever they change. */
export function HopMap(props: Props) {
  const dark = useDark();
  // A new style means new layers, so the map is rebuilt when the theme changes
  return <MapCanvas key={dark ? 'dark' : 'light'} dark={dark} {...props} />;
}

function MapCanvas({ legs = NO_LEGS, points = NO_POINTS, time, padding = EDGE, dark }: Props & { dark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mlRef = useRef<typeof import('maplibre-gl') | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const paddingRef = useRef(padding);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [panel, setPanel] = useState(false);
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const [nowTime] = useState(() => lagosNow());
  const at = quarterHour(time ?? nowTime);
  const { data: net } = useApi<NetworkResponse>(`/api/network?t=${at}`);

  useEffect(() => {
    paddingRef.current = padding;
  }, [padding]);

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const T = tone(dark);
    loadMapLibre()
      .then((ml) => {
        if (cancelled || !containerRef.current) return;
        mlRef.current = ml;
        map = new ml.Map({
          container: containerRef.current,
          style: dark ? lagosMapStyle() : hopPaperStyle(),
          bounds: LAGOS,
          fitBoundsOptions: { padding: paddingRef.current },
          minZoom: 9,
          maxZoom: 17.5,
          // Generous to the south: with a bottom sheet the camera centre sits below the city
          maxBounds: [[2.7, 5.7], [4.2, 7.1]],
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new ml.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, fitBoundsOptions: { maxZoom: 14 } }), 'top-right');

        const m = map;
        m.on('load', () => {
          for (const id of ['traffic', 'net', 'stations', 'landmarks', 'route', 'changes']) m.addSource(id, { type: 'geojson', data: fc([]) });
          const round = { 'line-cap': 'round' as const, 'line-join': 'round' as const };
          const z = (a: number, b: number) => ['interpolate', ['linear'], ['zoom'], 10, a, 15, b] as never;

          m.addLayer({ id: 'traffic', type: 'line', source: 'traffic', layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(3, 9), 'line-opacity': 0.75 } });
          m.addLayer({ id: 'net-danfo', type: 'line', source: 'net', filter: ['==', ['get', 'mode'], 'danfo'], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(1.2, 3), 'line-dasharray': [2, 1.5] } });
          m.addLayer({ id: 'net-brt-casing', type: 'line', source: 'net', filter: ['==', ['get', 'mode'], 'brt'], layout: round, paint: { 'line-color': T.casing, 'line-width': z(4.5, 9) } });
          m.addLayer({ id: 'net-brt', type: 'line', source: 'net', filter: ['==', ['get', 'mode'], 'brt'], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(2.5, 5.5) } });
          m.addLayer({ id: 'net-rail', type: 'line', source: 'net', filter: ['==', ['get', 'mode'], 'rail'], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(3, 6.5) } });
          m.addLayer({ id: 'net-rail-ties', type: 'line', source: 'net', filter: ['==', ['get', 'mode'], 'rail'], paint: { 'line-color': T.ties, 'line-width': z(1, 2), 'line-dasharray': [1, 2.5] } });

          m.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: round, paint: { 'line-color': T.casing, 'line-width': z(9, 15) } });
          m.addLayer({ id: 'route-walk', type: 'line', source: 'route', filter: ['==', ['get', 'mode'], 'walk'], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(3, 5), 'line-dasharray': [0.2, 1.8] } });
          m.addLayer({ id: 'route-line', type: 'line', source: 'route', filter: ['!=', ['get', 'mode'], 'walk'], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': z(5, 9) } });
          m.addLayer({ id: 'changes', type: 'circle', source: 'changes', paint: { 'circle-radius': z(4.5, 7), 'circle-color': T.stationFill, 'circle-stroke-color': T.label, 'circle-stroke-width': 2.5 } });

          m.addLayer({ id: 'landmarks', type: 'circle', source: 'landmarks', minzoom: 10.5, paint: { 'circle-radius': 3, 'circle-color': T.landmark, 'circle-stroke-color': T.halo, 'circle-stroke-width': 1.5 } });
          m.addLayer({
            id: 'landmark-labels',
            type: 'symbol',
            source: 'landmarks',
            minzoom: 11.5,
            layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': 11.5, 'text-anchor': 'left', 'text-offset': [0.7, 0], 'text-max-width': 9, 'text-optional': true },
            paint: { 'text-color': T.landmark, 'text-halo-color': T.halo, 'text-halo-width': 1.6 },
          });
          m.addLayer({ id: 'stations', type: 'circle', source: 'stations', paint: { 'circle-radius': z(3.5, 7), 'circle-color': T.stationFill, 'circle-stroke-color': ['get', 'color'], 'circle-stroke-width': z(2, 3) } });
          m.addLayer({
            id: 'station-labels',
            type: 'symbol',
            source: 'stations',
            minzoom: 11,
            layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-optional': true },
            paint: { 'text-color': T.label, 'text-halo-color': T.halo, 'text-halo-width': 1.8 },
          });

          mapRef.current = m;
          setReady(true);
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, [dark]);

  // Network, stations, landmarks and traffic for the chosen hour
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !net) return;
    (map.getSource('traffic') as GeoJSONSource).setData(fc(net.traffic.map((s) => lineFeature(s.path, { color: TRAFFIC_COLORS[s.level] }))));
    (map.getSource('net') as GeoJSONSource).setData(fc(net.lines.map((l) => lineFeature(l.path, { mode: l.mode, color: l.color }))));
    const both = dark ? '#ECEAE4' : '#0E0F0C';
    (map.getSource('stations') as GeoJSONSource).setData(
      fc(net.stations.map((s) => pointFeature(s.lngLat, { name: s.name, color: s.modes.length > 1 ? both : s.modes[0] === 'brt' ? '#FF5A1F' : '#D7263D' }))),
    );
    (map.getSource('landmarks') as GeoJSONSource).setData(fc(net.landmarks.map((l) => pointFeature(l.lngLat, { name: l.name }))));
  }, [ready, net, dark]);

  // Layer filters
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    for (const key of Object.keys(LAYER_GROUPS) as LayerKey[]) {
      for (const id of LAYER_GROUPS[key]) map.setLayoutProperty(id, 'visibility', layers[key] ? 'visible' : 'none');
    }
  }, [ready, layers]);

  // The trip: route, change points and pins. The network fades back so the route reads first.
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!ready || !map || !ml) return;
    const T = tone(dark);
    (map.getSource('route') as GeoJSONSource).setData(fc(legs.map((l) => lineFeature(l.path, { mode: l.mode, color: l.color ?? T.legLine(l.mode) }))));
    (map.getSource('changes') as GeoJSONSource).setData(fc(legs.slice(0, -1).map((l) => pointFeature(l.path[l.path.length - 1], {}))));
    const fade = legs.length > 0;
    map.setPaintProperty('traffic', 'line-opacity', fade ? 0.22 : 0.75);
    for (const id of ['net-danfo', 'net-brt', 'net-rail', 'net-brt-casing', 'net-rail-ties']) map.setPaintProperty(id, 'line-opacity', fade ? 0.15 : 1);
    map.setPaintProperty('stations', 'circle-opacity', fade ? 0.35 : 1);
    map.setPaintProperty('stations', 'circle-stroke-opacity', fade ? 0.35 : 1);

    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current = points.map((p) => new ml.Marker({ element: pinElement(p.kind) }).setLngLat(p.lngLat).addTo(map));

    const coords = [...legs.flatMap((l) => l.path), ...points.map((p) => p.lngLat)];
    if (coords.length >= 2) {
      const bounds = new ml.LngLatBounds(coords[0], coords[0]);
      for (const c of coords) bounds.extend(c);
      map.fitBounds(bounds, { padding: paddingRef.current, maxZoom: 14.5, duration: reduced() ? 0 : 900 });
    } else if (coords.length === 1) {
      map.easeTo({ center: coords[0], zoom: 13, padding: paddingRef.current, duration: reduced() ? 0 : 900 });
    }
  }, [ready, legs, points, dark]);

  // With nothing to show, frame Lagos in the part of the map the sheet or panel leaves visible
  const empty = legs.length === 0 && points.length === 0;
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !empty) return;
    map.fitBounds(LAGOS, { padding: { top: padding.top, right: padding.right, bottom: padding.bottom, left: padding.left }, duration: 0 });
  }, [ready, empty, padding.top, padding.right, padding.bottom, padding.left]);

  return (
    <div className="hop-paper relative h-full w-full overflow-hidden" style={{ background: dark ? '#161613' : PAPER.land }}>
      <div ref={containerRef} className="h-full w-full" />

      {failed ? (
        <p className="absolute inset-0 grid place-items-center p-6 text-center text-[14px] text-muted">The map needs WebGL, which this browser has turned off.</p>
      ) : (
        <div className="absolute top-2.5 right-[62px] z-10 flex flex-col items-end">
          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            aria-expanded={panel}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-line bg-surface/95 px-3 text-[13px] font-medium text-ink shadow-[0_6px_18px_-10px_rgb(14_15_12/0.35)]"
          >
            {panel ? <X className="h-4 w-4" /> : <LayersIcon className="h-4 w-4" />}
            Layers
          </button>
          <AnimatePresence>
            {panel && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-2 w-64 rounded-[18px] border border-line bg-surface p-2 text-ink shadow-[0_18px_40px_-20px_rgb(14_15_12/0.45)]"
              >
                <div className="px-2 pt-1 pb-2 text-[12px] text-muted">Show on the map</div>
                {LAYER_ROWS.map((row) => (
                  <label key={row.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-ink/5">
                    <input
                      type="checkbox"
                      checked={layers[row.key]}
                      onChange={(e) => setLayers({ ...layers, [row.key]: e.target.checked })}
                      className="h-4 w-4 accent-[var(--color-ink)]"
                    />
                    <span className="h-2.5 w-6 shrink-0 rounded-full border border-line" style={{ background: row.swatch }} aria-hidden="true" />
                    <span className="text-[14px]">{row.label}</span>
                  </label>
                ))}
                {net && (
                  <div className="mt-1 border-t border-line px-2 pt-2 pb-1">
                    <div className="num text-[12px] text-muted">Traffic at {net.at} · simulated</div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                      {(Object.keys(TRAFFIC_COLORS) as TrafficLevel[]).map((lvl) => (
                        <span key={lvl} className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: TRAFFIC_COLORS[lvl] }} />
                          {TRAFFIC_LABEL[lvl]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {!panel && layers.traffic && net && (
            <div className="pointer-events-none mt-2 hidden items-center gap-2 rounded-full border border-line bg-surface/95 px-3 py-1.5 text-[12px] text-ink shadow-sm lg:flex">
              <span className="num text-muted">Traffic {net.at}</span>
              {(Object.keys(TRAFFIC_COLORS) as TrafficLevel[]).map((lvl) => (
                <span key={lvl} className="h-2 w-2 rounded-full" style={{ background: TRAFFIC_COLORS[lvl] }} title={TRAFFIC_LABEL[lvl]} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
