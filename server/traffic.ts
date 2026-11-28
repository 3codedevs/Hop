import type { Place, TrafficLevel } from '../shared/types.js';

/** General congestion by hour of day (0 = free flowing, 1 = typical rush hour). */
const CURVE = [0.05, 0.05, 0.05, 0.05, 0.08, 0.2, 0.55, 1.0, 1.25, 0.95, 0.55, 0.4, 0.4, 0.42, 0.48, 0.65, 0.95, 1.25, 1.35, 1.05, 0.65, 0.4, 0.25, 0.12];

export function congestionAt(minuteOfDay: number) {
  const h = (((minuteOfDay / 60) % 24) + 24) % 24;
  const i = Math.floor(h);
  const k = h - i;
  return CURVE[i] * (1 - k) + CURVE[(i + 1) % 24] * k;
}

export interface Traffic {
  /** 0 off-peak to about 1.35 at the worst of the evening rush. */
  base: number;
  /** Travel time multiplier for driving from a to b. */
  factor(a: Place, b: Place): number;
}

/**
 * Lagos traffic is tidal: towards the Island and VI in the morning, back to
 * the mainland and along Lekki–Epe in the evening.
 */
export function simulatedTraffic(minuteOfDay: number): Traffic {
  const base = congestionAt(minuteOfDay);
  const h = minuteOfDay / 60;
  const am = h >= 6 && h < 11;
  const pm = h >= 15 && h < 21;

  const factor = (a: Place, b: Place) => {
    let dir = 0;
    // Positive with the tide, negative against it
    const tide = (withTide: boolean, up: number, down: number) => (!am && !pm ? 0 : withTide ? up : -down);
    if (a.side !== b.side) {
      dir = tide((am && b.side === 'island') || (pm && b.side === 'mainland'), 0.45, 0.3);
    } else if (a.side === 'island' && (a.lngLat[0] > 3.44 || b.lngLat[0] > 3.44)) {
      const westward = b.lngLat[0] < a.lngLat[0];
      dir = tide((am && westward) || (pm && !westward), 0.35, 0.35);
    } else if (a.side === 'mainland') {
      const southward = b.lngLat[1] < a.lngLat[1];
      dir = tide((am && southward) || (pm && !southward), 0.2, 0.1);
    }
    return 1 + base * (1 + dir);
  };

  return { base, factor };
}

export function trafficLevel(factor: number): { level: TrafficLevel; label: string } {
  const x = factor - 1;
  if (x < 0.35) return { level: 'clear', label: 'Roads are clear' };
  if (x < 0.8) return { level: 'moderate', label: 'Moderate traffic' };
  if (x < 1.5) return { level: 'heavy', label: 'Heavy traffic' };
  return { level: 'gridlock', label: 'Gridlock' };
}
