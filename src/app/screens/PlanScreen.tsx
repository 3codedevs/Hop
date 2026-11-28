import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, Clock, Flag, Navigation, Share2 } from 'lucide-react';
import type { Leg, Money, PlanResponse, TrafficLevel, TripOption } from '../../../shared/types';
import { Link } from '../../components/Link';
import { navigate } from '../../lib/router';
import { EASE, MODE_META } from '../../lib/ui';
import { usePlan, type TripQuery } from '../api';
import { duration, lagosNow, money, naira } from '../format';
import { HopMap, type MapPoint } from '../HopMap';
import { MapLayout } from '../MapLayout';
import { PREFS, homePath, isPrefer, planPath } from '../paths';
import { rememberTrip, toast } from '../store';
import { SoonButton } from '../ui';

const TRAFFIC_TONE: Record<TrafficLevel, string> = {
  clear: 'bg-go/15 text-go',
  moderate: 'bg-[#E9A23B]/18 text-[#B7791F]',
  heavy: 'bg-signal/15 text-signal-deep',
  gridlock: 'bg-[#C93C0A] text-white',
};
const TAG_LABEL = { best: 'Hop’s pick', cheapest: 'Cheapest', fastest: 'Fastest' } as const;
const mid = (m: Money) => (m.min + m.max) / 2;

/** What this option saves over a ride-hail, rounded, when it's worth mentioning. */
function savingVsRide(o: TripOption, plan: PlanResponse) {
  const ride = plan.options.find((x) => x.mode === 'ride');
  if (!ride || o.mode === 'ride' || o.mode === 'rental') return 0;
  const s = Math.round((mid(ride.cost) - mid(o.cost)) / 100) * 100;
  return s >= 500 ? s : 0;
}

