import type { Money } from '../../shared/types';

const nf = new Intl.NumberFormat('en-NG');

export const naira = (n: number) => `₦${nf.format(Math.round(n))}`;

export function money(m: Money | null) {
  if (!m || m.max === 0) return 'Free';
  return m.min === m.max ? naira(m.min) : `${naira(m.min)}–${nf.format(m.max)}`;
}

export function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function lagosNow() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}
