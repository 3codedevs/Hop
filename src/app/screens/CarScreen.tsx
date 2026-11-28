import { useState } from 'react';
import { Armchair, Bookmark, CarFront, ChevronLeft, Fuel, Gauge, MapPin, MessageCircle, Minus, Plus, ShieldCheck, Star, UserRound } from 'lucide-react';
import { Link } from '../../components/Link';
import { navigate } from '../../lib/router';
import { useCars } from '../api';
import { CarPhoto } from '../cars';
import { naira } from '../format';
import { SoonButton } from '../ui';

const POLICIES = [
  'Fuel is full to full: you get a full tank and return it full.',
  'Your deposit is refunded within 48 hours of a clean return.',
  'You and the owner log photos at pickup and return.',
  'Comprehensive insurance is included on every booking.',
];

export function CarScreen({ id, params }: { id: string; params: URLSearchParams }) {
  const { data, loading } = useCars();
  const car = data?.cars.find((c) => c.id === id);
  const wantsDriver = params.get('driver') === '1';
  const [days, setDays] = useState(1);
  const [kmPerDay, setKmPerDay] = useState(60);

  if (loading) return <div className="shell py-10"><div className="h-96 animate-pulse rounded-[22px] bg-ink/6" /></div>;
  if (!car || !data) {
    return (
      <div className="shell py-10">
        <p className="text-[15px]">We couldn’t find that car.</p>
        <Link to="/app/rent" className="mt-3 inline-flex min-h-11 items-center font-medium text-signal-deep">See all cars</Link>
      </div>
    );
  }

  const withDriver = wantsDriver || !!car.driverOnly;
  const setDriver = (on: boolean) => navigate(`/app/rent/car?id=${car.id}${on ? '&driver=1' : ''}`, { replace: true });
  const rental = car.pricePerDay * days;
  const driver = withDriver ? car.driverPerDay * days : 0;
  const fuel = ((kmPerDay * days * car.litresPer100km) / 100) * data.petrolPerLitre;
  const dueNow = rental + driver + car.deposit;

  return (
    <div className="shell pt-6 pb-28 lg:py-10">
      <Link to={`/app/rent${wantsDriver ? '?driver=1' : ''}`} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full pr-3 pl-1 text-[14px] text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> All cars
      </Link>

      <div className="mt-3 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-[24px] ring-1 ring-line">
            <CarPhoto car={car} />
          </div>
          {car.photoCredit && <p className="mt-2 text-[12px] text-muted">Photo: {car.photoCredit}</p>}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="caption text-muted">{car.source} · {car.owner}</p>
              <h1 className="mt-1 font-serif text-[36px] leading-[1.05] font-normal tracking-[-0.015em]">
                {car.name} <span className="num text-muted">{car.year}</span>
              </h1>
              <div className="mt-2 flex items-center gap-1.5 text-[14px] text-muted">
                <Star className="h-4 w-4 fill-current text-[#E9A23B]" aria-hidden="true" />
                <span className="num text-ink">{car.rating.toFixed(1)}</span> · {car.trips} trips
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-go/12 px-3 py-1 font-medium text-go">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified {car.source === 'Partner fleet' ? 'fleet' : 'owner'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-go/12 px-3 py-1 font-medium text-go">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Insurance included
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <SoonButton feature="Saving cars" label="Save" icon={Bookmark} />
              <SoonButton feature="Messaging owners" label="Message" icon={MessageCircle} />
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Armchair, label: `${car.seats} seats` },
              { icon: Gauge, label: car.transmission },
              { icon: Fuel, label: `${car.litresPer100km} L/100 km` },
              { icon: CarFront, label: car.kind },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-[14px] ring-1 ring-line">
                <s.icon className="h-4 w-4 text-muted" aria-hidden="true" /> {s.label}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 caption text-muted">Features</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {car.features.map((f) => (
              <li key={f} className="rounded-full border border-line px-3 py-1.5 text-[14px]">{f}</li>
            ))}
          </ul>

          <h2 className="mt-8 caption text-muted">Pickup</h2>
          <p className="mt-2 flex items-center gap-2 text-[15px]">
            <MapPin className="h-4 w-4 text-signal-deep" aria-hidden="true" /> {car.area}. The exact address is shared after you book.
          </p>

          <h2 className="mt-8 caption text-muted">How renting works</h2>
          <ul className="mt-2 space-y-2">
            {POLICIES.map((p) => (
              <li key={p} className="flex gap-2 text-[15px] text-ink/80">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-go" aria-hidden="true" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[24px] bg-surface p-5 shadow-[0_1px_2px_rgb(14_15_12/0.05),0_24px_48px_-30px_rgb(14_15_12/0.4)] ring-1 ring-line sm:p-6">
            {!car.driverOnly && (
              <div className="grid grid-cols-2 gap-1 rounded-full bg-ink/5 p-1" role="group" aria-label="Driver">
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
                    <o.icon className="h-4 w-4" aria-hidden="true" /> {o.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[15px]">Days</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setDays((d) => Math.max(1, d - 1))} aria-label="One day fewer" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line hover:ring-ink/40">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="num w-10 text-center text-[18px] font-medium" aria-live="polite">{days}</span>
                <button type="button" onClick={() => setDays((d) => Math.min(14, d + 1))} aria-label="One day more" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line hover:ring-ink/40">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[15px]">
                <label htmlFor="km">Driving a day</label>
                <span className="num text-muted">{kmPerDay} km</span>
              </div>
              <input id="km" type="range" min={20} max={200} step={10} value={kmPerDay} onChange={(e) => setKmPerDay(Number(e.target.value))} className="hop-range hop-range-light mt-2 w-full" />
            </div>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[15px]">
              <Row label={`Car · ${days} day${days > 1 ? 's' : ''}`} value={naira(rental)} />
              {withDriver && <Row label={`Driver · ${days} day${days > 1 ? 's' : ''}`} value={naira(driver)} />}
              <Row label="Refundable deposit" value={naira(car.deposit)} />
              <Row label="Due when you book" value={naira(dueNow)} strong />
            </dl>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-paper p-3 text-[13px] text-ink/75">
              <Fuel className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Fuel is on you, paid at the pump: about <span className="num font-medium text-ink">{naira(fuel)}</span> for {kmPerDay * days} km at {naira(data.petrolPerLitre)} a litre.
              </span>
            </div>

            <SoonButton feature="Booking and payment" label="Request booking" variant="accent" className="mt-5 w-full" />
            {!withDriver && <p className="mt-3 text-center text-[13px] text-muted">You’ll verify your ID and licence before pickup.</p>}
          </div>
        </aside>
      </div>

      {/* Phones: price and booking stay in thumb reach */}
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 border-t border-line bg-paper/96 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <div className="num text-[18px] font-semibold">{naira(dueNow)}</div>
          <div className="text-[12px] text-muted">due when you book · deposit refunded</div>
        </div>
        <SoonButton feature="Booking and payment" label="Book" variant="accent" className="h-12 px-5" />
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'border-t border-line pt-2 font-semibold' : ''}`}>
      <dt className={strong ? '' : 'text-muted'}>{label}</dt>
      <dd className="num">{value}</dd>
    </div>
  );
}