export function PlanScreen({ params }: { params: URLSearchParams }) {
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const t = params.get('t');
  const p = params.get('prefer');
  const prefer = isPrefer(p) ? p : 'best';
  const optId = params.get('opt');

  // Pin the leave time in the URL so the page can be shared and reloaded
  useEffect(() => {
    if (!t) navigate(planPath({ from, to, t: lagosNow(), prefer }), { replace: true });
  }, [t, from, to, prefer]);

  const query = useMemo<TripQuery | null>(() => (t ? { from, to, t, prefer } : null), [from, to, t, prefer]);
  const { data, error, loading } = usePlan(query);

  useEffect(() => {
    if (data && t) rememberTrip({ from, to, t });
  }, [data, from, to, t]);

  const selected = data?.options.find((o) => o.id === optId) ?? null;
  const shown = selected ?? data?.options[0];
  const points = useMemo<MapPoint[]>(() => (data ? [{ lngLat: data.from.lngLat, kind: 'from' }, { lngLat: data.to.lngLat, kind: 'to' }] : []), [data]);
  const listPath = planPath({ from, to, t: t ?? undefined, prefer });

  return (
    <MapLayout
      initialSnap="half"
      resetKey={optId ?? 'list'}
      map={(padding) => <HopMap legs={shown?.legs} points={points} time={t ?? undefined} padding={padding} />}
      header={
        <div className="flex items-start gap-2">
          <Link
            to={selected ? listPath : homePath({ from, to, t: t ?? undefined, prefer })}
            aria-label={selected ? 'All options' : 'Change trip'}
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-ink/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          {data ? (
            <div className="min-w-0 pt-1">
              <h1 className="truncate font-serif text-[22px] leading-tight font-normal">
                {data.from.name} <span className="text-muted italic">to</span> {data.to.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
                <span className="num rounded-full bg-ink/6 px-2.5 py-1">Leave {data.departAt}</span>
                <span className="num rounded-full bg-ink/6 px-2.5 py-1">{data.distanceKm} km</span>
                <span className={`rounded-full px-2.5 py-1 font-medium ${TRAFFIC_TONE[data.traffic.level]}`}>{data.traffic.label}</span>
              </div>
            </div>
          ) : (
            <div className="h-14 flex-1 animate-pulse rounded-xl bg-ink/6" />
          )}
        </div>
      }
      footer={selected && data ? <TripActions plan={data} /> : undefined}
    >
      {error && <ErrorState message={error} />}
      {loading && <Skeleton />}
      {data && (selected ? <TripDetails plan={data} option={selected} /> : <Options plan={data} query={{ from, to, t: t!, prefer }} />)}
    </MapLayout>
  );
}

function Options({ plan, query }: { plan: PlanResponse; query: TripQuery }) {
  const reduce = useReducedMotion();
  const [pick, ...rest] = plan.options;
  const saving = savingVsRide(pick, plan);
  return (
    <div>
      <Link to={planPath({ ...query, opt: pick.id })} className="group block rounded-[22px] bg-night p-5 text-[#EDEBE6]" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#EDEBE6]/60">{query.prefer === 'best' ? 'Hop’s pick' : `${PREFS.find((x) => x.id === query.prefer)?.label} way`}</span>
          {saving > 0 && <span className="rounded-full bg-[#3CC08A]/20 px-2.5 py-1 text-[12px] font-medium text-[#6EE0AE]">Saves {naira(saving)} over a ride</span>}
        </div>
        <div className="mt-1 font-serif text-[24px] leading-tight">{plan.headline}</div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="num text-[28px] leading-none font-light tracking-[-0.02em] whitespace-nowrap">{duration(pick.minutes)}</span>
          <span className="num text-[16px] whitespace-nowrap text-[#EDEBE6]/80">{money(pick.cost)}</span>
          <span className="num ml-auto text-[13px] whitespace-nowrap text-[#EDEBE6]/60">Arrive {pick.arriveAt}</span>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-[#EDEBE6]/75">{plan.reason}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#FF8A5B]">
          See the steps <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-2 ring-1 ring-line">
        <span className="flex items-center gap-2 text-[14px]">
          <Clock className="h-4 w-4 shrink-0 text-signal-deep" aria-hidden="true" /> Would leaving earlier save time?
        </span>
        <SoonButton feature="Best time to leave" label="Check" variant="ghost" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1" role="group" aria-label="Rank options by">
        {PREFS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={query.prefer === p.id}
            onClick={() => navigate(planPath({ ...query, prefer: p.id }), { replace: true })}
            className={`min-h-11 rounded-full text-[14px] transition-colors ${query.prefer === p.id ? 'bg-surface font-medium shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <h2 className="mt-5 text-[15px] font-semibold">Other ways</h2>
      <ol className="mt-2 space-y-2">
        {rest.map((o, i) => (
          <motion.li key={o.id} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}>
            <OptionRow option={o} to={planPath({ ...query, opt: o.id })} saving={savingVsRide(o, plan)} />
          </motion.li>
        ))}
      </ol>

      <p className="mt-5 text-[12px] leading-relaxed text-muted">
        Fares are estimates. Lagos has no published BRT or danfo timetable, so times come from typical traffic for the hour you leave. Traffic is simulated for the demo.
      </p>
    </div>
  );
}

function ModeStrip({ legs }: { legs: Leg[] }) {
  const modes = legs.filter((l) => l.mode !== 'walk' || legs.length === 1).filter((l, i, arr) => i === 0 || arr[i - 1].mode !== l.mode);
  return (
    <span className="flex flex-wrap items-center gap-1">
      {modes.map((l, i) => {
        const meta = MODE_META[l.mode];
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted" aria-hidden="true" />}
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#0E0F0C] px-2.5 text-[12px] font-medium text-[#EDEBE6] ring-1 ring-white/10">
              <meta.icon className="h-3.5 w-3.5" style={{ color: l.mode === 'rail' && l.color ? '#FFFFFF' : meta.color }} aria-hidden="true" />
              {l.mode === 'rail' && l.instruction.includes('Line') ? l.instruction.split(' train')[0] : meta.label}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function OptionRow({ option, to, saving }: { option: TripOption; to: string; saving: number }) {
  const tags = option.tags.filter((t) => t !== 'best');
  return (
    <Link to={to} className="flex items-center gap-3 rounded-[18px] bg-surface p-4 ring-1 ring-line transition-shadow hover:ring-ink/40">
      <div className="min-w-0 flex-1">
        <ModeStrip legs={option.legs} />
        <div className="mt-2 text-[13px] text-muted">
          <span className="num">Arrive {option.arriveAt}</span>
          {tags.map((t) => (
            <span key={t} className="ml-2 font-medium text-ink">{TAG_LABEL[t]}</span>
          ))}
          {saving > 0 && <span className="ml-2 text-go">Saves {naira(saving)}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="num text-[19px] font-medium tracking-[-0.01em]">{duration(option.minutes)}</div>
        <div className="num text-[13px] text-muted">{money(option.cost)}</div>
      </div>
    </Link>
  );
}

function TripDetails({ plan, option }: { plan: PlanResponse; option: TripOption }) {
  const saving = savingVsRide(option, plan);
  return (
    <div>
      <ModeStrip legs={option.legs} />
      <div className="mt-4 grid grid-cols-[1fr_1.4fr_auto] gap-3">
        <Figure label="Time" value={duration(option.minutes)} />
        <Figure label="Cost" value={money(option.cost)} />
        <Figure label="Arrive" value={option.arriveAt} />
      </div>
      <p className="mt-3 text-[14px] text-ink/75">
        {option.note}
        {saving > 0 && <span className="text-go"> Saves about {naira(saving)} over a ride.</span>}
      </p>

      <h2 className="mt-6 text-[15px] font-semibold">Step by step</h2>
      <ol className="mt-2">
        <Stop label={`Leave ${plan.from.name}`} time={plan.departAt} kind="from" />
        {option.legs.map((leg, i) => (
          <LegRow key={i} leg={leg} />
        ))}
        <Stop label={`Arrive at ${plan.to.name}`} time={option.arriveAt} kind="to" />
      </ol>

      <SoonButton feature="Reporting a problem on this route" label="Report a jam, flood or missing bus" icon={Flag} variant="ghost" className="mt-3 -ml-3" />
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        Fares are estimates and can change with fuel prices and demand. Ask the conductor before you board a danfo.
      </p>
    </div>
  );
}

function TripActions({ plan }: { plan: PlanResponse }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
      <SoonButton feature="Live trips with rerouting" label="Start trip" icon={Navigation} variant="accent" />
      <button type="button" onClick={() => share(plan)} aria-label="Share this trip" className="grid h-13 w-13 place-items-center rounded-full bg-surface ring-1 ring-line hover:ring-ink/40">
        <Share2 className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => toast('Saved routes are coming soon.')} aria-label="Save this route" className="grid h-13 w-13 place-items-center rounded-full bg-surface ring-1 ring-line hover:ring-ink/40">
        <Bookmark className="h-5 w-5" />
      </button>
    </div>
  );
}

async function share(plan: PlanResponse) {
  const url = window.location.href;
  const text = `${plan.from.name} to ${plan.to.name}, leaving ${plan.departAt}: ${plan.headline}`;
  try {
    if (navigator.share) await navigator.share({ title: 'My trip on Hop', text, url });
    else {
      await navigator.clipboard.writeText(url);
      toast('Trip link copied.');
    }
  } catch {
    /* share sheet dismissed */
  }
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-muted">{label}</div>
      <div className="num mt-0.5 text-[16px] font-medium whitespace-nowrap sm:text-[17px]">{value}</div>
    </div>
  );
}

function Stop({ label, time, kind }: { label: string; time: string; kind: 'from' | 'to' }) {
  return (
    <li className="grid grid-cols-[32px_1fr_auto] items-center gap-3 py-1">
      <span className="grid place-items-center" aria-hidden="true">
        <span className={kind === 'from' ? 'h-3.5 w-3.5 rounded-full border-[3px] border-ink' : 'h-3.5 w-3.5 rounded-full bg-signal'} />
      </span>
      <span className="text-[15px] font-medium">{label}</span>
      <span className="num text-[14px] text-muted">{time}</span>
    </li>
  );
}

function LegRow({ leg }: { leg: Leg }) {
  const meta = MODE_META[leg.mode];
  const dashed = leg.mode === 'walk';
  const line = leg.color ?? (leg.mode === 'ride' || leg.mode === 'rental' ? 'var(--color-ink)' : meta.line);
  return (
    <li className="grid grid-cols-[32px_1fr_auto] gap-3">
      <span className="relative flex justify-center" aria-hidden="true">
        <span
          className="absolute inset-y-0 w-[3px] rounded-full"
          style={dashed ? { backgroundImage: 'linear-gradient(#A9A79F 50%, transparent 50%)', backgroundSize: '3px 8px' } : { background: line }}
        />
        <span className="relative mt-4 grid h-8 w-8 place-items-center rounded-full bg-[#0E0F0C] ring-2 ring-paper">
          <meta.icon className="h-4 w-4" style={{ color: meta.color }} />
        </span>
      </span>
      <div className="py-4">
        <div className="text-[15px] font-medium">{leg.instruction}</div>
        {leg.detail && <div className="mt-0.5 text-[13px] leading-snug text-muted">{leg.detail}</div>}
      </div>
      <div className="py-4 text-right">
        <div className="num text-[14px]">{duration(leg.minutes)}</div>
        {leg.cost && <div className="num mt-0.5 text-[13px] text-muted">{money(leg.cost)}</div>}
      </div>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Finding the best way…">
      <div className="h-44 rounded-[22px] bg-ink/10" />
      <div className="h-12 rounded-2xl bg-ink/6" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-[18px] bg-ink/6" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] bg-surface p-5 ring-1 ring-line">
      <p className="text-[15px]">{message}</p>
      <Link to="/app" className="mt-3 inline-flex min-h-11 items-center text-[14px] font-medium text-signal-deep">
        Plan another trip
      </Link>
    </div>
  );
}
