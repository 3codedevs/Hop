import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Plus } from 'lucide-react';
import { FAQ_ITEMS } from '../data/hopData';
import { Logo } from './Navbar';
import { scrollToId } from '../lib/ui';
import { RevealWords } from './motion/TextFx';
import { EASE } from '../lib/ui';
import { Kicker } from './Kicker';

const CREDITS = [
  ['Danfo driver', 'Ben Iwara'],
  ['Third Mainland Bridge', 'Vitalis Nwenyi'],
  ['Lagos at dusk', 'Ben Iwara'],
  ['Bridge at night', 'Opeyemi Adisa'],
  ['Danfo park', 'Dami Akinbode'],
  ['Corolla sedan', 'Bestami Sarikaya'],
  ['Corolla hatch', 'Trevor'],
];

function Letter({ char, i, progress }: { char: string; i: number; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0.2 + i * 0.08, 0.75 + i * 0.08], ['70%', '0%']);
  return (
    <motion.span className="inline-block" style={{ y }}>
      {char}
    </motion.span>
  );
}

export function FaqAndFooter() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const footerRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ['start end', 'end end'] });

  return (
    <>
      <section id="faq" className="border-t border-line py-24 md:py-36">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker n={6}>Questions</Kicker>
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-normal tracking-[-0.02em]">
              <RevealWords text="What commuters *ask first.*" />
            </h2>
          </div>

          <div className="border-t border-line lg:col-span-7">
            {FAQ_ITEMS.map((item, idx) => {
              const open = openIdx === idx;
              return (
                <div key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : idx)}
                      aria-expanded={open}
                      aria-controls={`faq-${idx}`}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-[clamp(1.3rem,1.9vw,1.6rem)] font-normal tracking-[-0.01em]"
                    >
                      {item.q}
                      <Plus
                        className={`h-5 w-5 shrink-0 text-muted transition-transform duration-500 ease-[var(--ease-expo)] ${open ? 'rotate-45' : ''}`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer ref={footerRef} data-tone="dark" className="grain relative overflow-hidden bg-night pt-24 text-chalk md:pt-32">
        <div className="shell relative">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-16 md:flex-row md:items-end">
            <h2 className="max-w-3xl font-serif text-[clamp(2.75rem,6.5vw,6rem)] leading-[1] font-normal tracking-[-0.02em]">
              <RevealWords text="Stop guessing. *Start moving.*" mutedClass="text-chalk/60" />
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToId('planner')}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-signal px-6 text-[15px] font-semibold text-ink"
              >
                Plan a trip
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] transition-colors hover:bg-white/10"
              >
                Back to top
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-10 py-12 text-[13px] md:grid-cols-12">
            <div className="md:col-span-4">
              <Logo className="text-chalk" />
              <p className="mt-4 max-w-xs text-chalk/55">
                Every way across Lagos, compared for the hour you travel. Fares are estimates and are labelled as such.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="caption text-chalk/45">Photography · Unsplash</div>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                {CREDITS.map(([what, who]) => (
                  <li key={what} className="text-chalk/60">
                    <span className="text-chalk/90">{who}</span>
                    <br />
                    {what}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="caption flex flex-wrap justify-between gap-4 border-t border-white/10 py-6 text-chalk/45">
            <span>© 2026 Hop · Concept prototype</span>
            <span>Paystack test mode · Estimates labelled</span>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none -mb-[0.2em] select-none overflow-hidden text-center font-serif text-[34vw] leading-[0.8] font-light italic tracking-[-0.03em] text-chalk/[0.07]"
        >
          {reduce ? 'hop' : ['h', 'o', 'p'].map((c, i) => <Letter key={c} char={c} i={i} progress={scrollYProgress} />)}
        </div>
      </footer>
    </>
  );
}
