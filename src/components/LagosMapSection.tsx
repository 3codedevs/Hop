import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LAGOS_HUBS, type LagosHub } from '../data/hopData';
import { ChapterSection } from './motion/Build';
import { Reveal, RevealWords } from './motion/TextFx';
import { EASE } from '../lib/ui';

const STATUS = {
  clear: { label: 'Moving', color: 'var(--color-go)' },
  busy: { label: 'Slow', color: '#E9A23B' },
  alert: { label: 'Alert', color: 'var(--color-signal)' },
} as const;

function useLagosClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function LagosMapSection() {
  const reduce = useReducedMotion();
  const clock = useLagosClock();
  const [hub, setHub] = useState<LagosHub>(LAGOS_HUBS[3]);
  const [reports, setReports] = useState([
    { id: 3, text: 'Third Mainland southbound clearing', where: 'Yaba', ago: '3 min' },
    { id: 2, text: 'BRT 102 boarding at Fadeyi', where: 'Yaba', ago: '5 min' },
    { id: 1, text: 'Ghost bus flagged', where: 'CMS / Marina', ago: '6 min' },
  ]);

  const report = (text: string) =>
    setReports((prev) => [{ id: (prev[0]?.id ?? 0) + 1, text, where: hub.name, ago: 'now' }, ...prev.slice(0, 3)]);

  return (
    <ChapterSection id="corridors" className="relative overflow-hidden bg-night py-24 text-chalk md:py-36">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="caption text-chalk/50">(03) · Corridors</div>
            <h2 className="mt-4 text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[0.98] font-light tracking-[-0.045em]">
              <RevealWords text="Timetables miss what commuters see. *Hop listens to them.*" mutedClass="text-chalk/45" />
            </h2>
          </div>
          <div className="caption text-chalk/50">
            Lagos <span className="num ml-1 text-chalk">{clock}</span> WAT
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* Map */}
          <Reveal className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/10 bg-[#111110]">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: 'radial-gradient(rgb(237 235 230 / 0.16) 1.2px, transparent 1.4px)',
                  backgroundSize: '18px 18px',
                }}
              />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <motion.path
                  d="M 34 22 L 28 44 L 47 48 L 52 72 L 68 78 L 84 74"
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth={0.45}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 2, ease: EASE }}
                />
              </svg>
              <span className="caption absolute top-4 left-4 text-chalk/40">Mainland</span>
              <span className="caption absolute right-4 bottom-4 text-chalk/40">Island · Lekki</span>

              {LAGOS_HUBS.map((h) => {
                const on = h.id === hub.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHub(h)}
                    aria-pressed={on}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      className={`mx-auto block rounded-full ring-4 transition-all duration-300 ${on ? 'h-3.5 w-3.5 ring-white/25' : 'h-2.5 w-2.5 ring-transparent group-hover:ring-white/15'}`}
                      style={{ backgroundColor: STATUS[h.status].color }}
                    />
                    <span
                      className={`mt-2 block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                        on ? 'bg-chalk text-ink' : 'text-chalk/70 group-hover:text-chalk'
                      }`}
                    >
                      {h.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Readout */}
          <Reveal className="flex flex-col lg:col-span-5" delay={0.1}>
            <div className="rounded-[22px] border border-white/10 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hub.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <div className="flex items-center justify-between">
                    <span className="caption text-chalk/50">{hub.corridor}</span>
                    <span className="caption inline-flex items-center gap-2" style={{ color: STATUS[hub.status].color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS[hub.status].color }} />
                      {STATUS[hub.status].label}
                    </span>
                  </div>
                  <div className="mt-6 text-[clamp(2.5rem,4.5vw,3.75rem)] leading-none font-light tracking-[-0.05em]">{hub.name}</div>
                  <p className="mt-4 text-[15px] text-chalk/70">{hub.report}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="caption text-chalk/50">Report from {hub.name}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Traffic building', 'Ghost bus', 'Road clear'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => report(t)}
                      className="rounded-full border border-white/20 px-3.5 py-2 text-[13px] transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ul className="mt-6 flex-1 divide-y divide-white/10 border-y border-white/10" aria-live="polite">
              <AnimatePresence initial={false}>
                {reports.map((r) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex items-center justify-between gap-4 py-3.5 text-[14px]"
                  >
                    <span>
                      {r.text} <span className="text-chalk/45">· {r.where}</span>
                    </span>
                    <span className="num text-[12px] text-chalk/45">{r.ago}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Reveal>
        </div>

        <figure className="mt-6 overflow-hidden rounded-[22px]">
          <img
            src="/img/highway-aerial.jpg"
            alt="Aerial view of a Lagos expressway with traffic in both directions"
            loading="lazy"
            className="h-[38vh] w-full object-cover opacity-80"
          />
          <figcaption className="caption mt-3 flex justify-between text-chalk/45">
            <span>Plate 02 · Lagos expressway from above</span>
            <span>Vitalis Nwenyi / Unsplash</span>
          </figcaption>
        </figure>
      </div>
    </ChapterSection>
  );
}
