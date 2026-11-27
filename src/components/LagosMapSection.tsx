import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { LAGOS_HUBS } from '../data/hopData';
import { EASE, HUB_STATUS } from '../lib/ui';
import { ChapterSection } from './motion/Build';
import { Reveal, RevealWords } from './motion/TextFx';
import { Kicker } from './Kicker';
import { LagosMap } from './LagosMap';

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

/** Wide screens keep the right side of the map clear for the readout card. */
function useMapPadding() {
  const get = () =>
    typeof window !== 'undefined' && window.innerWidth >= 1024
      ? { top: 70, bottom: 70, left: 80, right: 440 }
      : { top: 50, bottom: 50, left: 40, right: 40 };
  const [pad, setPad] = useState(get);
  useEffect(() => {
    const on = () => setPad(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return pad;
}

export function LagosMapSection() {
  const reduce = useReducedMotion();
  const clock = useLagosClock();
  const padding = useMapPadding();
  const [hubId, setHubId] = useState(LAGOS_HUBS[3].id);
  const [resetSignal, setResetSignal] = useState(0);
  const hub = LAGOS_HUBS.find((h) => h.id === hubId)!;
  const status = HUB_STATUS[hub.status];
  const [reports, setReports] = useState([
    { id: 3, text: 'Third Mainland southbound is clearing', where: 'Yaba', ago: '3 min ago' },
    { id: 2, text: 'BRT 102 boarding at Fadeyi', where: 'Yaba', ago: '5 min ago' },
    { id: 1, text: 'A bus that never came', where: 'CMS / Marina', ago: '6 min ago' },
  ]);

  const report = (text: string) =>
    setReports((prev) => [{ id: (prev[0]?.id ?? 0) + 1, text, where: hub.name, ago: 'just now' }, ...prev.slice(0, 3)]);

  return (
    <ChapterSection id="corridors" className="relative overflow-hidden bg-night py-24 text-chalk md:py-36">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <Kicker n={3} dark>
              Corridors
            </Kicker>
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.02em]">
              <RevealWords text="Timetables miss what commuters see. *Hop listens to them.*" mutedClass="text-chalk/55" />
            </h2>
          </div>
          <p className="text-[14px] text-chalk/55">
            In Lagos it is <span className="num text-chalk">{clock}</span>
          </p>
        </div>

        {/* Map */}
        <Reveal className="mt-14">
          <div className="relative h-[min(80vh,760px)] min-h-[520px] overflow-hidden rounded-[22px] border border-white/10 bg-[#161613]">
            <LagosMap
              hubs={LAGOS_HUBS}
              selectedId={hubId}
              onSelect={setHubId}
              padding={padding}
              resetSignal={resetSignal}
            />

            {/* Legend */}
            <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-2xl bg-night/80 px-4 py-3 text-[12px] text-chalk/70 backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <span className="h-[3px] w-6 rounded bg-signal" /> Ikeja to Lekki, by road
              </div>
              <div className="mt-2 flex gap-4">
                {Object.values(HUB_STATUS).map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Readout card (desktop: floats over the map) */}
            <div className="absolute top-4 right-4 bottom-12 hidden w-[380px] flex-col rounded-[18px] border border-white/10 bg-night/85 p-7 backdrop-blur-xl lg:flex">
              <HubReadout hub={hub} status={status} reduce={!!reduce} onReport={report} />
              <button
                type="button"
                onClick={() => setResetSignal((n) => n + 1)}
                className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-[13px] text-chalk/60 transition-colors hover:text-chalk"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Whole corridor
              </button>
            </div>
          </div>
        </Reveal>

        {/* Readout card (mobile: below the map) */}
        <div className="mt-4 rounded-[18px] border border-white/10 p-6 lg:hidden">
          <HubReadout hub={hub} status={status} reduce={!!reduce} onReport={report} />
        </div>

        {/* Live feed */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <h3 className="font-serif text-[26px] leading-tight font-normal lg:col-span-4">
            From commuters, <span className="italic text-chalk/55">just now</span>
          </h3>
          <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8" aria-live="polite">
            <AnimatePresence initial={false}>
              {reports.map((r) => (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex items-baseline justify-between gap-4 py-4 text-[15px]"
                >
                  <span>
                    {r.text}
                    <span className="text-chalk/45">, {r.where}</span>
                  </span>
                  <span className="shrink-0 text-[13px] text-chalk/45">{r.ago}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </ChapterSection>
  );
}

function HubReadout({
  hub,
  status,
  reduce,
  onReport,
}: {
  hub: (typeof LAGOS_HUBS)[number];
  status: (typeof HUB_STATUS)[keyof typeof HUB_STATUS];
  reduce: boolean;
  onReport: (text: string) => void;
}) {
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={hub.id}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-chalk/55">{hub.corridor}</span>
            <span className="inline-flex items-center gap-2" style={{ color: status.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
              {status.label}
            </span>
          </div>
          <div className="mt-5 font-serif text-[clamp(2.4rem,3.4vw,3.25rem)] leading-none font-normal tracking-[-0.02em]">
            {hub.name}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-chalk/70">{hub.report}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-7 border-t border-white/10 pt-5">
        <p className="text-[13px] text-chalk/55">Seen something at {hub.name}?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Traffic building', 'Bus never came', 'Road clear'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onReport(t)}
              className="rounded-full border border-white/20 px-3.5 py-2 text-[13px] transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
