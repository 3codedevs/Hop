import { Bike, Bus, Car, Footprints, Navigation, TrainFront } from 'lucide-react';
import type { TravelMode } from '../../shared/types';

export const EASE = [0.16, 1, 0.3, 1] as const;

/** `color` tints icons on dark chips; `line` draws the mode on Hop's paper map. */
export const MODE_META: Record<TravelMode, { label: string; icon: typeof Bus; color: string; line: string }> = {
  brt: { label: 'BRT', icon: Bus, color: '#FF5A1F', line: '#FF5A1F' },
  rail: { label: 'Train', icon: TrainFront, color: '#7AA7FF', line: '#D7263D' },
  danfo: { label: 'Danfo', icon: Bus, color: '#E9B23B', line: '#C98A0B' },
  keke: { label: 'Keke', icon: Bike, color: '#2FBF83', line: '#16A06A' },
  ride: { label: 'Ride-hail', icon: Navigation, color: '#EDEBE6', line: '#0E0F0C' },
  rental: { label: 'Self-drive', icon: Car, color: '#EDEBE6', line: '#0E0F0C' },
  walk: { label: 'Walk', icon: Footprints, color: '#A9A79F', line: '#6B6B65' },
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
