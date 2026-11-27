import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bus, Car, Navigation } from 'lucide-react';
import { RevealWords } from './motion/TextFx';
import { EASE } from '../lib/ui';
import { Kicker } from './Kicker';

const STEPS = [
  {
    num: '01',
    title: 'Ask the way you would ask a friend',
    body: 'Type “Yaba to Lekki by 8am, cheapest” or list four stops for your day. Hop turns a messy sentence into a route.',
  },
  {
    num: '02',
    title: 'See every option, ranked',
    body: 'Cost and time sit side by side. Danfo fares appear as honest ranges, and every estimate is labelled as one.',
  },
  {
    num: '03',
    title: 'Rent a car when that wins',
    body: 'When a day of errands makes ride-hailing cost more than a car, Hop surfaces a verified self-drive rental.',
  },
];

function Step({ step, index, active, onActive }: { step: (typeof STEPS)[number]; index: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { amount: 0.6, margin: '-20% 0px -20% 0px' });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="flex min-h-[40vh] items-center lg:min-h-[52vh]">
      <button
        type="button"
        onClick={() => onActive(index)}
        className={`w-full rounded-[22px] p-6 text-left transition-all duration-500 sm:p-8 ${
          active ? 'bg-surface shadow-[0_1px_2px_rgb(14_15_12/0.04),0_24px_48px_-32px_rgb(14_15_12/0.3)]' : 'opacity-40 hover:opacity-70'
        }`}
      >
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-[20px] italic text-signal-deep">{step.num}</span>
          <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.25rem)] leading-tight font-normal tracking-[-0.015em]">{step.title}</h3>
        </div>
        <p className="mt-3 max-w-md pl-9 text-[15px] leading-relaxed text-muted">{step.body}</p>
      </button>
    </li>
  );
}

function Screen({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="space-y-3">
        <div className="text-[20px] font-semibold tracking-[-0.01em]">Where to?</div>
        <div className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-3 text-[14px]">
          <span className="h-2 w-2 rounded-full bg-ink" /> Yaba
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-signal px-3.5 py-3 text-[14px]">
          <span className="h-2 w-2 rounded-sm bg-signal" /> Lekki Phase 1
        </div>
        <div className="flex gap-2 pt-1">
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px]">By 8:00</span>
          <span className="rounded-full border border-ink bg-ink px-2.5 py-1 text-[11px] text-paper">Cheapest</span>
        </div>
        <div className="pt-6">
          <div className="flex h-11 items-center justify-center rounded-xl bg-signal text-[14px] font-semibold">Find the best way</div>
        </div>
      </div>
    );
  if (step === 1)
    return (
      <div>
        <div className="flex items-baseline justify-between">
          <div className="text-[20px] font-semibold tracking-[-0.01em]">3 ways</div>
          <span className="caption text-muted">08:00</span>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {[
            { icon: Bus, name: 'BRT + shuttle', cost: '₦900–1,300', t: '48m', top: true },
            { icon: Bus, name: 'Danfo via Obalende', cost: '₦700–1,100', t: '56m' },
            { icon: Navigation, name: 'Ride-hail', cost: '~₦4,500', t: '66m' },
          ].map((r) => (
            <li key={r.name} className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2.5 text-[13px]">
                <r.icon className="h-4 w-4 text-muted" />
                {r.name}
                {r.top && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
              </span>
              <span className="text-right">
                <span className="num block text-[12px]">{r.cost}</span>
                <span className="num block text-[11px] text-muted">{r.t}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-xl bg-go/10 px-3 py-2.5 text-[12px] text-go">Saves ₦3,200 and 18 min vs ride-hailing</div>
      </div>
    );
  return (
    <div>
      <div className="text-[20px] font-semibold tracking-[-0.01em]">Your day: 4 stops</div>
      <div className="mt-3 overflow-hidden rounded-xl">
        <img src="/img/corolla-sedan.jpg" alt="" className="h-28 w-full object-cover" />
      </div>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted" />
          Corolla · verified
        </span>
        <span className="num">₦18,000</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
        <span className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />4 ride-hails
        </span>
        <span className="num line-through">₦24,000</span>
      </div>
      <div className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink text-[14px] font-semibold text-paper">
        Book for today <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export function StickyJourney() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="how" className="py-24 md:py-36">
      <div className="shell">
        <div className="max-w-3xl">
          <Kicker n={2}>How it works</Kicker>
          <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.02em]">
            <RevealWords text="From a guess to *one clear decision.*" />
          </h2>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 hidden w-px bg-line lg:block">
              <motion.span
                className="absolute inset-x-0 top-0 bg-signal"
                animate={{ height: `${((active + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </span>
            <ol className="lg:pl-8">
              {STEPS.map((s, i) => (
                <Step key={s.num} step={s} index={i} active={i === active} onActive={setActive} />
              ))}
            </ol>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(50vh-300px)]">
              <div className="mx-auto w-[300px] rounded-[44px] border-[10px] border-ink bg-surface p-5 shadow-[0_40px_80px_-30px_rgb(14_15_12/0.45)]">
                <div className="mx-auto mb-6 h-6 w-24 rounded-full bg-ink" />
                <div className="h-[440px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <Screen step={active} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="caption mt-5 text-center text-muted">
                Step {active + 1} of 3
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
