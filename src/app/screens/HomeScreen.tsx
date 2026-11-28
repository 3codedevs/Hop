import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, ArrowUpDown, Briefcase, ChevronDown, ChevronRight, House, Plus } from 'lucide-react';
import type { Prefer } from '../../../shared/types';
import { Link } from '../../components/Link';
import { navigate } from '../../lib/router';
import { usePlaces } from '../api';
import { CorridorCard } from '../Corridors';
import { lagosNow } from '../format';
import { HopMap, type MapPoint } from '../HopMap';
import { MapLayout } from '../MapLayout';
import { DEMO_TRIP, POPULAR_TRIPS, PREFS, isPrefer, planPath } from '../paths';
import { PlacePicker } from '../PlacePicker';
import { useRecent } from '../store';
import { useNetwork } from '../traffic';
import { SoonButton } from '../ui';

const TIMES = [
  { value: '07:30', label: '07:30, morning rush' },
  { value: '08:00', label: '08:00, morning rush' },
  { value: '13:00', label: '13:00, midday' },
  { value: '18:00', label: '18:00, evening rush' },
];

function greeting(t: string) {
  const h = Number(t.slice(0, 2));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function HomeScreen({ params }: { params: URLSearchParams }) {
  const { data: places = [], error } = usePlaces();
  const recent = useRecent();
  const [now] = useState(() => lagosNow());
  const { data: net } = useNetwork(now);
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to, setTo] = useState(params.get('to') ?? '');
  const [time, setTime] = useState(params.get('t') ?? 'now');
  const [prefer, setPrefer] = useState<Prefer>(() => {
    const p = params.get('prefer');
    return isPrefer(p) ? p : 'best';
  });
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);

  const byId = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);
  const fromPlace = byId.get(from);
  const toPlace = byId.get(to);
  const points = useMemo(() => {
    const pts: MapPoint[] = [];
    if (fromPlace) pts.push({ lngLat: fromPlace.lngLat, kind: 'from' });
    if (toPlace) pts.push({ lngLat: toPlace.lngLat, kind: 'to' });
    return pts;
  }, [fromPlace, toPlace]);

  const same = !!from && from === to;
  const canGo = !!fromPlace && !!toPlace && !same;
  const presetTime = time === 'now' || TIMES.some((t) => t.value === time);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (canGo) navigate(planPath({ from, to, t: time === 'now' ? lagosNow() : time, prefer }));
  };

  return (
    <>
      <MapLayout
        initialSnap="half"
        map={(padding) => <HopMap points={points} time={time === 'now' ? undefined : time} padding={padding} />}
        header={
          <div>
            <p className="text-[13px] text-muted">{greeting(now)}, Ada</p>
            <h1 className="font-serif text-[30px] leading-[1.05] font-normal tracking-[-0.015em]">Where to?</h1>
          </div>
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => submit()}
              disabled={!canGo}
              className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-signal text-[16px] font-semibold text-[#0E0F0C] transition-opacity disabled:opacity-40"
            >
              Find the best way
              <ArrowRight className="h-4 w-4" />
            </button>
            {same && <p className="mt-2 text-center text-[13px] text-signal-deep">Pick two different places.</p>}
          </>
        }
      >
        <form onSubmit={submit}>
          <div className="relative rounded-[20px] bg-surface ring-1 ring-line">
            <Field kind="from" label="From" value={fromPlace?.name} placeholder="Choose where you start" onClick={() => setPicking('from')} />
            <div className="mx-5 h-px bg-line" />
            <Field kind="to" label="To" value={toPlace?.name} placeholder="Choose where you’re going" onClick={() => setPicking('to')} />
            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label="Swap start and destination"
              className="absolute top-1/2 right-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper ring-1 ring-line hover:ring-ink/40"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Select label="Leave" value={presetTime ? time : 'custom'} onChange={(v) => setTime(v === 'custom' ? '09:00' : v)}>
              <option value="now">Now, {now}</option>
              {TIMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
              <option value="custom">Pick a time…</option>
            </Select>
            <Select label="Show me" value={prefer} onChange={(v) => setPrefer(v as Prefer)}>
              {PREFS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </div>
          {!presetTime && (
            <label className="mt-2 flex min-h-12 items-center justify-between rounded-2xl bg-surface px-4 ring-1 ring-line">
              <span className="text-[14px] text-muted">Leave at</span>
              <input type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} className="num bg-transparent text-[16px] outline-none" />
            </label>
          )}
          {error && <p className="mt-2 text-[14px] text-signal-deep">{error}</p>}
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <SoonButton feature="Saved places" icon={House} label="Home" />
          <SoonButton feature="Saved places" icon={Briefcase} label="Work" />
          <SoonButton feature="Saved places" icon={Plus} label="Add" variant="ghost" />
        </div>

        <Link to={planPath({ ...DEMO_TRIP, prefer: 'best' })} className="group mt-6 block rounded-[20px] bg-night p-5 text-[#EDEBE6]">
          <span className="text-[13px] text-[#EDEBE6]/60">Try the demo trip</span>
          <span className="mt-1 block font-serif text-[24px] leading-tight">Yaba to Lekki Phase 1</span>
          <span className="mt-1 flex items-center justify-between gap-4 text-[14px] text-[#EDEBE6]/70">
            <span>08:00, the morning rush. See which way wins.</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        {net && (
          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Lagos right now</h2>
              <Link to="/app/map" className="inline-flex min-h-11 items-center text-[13px] text-muted hover:text-ink">Live map</Link>
            </div>
            <div className="-mx-5 mt-1 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:-mx-6 lg:px-6">
              {net.corridors.map((c) => (
                <CorridorCard key={c.id} corridor={c} time={now} className="w-[17.5rem] shrink-0 snap-start" />
              ))}
            </div>
            <p className="text-[12px] text-muted">Traffic is simulated for the demo.</p>
          </section>
        )}

        {recent.length > 0 && (
          <TripList title="Recent" action={{ to: '/app/trips', label: 'See all' }} trips={recent.slice(0, 3)} name={(id) => byId.get(id)?.name} />
        )}
        <TripList title="Popular at rush hour" trips={[...POPULAR_TRIPS]} name={(id) => byId.get(id)?.name} />
      </MapLayout>

      <PlacePicker
        open={picking !== null}
        title={picking === 'to' ? 'Where are you going?' : 'Where are you starting?'}
        places={places}
        value={picking === 'to' ? to : from}
        onPick={(id) => {
          if (picking === 'to') setTo(id);
          else setFrom(id);
          setPicking(null);
        }}
        onClose={() => setPicking(null)}
      />
    </>
  );
}

