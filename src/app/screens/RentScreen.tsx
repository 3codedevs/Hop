import { useState } from 'react';
import { CarFront, Plus, ShieldCheck, Star, UserRound } from 'lucide-react';
import { Link } from '../../components/Link';
import { navigate } from '../../lib/router';
import { useCars } from '../api';
import { CarPhoto } from '../cars';
import { naira } from '../format';
import { PageTitle, SoonButton } from '../ui';

const KINDS = ['All', 'Sedan', 'SUV', 'Hatchback', 'Bus'] as const;

export function RentScreen({ params }: { params: URLSearchParams }) {
  const { data, error, loading } = useCars();
  const withDriver = params.get('driver') === '1';
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All');
  const [autoOnly, setAutoOnly] = useState(false);

  const setDriver = (on: boolean) => navigate(on ? '/app/rent?driver=1' : '/app/rent', { replace: true });
  const cars = (data?.cars ?? [])
    .filter((c) => withDriver || !c.driverOnly)
    .filter((c) => kind === 'All' || c.kind === kind)
    .filter((c) => !autoOnly || c.transmission === 'Automatic')
    .sort((a, b) => a.pricePerDay - b.pricePerDay);

  return (
    <div className="shell py-7 lg:py-10">
      <PageTitle kicker="Self-drive and chauffeur" title="Rent a car">
        For a day of errands, a car often beats paying for four separate rides. Every car is verified and insured.
      </PageTitle>

      <div className="mt-6 grid max-w-md grid-cols-2 gap-1 rounded-full bg-ink/5 p-1" role="group" aria-label="How you want to travel">
        {[
          { on: false, label: 'Drive myself', icon: CarFront },
          { on: true, label: 'With a driver', icon: UserRound },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={withDriver === o.on}
            onClick={() => setDriver(o.on)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[14px] ${withDriver === o.on ? 'bg-surface font-medium shadow-sm' : 'text-muted'}`}
          >
            <o.icon className="h-4 w-4" aria-hidden="true" />
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex max-w-2xl items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-[14px]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-go" aria-hidden="true" />
        {withDriver ? (
          <p className="text-ink/80">No licence needed. Drivers are vetted, rated after every trip, and know Lagos traffic.</p>
        ) : (
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <p className="text-ink/80">Self-drive needs a verified ID and driver’s licence. The check takes about a minute.</p>
            <SoonButton feature="Instant ID and licence checks" label="Verify now" />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`min-h-11 rounded-full border px-4 text-[14px] ${kind === k ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink/40'}`}
          >
            {k}
          </button>
        ))}
        <label className="ml-1 inline-flex min-h-11 cursor-pointer items-center gap-2 px-2 text-[14px]">
          <input type="checkbox" checked={autoOnly} onChange={(e) => setAutoOnly(e.target.checked)} className="h-4 w-4 accent-[#0E0F0C]" />
          Automatic only
        </label>
      </div>

      {error && <p className="mt-6 text-signal-deep">{error}</p>}
      {loading && <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-[22px] bg-ink/6" />)}</div>}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <li key={car.id}>
            <Link to={`/app/rent/car?id=${car.id}${withDriver ? '&driver=1' : ''}`} className="group block overflow-hidden rounded-[22px] bg-surface ring-1 ring-line transition-shadow hover:ring-ink/40">
              <div className="relative aspect-[16/10] overflow-hidden">
                <CarPhoto car={car} className="transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute top-3 left-3 flex gap-1.5">
                  <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[12px] font-medium">{car.source}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-[12px] font-medium text-go">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Insured
                  </span>
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{car.name}</h2>
                  <span className="num text-[13px] text-muted">{car.year}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                  <Star className="h-3.5 w-3.5 fill-current text-[#E9A23B]" aria-hidden="true" />
                  <span className="num text-ink">{car.rating.toFixed(1)}</span>
                  <span>· {car.trips} trips · {car.area}</span>
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                  <span className="text-[13px] text-muted">
                    {car.seats} seats · {car.transmission}
                    {car.driverOnly && ' · Driver only'}
                  </span>
                  <span className="text-right">
                    <span className="num block text-[18px] font-semibold">{naira(car.pricePerDay + (withDriver ? car.driverPerDay : 0))}</span>
                    <span className="block text-[12px] text-muted">a day{withDriver ? ' with driver' : ''}</span>
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {data && cars.length === 0 && <p className="mt-6 text-[15px] text-muted">No cars match those filters.</p>}

      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[22px] bg-night p-6 text-chalk sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="font-serif text-[26px] leading-tight">Own a car? Earn from its idle days.</div>
          <p className="mt-1 text-[14px] text-chalk/65">List it next to partner fleets. You set the price and the days.</p>
        </div>
        <SoonButton feature="Listing your car" label="List my car" icon={Plus} variant="accent" />
      </div>
    </div>
  );
}
