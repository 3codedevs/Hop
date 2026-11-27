import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search, ArrowDown } from 'lucide-react';
import { ROUTE_SCENARIOS } from '../data/hopData';
import { EASE, MODE_META } from '../lib/ui';
import { RevealWords } from './motion/TextFx';


const STATS = [
  { n: '05', label: 'ways to travel, compared' },
  { n: '24h', label: 'advice changes by the hour' },
  { n: '₦', label: 'fare ranges, not guesses' },
];

interface HeroPlannerProps {
  onJumpToFleet: () => void;
}

export function HeroPlanner({ onJumpToFleet }: HeroPlannerProps) {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>(ROUTE_SCENARIOS[0].id);
  const [customQuery, setCustomQuery] = useState<string>(ROUTE_SCENARIOS[0].query);
  const active = ROUTE_SCENARIOS.find((s) => s.id === selectedId) ?? ROUTE_SCENARIOS[0];

  const pick = (id: string) => {
    const found = ROUTE_SCENARIOS.find((s) => s.id === id);
    if (!found) return;
    setSelectedId(id);
    setCustomQuery(found.query);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = customQuery.toLowerCase();
    if (q.includes('4') || q.includes('stop') || q.includes('rent') || q.includes('day')) setSelectedId('four-stops');
    else if (q.includes('ikeja') || q.includes('marina') || q.includes('fast')) setSelectedId('ikeja-marina');
    else setSelectedId('yaba-lekki');
  };

  const enter = (d: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, ease: EASE, delay: d },
        };

  return (
    <section id="top" className="relative pt-28 pb-24 md:pt-32 md:pb-32">
      <div className="shell">
        {/* Stat row */}
        <motion.dl {...enter(0.05)} className="grid grid-cols-3 gap-4 border-b border-line pb-6 sm:flex sm:gap-x-12">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <dt className="text-2xl font-light tracking-[-0.02em] sm:text-3xl">{s.n}</dt>
              <dd className="text-[12px] leading-snug text-muted sm:text-[13px]">{s.label}</dd>
            </div>
          ))}
        </motion.dl>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left: headline + planner */}
          <div className="lg:col-span-7 lg:pt-6">
            <h1 className="font-serif text-[clamp(3rem,6vw,6rem)] leading-[0.98] font-normal tracking-[-0.025em]">
              <RevealWords text="Every way across Lagos, *ranked for the hour you leave.*" delay={0.1} />
            </h1>
            <motion.p {...enter(0.5)} className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              BRT, danfo, ride-hailing or a self-drive car. Hop weighs cost, time and live traffic, then tells you which
              one wins and why.
            </motion.p>

            <motion.form
              {...enter(0.65)}
              id="planner"
              onSubmit={submit}
              className="mt-10 scroll-mt-28 rounded-[22px] border border-line bg-surface p-2 shadow-[0_1px_2px_rgb(14_15_12/0.04),0_24px_48px_-32px_rgb(14_15_12/0.35)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex flex-1 items-center">
                  <span className="sr-only">Where to?</span>
                  <Search className="pointer-events-none absolute left-4 h-[18px] w-[18px] text-muted" />
                  <input
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="Where to? e.g. Yaba to Lekki by 8am, cheapest"
                    className="h-14 w-full rounded-2xl bg-paper pr-4 pl-12 text-[16px] outline-none transition focus:bg-white focus:ring-2 focus:ring-signal"
                  />
                </label>
                <button
                  type="submit"
                  className="group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-[15px] font-semibold text-paper transition hover:bg-black"
                >
                  Find the best way
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 px-2 pt-3 pb-1.5">
                <span className="mr-1 text-[13px] text-muted">Try</span>
                {ROUTE_SCENARIOS.map((sc) => {
                  const on = sc.id === selectedId;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => pick(sc.id)}
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                        on ? 'border-ink bg-ink text-paper' : 'border-line text-ink hover:border-ink/40'
                      }`}
                    >
                      {sc.chipLabel}
                    </button>
                  );
                })}
              </div>
            </motion.form>
          </div>

          {/* Right: photo plate */}
          <motion.figure {...enter(0.3)} className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-ink">
              <motion.img
                src="/img/danfo-driver.jpg"
                alt="A danfo driver leaning out of his yellow minibus on a Lagos street"
                className="h-full w-full object-cover"
                initial={reduce ? false : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease: EASE }}
                fetchPriority="high"
              />
              <div className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1.5 text-[12px] font-medium backdrop-blur">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-signal align-middle" />
                Danfo fares from ₦300
              </div>
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[13px] text-muted">
              <span className="font-serif text-[15px] italic text-ink/75">A danfo driver waiting for passengers.</span>
              <span className="shrink-0">Photo: Ben Iwara</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          <motion.article
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-14 grid overflow-hidden rounded-[22px] border border-line bg-surface lg:grid-cols-12"
            aria-live="polite"
          >
            <div className="p-6 sm:p-8 lg:col-span-7 lg:border-r lg:border-line">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-signal" />
                  Top pick · {active.departure}
                </span>
                <span className="rounded-full bg-go/10 px-3 py-1 text-[12px] font-medium text-go">
                  {active.topPick.savingsBadge}
                </span>
              </div>
              <h2 className="mt-5 max-w-xl font-serif text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[1.08] font-normal tracking-[-0.015em]">
                {active.topPick.title}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{active.topPick.reason}</p>

              <div className="mt-7">
                <div className="flex justify-between text-[13px] font-medium">
                  <span>{active.origin}</span>
                  <span>{active.destination}</span>
                </div>
                <svg viewBox="0 0 400 84" preserveAspectRatio="none" className="mt-1 h-14 w-full overflow-visible" aria-hidden="true">
                  <path d={active.topPick.pathD} fill="none" stroke="rgb(14 15 12 / 0.1)" strokeWidth="3.5" strokeLinecap="round" />
                  <motion.path
                    d={active.topPick.pathD}
                    fill="none"
                    stroke="var(--color-signal)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
                  />
                </svg>
                <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px]">
                  {active.topPick.legs.map((leg, i) => {
                    const Icon = MODE_META[leg.mode].icon;
                    return (
                      <li key={leg.label} className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
                          <Icon className="h-3.5 w-3.5 text-muted" />
                          {leg.label}
                          <span className="num text-[11px] text-muted">{leg.duration}</span>
                        </span>
                        {i < active.topPick.legs.length - 1 && <ArrowRight className="h-3 w-3 text-muted" />}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div className="flex flex-col bg-paper/60 lg:col-span-5">
              <div className="grid grid-cols-2 border-b border-line">
                <div className="p-6 sm:p-8">
                  <div className="caption text-muted">Est. cost</div>
                  <div className="mt-2 text-[clamp(1.4rem,2.1vw,1.9rem)] font-light tracking-[-0.02em] whitespace-nowrap tabular-nums">
                    {active.topPick.costLabel.replace('About ', '')}
                  </div>
                </div>
                <div className="border-l border-line p-6 sm:p-8">
                  <div className="caption text-muted">Trip time</div>
                  <div className="mt-2 text-[clamp(1.4rem,2.1vw,1.9rem)] font-light tracking-[-0.02em] whitespace-nowrap tabular-nums">
                    {active.topPick.timeLabel}
                  </div>
                </div>
              </div>
              <ul className="flex-1 divide-y divide-line">
                {active.alternatives.map((alt) => {
                  const Icon = MODE_META[alt.mode].icon;
                  return (
                    <li key={alt.label} className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted" />
                        <div>
                          <div className="text-[14px] font-medium">{alt.label}</div>
                          <div className="text-[12px] text-muted">{alt.reliability}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="num text-[13px]">{alt.costLabel.replace('About ', '')}</div>
                        <div className="num text-[12px] text-muted">{alt.timeLabel}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-line px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={onJumpToFleet}
                  className="group inline-flex items-center gap-1.5 text-[14px] font-semibold"
                >
                  Compare with a self-drive rental
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        <div className="mt-16 flex items-center justify-center gap-3 text-[13px] text-muted">
          <span className="relative block h-8 w-px overflow-hidden bg-line">
            <span className="cue absolute inset-0 bg-ink" />
          </span>
          Scroll to watch a Lagos day
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </div>
    </section>
  );
}