function TripList({ title, trips, name, action }: { title: string; trips: { from: string; to: string; t: string }[]; name: (id: string) => string | undefined; action?: { to: string; label: string } }) {
  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action && <Link to={action.to} className="inline-flex min-h-11 items-center text-[13px] text-muted hover:text-ink">{action.label}</Link>}
      </div>
      <ul className="mt-1 divide-y divide-line overflow-hidden rounded-[18px] bg-surface ring-1 ring-line">
        {trips.map((trip) => (
          <li key={`${trip.from}-${trip.to}`}>
            <Link to={planPath({ ...trip, prefer: 'best' })} className="flex min-h-14 items-center justify-between gap-4 px-4 py-2 hover:bg-ink/3">
              <span className="text-[15px]">
                {name(trip.from) ?? '…'} <span className="text-muted">to</span> {name(trip.to) ?? '…'}
              </span>
              <span className="flex items-center gap-2 text-[14px] text-muted">
                <span className="num">{trip.t}</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative flex min-h-14 flex-col justify-center rounded-2xl bg-surface px-4 py-2 ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
      <span className="text-[12px] text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none truncate bg-transparent pr-6 text-[15px] font-medium outline-none">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 bottom-3 h-4 w-4 text-muted" aria-hidden="true" />
    </label>
  );
}

function Field({ kind, label, value, placeholder, onClick }: { kind: 'from' | 'to'; label: string; value?: string; placeholder: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-16 w-full items-center gap-4 px-5 pr-18 text-left">
      <span aria-hidden="true" className={kind === 'from' ? 'h-3 w-3 shrink-0 rounded-full border-[3px] border-ink' : 'h-3 w-3 shrink-0 rounded-full bg-signal'} />
      <span className="min-w-0">
        <span className="block text-[12px] text-muted">{label}</span>
        <span className={`block truncate text-[17px] ${value ? 'font-medium' : 'text-muted'}`}>{value ?? placeholder}</span>
      </span>
    </button>
  );
}
