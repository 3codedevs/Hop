import { Bus, Car, Footprints, Navigation } from 'lucide-react';
import type { TravelMode } from '../data/hopData';

export const EASE = [0.16, 1, 0.3, 1] as const;

export const MODE_META: Record<TravelMode, { label: string; icon: typeof Bus }> = {
  brt: { label: 'BRT', icon: Bus },
  danfo: { label: 'Danfo', icon: Bus },
  ride: { label: 'Ride-hail', icon: Navigation },
  rental: { label: 'Self-drive', icon: Car },
  walk: { label: 'Walk', icon: Footprints },
};

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Colours for corridor hub status on the map and readout. */
export const HUB_STATUS = {
  clear: { label: 'Moving', color: '#2FBF83' },
  busy: { label: 'Slow', color: '#E9A23B' },
  alert: { label: 'Alert', color: '#FF5A1F' },
} as const;

/**
 * Responsive sources for a photo in /public/img. Each `name.jpg` has WebP
 * siblings `name-800.webp`, `name-1400.webp` (and `-2200` for full-bleed ones).
 */
export function srcSet(path: string, widths: number[] = [800, 1400]) {
  const base = path.replace(/\.jpg$/, '');
  return widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ');
}
