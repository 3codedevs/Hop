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
