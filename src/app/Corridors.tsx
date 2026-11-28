import { ArrowRight } from 'lucide-react';
import type { Corridor } from '../../shared/types';
import { Link } from '../components/Link';
import { duration } from './format';
import { planPath } from './paths';
import { LEVEL } from './traffic';

/** One road, both directions, with a tap-through to plan that exact trip. */
export function CorridorCard({ corridor, time, className = '' }: { corridor: Corridor; time: string; className?: string }) {
  return (
    <div className={`rounded-[18px] bg-surface p-4 ring-1 ring-line ${className}`}>
      <div className="text-[14px] font-semibold tracking-[-0.01em]">{corridor.name}</div>
      <ul className="mt-2 space-y-1">
        {corridor.ways.map((w) => (
          <li key={w.toId}>
            <Link
              to={planPath({ from: w.fromId, to: w.toId, t: time, prefer: 'best' })}
              className="group flex min-h-10 items-center justify-between gap-3 rounded-lg text-[13px]"
              aria-label={`Plan ${corridor.name} toward ${w.toward}: ${LEVEL[w.level].label}, about ${w.minutes} minutes`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: LEVEL[w.level].dot }} aria-hidden="true" />
                <span className="truncate">To {w.toward}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-muted">
                <span>{LEVEL[w.level].label}</span>
                <span className="num text-ink">{duration(w.minutes)}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
