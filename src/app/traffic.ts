import type { NetworkResponse, TrafficLevel } from '../../shared/types';
import { useApi } from './api';

export const LEVEL: Record<TrafficLevel, { label: string; dot: string }> = {
  clear: { label: 'Clear', dot: '#2E9D68' },
  moderate: { label: 'Slow', dot: '#E9A23B' },
  heavy: { label: 'Heavy', dot: '#E5484D' },
  gridlock: { label: 'Jammed', dot: '#8E1B1B' },
};

export function useNetwork(time: string) {
  const [h, m] = time.split(':').map(Number);
  const at = `${String(h).padStart(2, '0')}:${String(Math.floor(m / 15) * 15).padStart(2, '0')}`;
  return useApi<NetworkResponse>(`/api/network?t=${at}`);
}
