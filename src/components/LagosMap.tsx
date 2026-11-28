import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInView, useReducedMotion } from 'framer-motion';
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, PaddingOptions } from 'maplibre-gl';
import type { LagosHub } from '../data/hopData';
import { CORRIDOR_ROUTE } from '../data/corridorRoute';
import { lagosMapStyle } from '../lib/mapStyle';
import { loadMapLibre } from '../lib/maplibre';
import { HUB_STATUS } from '../lib/ui';

const SIGNAL = '#FF5A1F';

/** Names the base map would label on top of our own hub pins. */
const HIDDEN_PLACE_NAMES = ['Ikeja', 'Oshodi', 'Yaba', 'Victoria Island', 'Lekki Phase 1', 'Lekki Phase I', 'Marina'];

function routeBounds(): LngLatBoundsLike {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const [x, y] of CORRIDOR_ROUTE) {
    w = Math.min(w, x); e = Math.max(e, x);
    s = Math.min(s, y); n = Math.max(n, y);
  }
  return [[w, s], [e, n]];
}

const line = (coords: [number, number][]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates: coords },
});

/** Route cut to a fraction of its length, so it can be drawn on. */
function partialRoute(t: number): [number, number][] {
  const pts = CORRIDOR_ROUTE;
  if (t >= 1) return pts;
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(d);
    total += d;
  }
  let target = total * t;
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (target <= segs[i - 1]) {
      const k = segs[i - 1] ? target / segs[i - 1] : 0;
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
      return out;
    }
    target -= segs[i - 1];
    out.push(pts[i]);
  }
  return out;
}

interface LagosMapProps {
  hubs: LagosHub[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Space kept clear for overlays when framing the corridor. */
  padding: PaddingOptions;
  resetSignal: number;
}

export function LagosMap({ hubs, selectedId, onSelect, padding, resetSignal }: LagosMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const firstSelect = useRef(true);
  const reduce = useReducedMotion();
  const near = useInView(wrapRef, { once: true, margin: '900px 0px' });
  const visible = useInView(wrapRef, { once: true, amount: 0.35 });
  const [pins, setPins] = useState<{ id: string; el: HTMLElement }[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const paddingRef = useRef(padding);
  useEffect(() => {
    paddingRef.current = padding;
  }, [padding]);

  // Load MapLibre only when the section gets close
  useEffect(() => {
    if (!near || mapRef.current || !wrapRef.current) return;
    let cancelled = false;
    const container = wrapRef.current.querySelector<HTMLDivElement>('[data-map]')!;

    (async () => {
      try {
        const ml = await loadMapLibre();
        if (cancelled) return;

        const map = new ml.Map({
          container,
          style: lagosMapStyle(HIDDEN_PLACE_NAMES),
          bounds: routeBounds(),
          fitBoundsOptions: { padding: paddingRef.current },
          minZoom: 9.5,
          maxZoom: 17,
          maxBounds: [[2.95, 6.2], [3.95, 6.9]],
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-left');
        mapRef.current = map;

        map.on('error', (e) => {
          if (!map.isStyleLoaded()) console.warn('Map error', e.error?.message);
        });

        map.on('load', () => {
          map.addSource('corridor', { type: 'geojson', data: line([CORRIDOR_ROUTE[0], CORRIDOR_ROUTE[0]]) });
          map.addLayer(
            {
              id: 'corridor-glow',
              type: 'line',
              source: 'corridor',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': SIGNAL, 'line-width': 14, 'line-blur': 10, 'line-opacity': 0.35 },
            },
            'water-name',
          );
          map.addLayer(
            {
              id: 'corridor',
              type: 'line',
              source: 'corridor',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': SIGNAL, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 15, 5] },
            },
            'water-name',
          );

          setPins(
            hubs.map((h) => {
              const el = document.createElement('div');
              new ml.Marker({ element: el, anchor: 'top' }).setLngLat(h.lngLat).addTo(map);
              return { id: h.id, el };
            }),
          );
          setReady(true);
        });
      } catch (err) {
        console.warn('Map could not start', err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [near, hubs]);

  // Clean up on unmount
  useEffect(() => () => mapRef.current?.remove(), []);

  // Draw the corridor once the map is on screen
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !visible || !map) return;
    const src = map.getSource('corridor') as GeoJSONSource | undefined;
    if (!src) return;
    if (reduce) {
      src.setData(line(CORRIDOR_ROUTE));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 2600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      src.setData(line(partialRoute(eased)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, visible, reduce]);

  // Fly to the selected hub
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (firstSelect.current) {
      firstSelect.current = false;
      return;
    }
    const hub = hubs.find((h) => h.id === selectedId);
    if (!hub) return;
    const opts = { center: hub.lngLat, zoom: 14.6, padding: paddingRef.current };
    if (reduce) map.jumpTo(opts);
    else map.flyTo({ ...opts, speed: 0.9, curve: 1.5, essential: true });
  }, [selectedId, ready, hubs, reduce]);

  // Back to the whole corridor
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || resetSignal === 0) return;
    map.fitBounds(routeBounds(), { padding: paddingRef.current, duration: reduce ? 0 : 1400 });
  }, [resetSignal, ready, reduce]);

  return (
    <div ref={wrapRef} className="hop-map absolute inset-0">
      {/* maplibre-gl.css sets position: relative on this node, so size it explicitly */}
      <div data-map className="h-full w-full" />
      {!ready && !failed && (
        <div className="absolute inset-0 flex items-center justify-center text-[14px] text-chalk/40">Loading the map of Lagos…</div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-[15px] text-chalk/60">
          The live map needs WebGL, which this browser has turned off.
        </div>
      )}
      {pins.map(({ id, el }) => {
        const hub = hubs.find((h) => h.id === id)!;
        const on = id === selectedId;
        return createPortal(
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={on}
            aria-label={`${hub.name}, ${HUB_STATUS[hub.status].label.toLowerCase()}`}
            className="group flex -translate-y-[7px] flex-col items-center"
          >
            <span
              className={`block rounded-full border-2 border-night transition-all duration-300 ${on ? 'h-4 w-4 ring-[6px] ring-white/20' : 'h-3 w-3 group-hover:ring-4 group-hover:ring-white/15'}`}
              style={{ backgroundColor: HUB_STATUS[hub.status].color }}
            />
            <span
              className={`mt-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] leading-none font-medium shadow-[0_4px_16px_rgb(0_0_0/0.5)] transition-colors ${
                on ? 'bg-chalk text-ink' : 'bg-night/85 text-chalk/85 group-hover:text-chalk'
              }`}
            >
              {hub.name}
            </span>
          </button>,
          el,
          id,
        );
      })}
    </div>
  );
}
