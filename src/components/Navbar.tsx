import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { EASE, scrollToId } from '../lib/ui';

const LINKS = [
  { id: 'rush', label: 'Rush hour' },
  { id: 'how', label: 'How it works' },
  { id: 'corridors', label: 'Corridors' },
  { id: 'fleet', label: 'Self-drive' },
  { id: 'faq', label: 'FAQ' },
];

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="6" cy="17" r="3.2" fill="currentColor" />
        <circle cx="18" cy="7" r="3.2" fill="var(--color-signal)" />
        <path d="M6 17 C 9 6, 15 18, 18 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-semibold tracking-[-0.03em]">hop</span>
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Which section sits under the bar? Switch tone over dark chapters.
      const probe = document.elementFromPoint(window.innerWidth / 2, 72);
      setDark(!!probe?.closest('[data-tone="dark"]'));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  const tone = dark
    ? 'bg-night/80 text-chalk border-white/10'
    : scrolled
      ? 'bg-paper/85 text-ink border-line'
      : 'bg-transparent text-ink border-transparent';

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-signal"
        style={{ scaleX: progress }}
      />
      <div className={`border-b backdrop-blur-md transition-colors duration-500 ${tone}`}>
        <nav className="shell flex h-16 items-center justify-between gap-6" aria-label="Main">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3"
            aria-label="Hop, back to top"
          >
            <Logo />
            <span className="caption hidden opacity-50 sm:inline">Lagos</span>
          </a>

          <ul className="hidden items-center gap-8 text-[14px] lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => go(l.id)}
                  className="opacity-65 transition-opacity hover:opacity-100"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go('planner')}
              className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-signal px-4 text-[13px] font-semibold text-ink transition-transform duration-300 hover:-translate-y-px"
            >
              Plan a trip
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/15 lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="border-b border-line bg-paper lg:hidden"
          >
            <ul className="shell flex flex-col py-3">
              {LINKS.map((l, i) => (
                <li key={l.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    onClick={() => go(l.id)}
                    className="flex w-full items-baseline gap-4 py-4 text-left text-2xl font-medium tracking-[-0.02em]"
                  >
                    <span className="num text-xs text-muted">0{i + 1}</span>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
