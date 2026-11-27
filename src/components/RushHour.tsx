import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { DAY_PHASES, TIME_OF_DAY, type HourSnapshot } from '../data/hopData';
import { EASE, MODE_META } from '../lib/ui';
import { Kicker } from './Kicker';

const START_H = 6;
const END_H = 22;

function snapshotFor(hour: number): HourSnapshot {
  let found = TIME_OF_DAY[0];
  for (const s of TIME_OF_DAY) if (s.hour <= hour) found = s;
  return found;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Signature chapter: scroll controls the time of day. The photo moves from
 * day to dusk to night, the clock runs 06:00 to 22:00, and the best way from
 * Yaba to Lekki Phase 1 changes with Lagos traffic.
 */
export function RushHour() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [minutes, setMinutes] = useState(START_H * 60 + 40);

  useMotionValueEvent(p, 'change', (v) => {
    const total = START_H * 60 + v * (END_H - START_H) * 60;
    const snapped = Math.round(total / 5) * 5;
    setMinutes((m) => (m === snapped ? m : snapped));
  });

  const hour = Math.floor(minutes / 60);
  const snap = snapshotFor(hour);
  const phase = DAY_PHASES.find((d) => d.id === snap.phase)!;
  const Icon = MODE_META[snap.mode].icon;

  // Photo crossfades: day → dusk → night
  const dusk = useTransform(p, [0.5, 0.68], [0, 1]);
  const night = useTransform(p, [0.8, 0.92], [0, 1]);
  const zoom = useTransform(p, [0, 1], reduce ? [1, 1] : [1.14, 1]);
  // Warm morning, neutral noon, amber evening, blue night
  const tint = useTransform(
    p,
    [0, 0.15, 0.35, 0.62, 0.78, 1],
    [
      'rgb(255 170 90 / 0.18)',
      'rgb(255 190 120 / 0.08)',
      'rgb(0 0 0 / 0)',
      'rgb(255 110 40 / 0.16)',
      'rgb(20 40 120 / 0.2)',
      'rgb(10 20 70 / 0.3)',
    ],
  );
  const markerY = useTransform(p, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={ref}
      id="rush"
      data-tone="dark"
      className="relative bg-night text-chalk"
      style={{ height: '440vh' }}
      aria-label="How the best route from Yaba to Lekki changes through the day"
    >
      <div className="grain sticky top-0 h-[100svh] overflow-hidden">
        {/* Photography */}
        <motion.div className="absolute inset-0" style={{ scale: zoom }}>
          <img src="/img/third-mainland-day.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <motion.img src="/img/lagos-dusk.jpg" alt="" style={{ opacity: dusk }} className="absolute inset-0 h-full w-full object-cover" />
          <motion.img src="/img/lagos-bridge-night.jpg" alt="" style={{ opacity: night }} className="absolute inset-0 h-full w-full object-cover" />
        </motion.div>
        <motion.div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: tint }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_11_10/0.7)_0%,rgb(11_11_10/0.15)_35%,rgb(11_11_10/0.25)_60%,rgb(11_11_10/0.88)_100%)]" />

        <div className="shell relative flex h-full flex-col pt-24 pb-8">
          {/* Chapter heading */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <Kicker n={1} dark>
                Rush hour, Yaba to Lekki Phase 1
              </Kicker>
              <h2 className="mt-4 max-w-xl font-serif text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-normal tracking-[-0.02em]">
                Lagos changes by the hour. <span className="italic text-chalk/65">So does the answer.</span>
              </h2>
            </div>
            <div className="caption hidden text-right text-chalk/60 md:block">
              Traffic on Third Mainland
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="relative block h-[3px] w-28 overflow-hidden rounded bg-chalk/20">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded bg-signal"
                    animate={{ width: `${snap.traffic}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
                <span className="num w-8 text-chalk">{snap.traffic}%</span>
              </div>
            </div>
          </div>

          {/* Clock */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div
              className="text-[clamp(5.5rem,17vw,15rem)] leading-none font-extralight tracking-[-0.04em] tabular-nums"
              aria-live="off"
            >
              {pad(hour)}
              <span className="text-chalk/45">:</span>
              {pad(minutes % 60)}
            </div>
            <div className="mt-2 font-serif text-[24px] italic text-chalk/85">{phase.label}</div>
          </div>

          {/* Bottom: answer card + scroll hint */}
          <div className="flex items-end justify-between gap-6">
            <motion.div
              key={`${snap.hour}-${snap.mode}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-lg rounded-[20px] border border-white/12 bg-night/55 p-5 backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="caption inline-flex items-center gap-2 text-chalk/70">
                  <Icon className="h-3.5 w-3.5" />
                  Best right now · {MODE_META[snap.mode].label}
                </span>
                <span className="h-2 w-2 rounded-full bg-signal" />
              </div>
              <div className="mt-3 font-serif text-[24px] leading-snug font-normal">{snap.best}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                <div>
                  <div className="caption text-chalk/50">Cost</div>
                  <div className="num mt-1 text-[14px]">{snap.cost}</div>
                </div>
                <div>
                  <div className="caption text-chalk/50">Time</div>
                  <div className="num mt-1 text-[14px]">{snap.time}</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="caption text-chalk/50">Ride-hail</div>
                  <div className="num mt-1 text-[14px] whitespace-nowrap text-chalk/70">{snap.rideHail}</div>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-chalk/70">{snap.note}</p>
            </motion.div>

            <div className="caption hidden text-right text-chalk/60 sm:block">
              Scroll to change the time
              <div className="mt-1 text-chalk/40">Photos: Vitalis Nwenyi, Ben Iwara and Opeyemi Adisa</div>
            </div>
          </div>
        </div>

        {/* Day scale (right edge) */}
        <div className="absolute top-1/2 right-[var(--gutter)] hidden h-[46vh] -translate-y-1/2 lg:block" aria-hidden="true">
          <div className="relative h-full w-px bg-chalk/25">
            {DAY_PHASES.map((d) => {
              const pos = ((d.from - START_H) / (END_H - START_H)) * 100;
              const on = d.id === snap.phase;
              return (
                <div key={d.id} className="absolute right-0 flex -translate-y-1/2 items-center gap-2" style={{ top: `${pos}%` }}>
                  <span className={`caption whitespace-nowrap transition-colors duration-300 ${on ? 'text-chalk' : 'text-chalk/40'}`}>
                    {d.label}
                  </span>
                  <span className={`block h-px w-3 ${on ? 'bg-chalk' : 'bg-chalk/40'}`} />
                </div>
              );
            })}
            <motion.span className="absolute -left-[3px] block h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-signal" style={{ top: markerY }} />
          </div>
        </div>
      </div>

      {/* Same information for screen readers, without scrolling */}
      <ul className="sr-only">
        {TIME_OF_DAY.map((s) => (
          <li key={s.hour}>
            {pad(s.hour)}:00, best option {s.best}, {s.cost}, {s.time}. Ride-hail {s.rideHail}.
          </li>
        ))}
      </ul>
    </section>
  );
}
