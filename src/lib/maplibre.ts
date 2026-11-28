type MapLibre = typeof import('maplibre-gl');

let loading: Promise<MapLibre> | null = null;

/** Loads MapLibre, its worker and CSS once, on first use (about 300 KB gzipped). */
export function loadMapLibre(): Promise<MapLibre> {
  loading ??= Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl-worker.mjs?url'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ])
    .then(([ml, worker]) => {
      ml.setWorkerUrl(new URL(worker.default, window.location.href).href);
      return ml;
    })
    .catch((e) => {
      loading = null;
      throw e;
    });
  return loading;
}
