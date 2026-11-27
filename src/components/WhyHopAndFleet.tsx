import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Star, X } from 'lucide-react';
import { RENTAL_FLEET, WHY_HOP, type RentalCar } from '../data/hopData';
import { Reveal, RevealWords, ScrollFillText } from './motion/TextFx';
import { EASE, srcSet } from '../lib/ui';
import { Kicker } from './Kicker';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function WhyHopAndFleet() {
  const [trips, setTrips] = useState(4);
  const [car, setCar] = useState<RentalCar | null>(null);
  const [step, setStep] = useState<'details' | 'confirmed'>('details');

  const rideHail = trips * 6000;
  const rental = 18000;
  const diff = rideHail - rental;

  const open = (c: RentalCar) => {
    setCar(c);
    setStep('details');
  };

  const featured = RENTAL_FLEET.filter((c) => c.image);
  const others = RENTAL_FLEET.filter((c) => !c.image);

  return (
    <>
      {/* Why Hop */}
      <section id="why" className="border-t border-line py-20 md:py-36">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Kicker n={4}>Why Hop</Kicker>
              <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.02em]">
                <RevealWords text="Built for how Lagos *actually moves.*" />
              </h2>
              <Reveal delay={0.1}>
                <figure className="mt-10 hidden lg:block">
                  <img
                    src="/img/danfo-park.jpg"
                    srcSet={srcSet('/img/danfo-park.jpg')}
                    sizes="40vw"
                    alt="A row of yellow danfo minibuses parked at a Lagos bus stop"
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-[22px] object-cover"
                  />
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[13px] text-muted">
                    <span className="font-serif text-[15px] italic text-ink/75">Danfos lined up at a bus stop.</span>
                    <span className="shrink-0">Photo: Dami Akinbode</span>
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>

          <ol className="border-t border-line lg:col-span-7">
            {WHY_HOP.map((item, i) => (
              <Reveal
                key={item.num}
                as="li"
                delay={i * 0.04}
                className="group grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-8 sm:grid-cols-[4rem_1fr] md:py-10"
              >
                  <span className="pt-1 font-serif text-[22px] italic text-muted transition-colors duration-300 group-hover:text-signal-deep">
                    {item.num}
                  </span>
                  <div>
                    <div className="caption text-muted">{item.label}</div>
                    <h3 className="mt-2 font-serif text-[clamp(1.75rem,2.6vw,2.4rem)] leading-[1.1] font-normal tracking-[-0.015em] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-1.5">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">{item.body}</p>
                  </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Self-drive */}
      <section id="fleet" className="scroll-mt-16 border-t border-line py-20 md:py-36">
        <div className="shell">
          <Kicker n={5}>Self-drive</Kicker>
          <ScrollFillText
            className="mt-6 max-w-5xl font-serif text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.15] font-normal tracking-[-0.015em]"
            text="A day of errands across Yaba, VI and Lekki can mean four ride-hails. Past a certain number of trips, one verified car for the day costs less. Hop does that sum for you."
          />

          {/* Calculator */}
          <Reveal className="mt-14">
            <div className="grid overflow-hidden rounded-[22px] bg-night text-chalk lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-5">
                <label htmlFor="trips" className="caption text-chalk/60">
                  Ride-hail trips today
                </label>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-[5rem] leading-none font-light tracking-[-0.03em]">{trips}</span>
                  <span className="text-chalk/50">{trips === 1 ? 'trip' : 'trips'}</span>
                </div>
                <input
                  id="trips"
                  type="range"
                  min={1}
                  max={6}
                  value={trips}
                  onChange={(e) => setTrips(Number(e.target.value))}
                  className="hop-range mt-8 w-full"
                />
                <div className="num mt-2 flex justify-between text-[12px] text-chalk/45">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
              <dl className="grid grid-cols-2 border-t border-white/10 lg:col-span-7 lg:border-t-0 lg:border-l">
                <div className="p-6 sm:p-10">
                  <dt className="caption text-chalk/50">Ride-hailing</dt>
                  <dd className="num mt-3 text-[clamp(1.5rem,3vw,2.5rem)] tracking-[-0.02em]">{naira(rideHail)}</dd>
                </div>
                <div className="border-l border-white/10 p-6 sm:p-10">
                  <dt className="caption text-chalk/50">Self-drive, 1 day</dt>
                  <dd className="num mt-3 text-[clamp(1.5rem,3vw,2.5rem)] tracking-[-0.02em]">{naira(rental)}</dd>
                </div>
                <div className="col-span-2 border-t border-white/10 p-6 sm:px-10">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={diff > 0 ? 'rent' : 'ride'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="text-[17px]"
                    >
                      {diff > 0 ? (
                        <>
                          Renting saves you <span className="num text-[#5BD6A3]">{naira(diff)}</span> today.
                        </>
                      ) : (
                        <span className="text-chalk/70">Ride-hailing is still cheaper today. Hop will say so.</span>
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </dl>
            </div>
          </Reveal>

          {/* Featured cars with photos */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {featured.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <article className="group overflow-hidden rounded-[22px] border border-line bg-surface">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={c.image}
                      srcSet={srcSet(c.image!)}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      alt={`${c.name}, available to rent`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-[12px] font-medium backdrop-blur">
                      {c.tag}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 p-6">
                    <div>
                      <h3 className="text-[22px] font-medium tracking-[-0.015em]">
                        {c.name} <span className="num text-[13px] text-muted">{c.year}</span>
                      </h3>
                      <p className="mt-1 text-[13px] text-muted">
                        {c.source} · {c.location} ·{' '}
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {c.rating}
                        </span>{' '}
                        · {c.trips} trips
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="num text-[18px]">{naira(c.pricePerDay)}</div>
                      <div className="text-[12px] text-muted">per day</div>
                    </div>
                  </div>
                  <div className="border-t border-line px-6 py-4">
                    <button
                      type="button"
                      onClick={() => open(c)}
                      className="group/b inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold"
                    >
                      Book this car
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/b:translate-x-0.5" />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Remaining cars as rows */}
          <ul className="mt-10 border-t border-line">
            {others.map((c, i) => (
              <li key={c.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 sm:grid-cols-[3rem_1.4fr_1fr_auto_auto]">
                <span className="num text-[12px] text-muted">0{i + featured.length + 1}</span>
                <div>
                  <div className="text-[17px] font-medium tracking-[-0.02em]">
                    {c.name} <span className="num text-[12px] text-muted">{c.year}</span>
                  </div>
                  <div className="text-[13px] text-muted sm:hidden">
                    {c.location} · {naira(c.pricePerDay)}/day
                  </div>
                </div>
                <div className="hidden text-[13px] text-muted sm:block">
                  {c.source} · {c.location}
                </div>
                <div className="num hidden text-[14px] sm:block">{naira(c.pricePerDay)}/day</div>
                <button
                  type="button"
                  onClick={() => open(c)}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[13px] font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Book
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Booking modal (Paystack test mode) */}
      <AnimatePresence>
        {car && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
            onClick={() => setCar(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full max-w-md overflow-hidden rounded-[22px] bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {car.image && <img src={car.image} srcSet={srcSet(car.image)} sizes="448px" alt="" className="h-40 w-full object-cover" />}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="caption text-muted">Paystack · test mode</span>
                  <button
                    type="button"
                    onClick={() => setCar(null)}
                    aria-label="Close"
                    className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {step === 'details' ? (
                  <>
                    <h3 id="booking-title" className="mt-3 font-serif text-[28px] font-normal tracking-[-0.01em]">
                      {car.name} <span className="num text-[14px] text-muted">{car.year}</span>
                    </h3>
                    <p className="mt-1 text-[13px] text-muted">
                      {car.ownerName} · {car.location}
                    </p>
                    <dl className="mt-6 divide-y divide-line border-y border-line text-[14px]">
                      <div className="flex justify-between py-3">
                        <dt className="text-muted">1-day self-drive rate</dt>
                        <dd className="num">{naira(car.pricePerDay)}</dd>
                      </div>
                      <div className="flex justify-between py-3">
                        <dt className="text-muted">Refundable security deposit</dt>
                        <dd className="num">{naira(car.deposit)}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 flex items-start gap-2 text-[13px] text-muted">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-go" />
                      ID and driver’s licence are checked before pickup. Both sides log photos at pickup and return.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('confirmed')}
                      className="mt-6 h-12 w-full rounded-2xl bg-ink text-[15px] font-semibold text-paper transition hover:bg-black"
                    >
                      Pay deposit · {naira(car.deposit)}
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-go" />
                    <h3 id="booking-title" className="mt-3 font-serif text-[28px] font-normal tracking-[-0.01em]">
                      Booking request sent
                    </h3>
                    <p className="mt-2 text-[14px] text-muted">
                      {car.ownerName} has been notified. Pickup is in {car.location}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCar(null)}
                      className="mt-6 h-11 rounded-full bg-ink px-6 text-[14px] font-semibold text-paper"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
