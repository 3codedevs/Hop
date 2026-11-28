import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import type { Place } from '../../shared/types';
import { EASE } from '../lib/ui';

interface Props {
  open: boolean;
  title: string;
  places: Place[];
  value: string;
  onPick: (id: string) => void;
  onClose: () => void;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function PlacePicker({ open, title, places, value, onPick, onClose }: Props) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex h-[88svh] w-full flex-col overflow-hidden rounded-t-[24px] bg-paper sm:h-[72vh] sm:max-w-md sm:rounded-[24px]"
            initial={reduce ? false : { y: 48 }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: 48 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sheet title={title} places={places} value={value} onPick={onPick} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Sheet({ title, places, value, onPick, onClose }: Omit<Props, 'open'>) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = norm(query);
  const matches = places.filter((p) => !q || norm(p.name).includes(q) || norm(p.area).includes(q));
  const groups = [
    { label: 'Mainland', items: matches.filter((p) => p.side === 'mainland') },
    { label: 'Island', items: matches.filter((p) => p.side === 'island') },
  ].filter((g) => g.items.length);

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.01em]">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5">
          <X className="h-5 w-5" />
        </button>
      </div>
      <label className="mx-5 mt-3 flex h-12 items-center gap-3 rounded-2xl bg-surface px-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
        <Search className="h-4 w-4 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a bus stop or area"
          className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-muted"
          aria-label="Search places"
        />
      </label>
      <div className="mt-3 flex-1 overflow-y-auto px-2 pb-6">
        {groups.length === 0 && <p className="px-3 py-6 text-[15px] text-muted">No stops match “{query}”. The demo covers the busiest corridors.</p>}
        {groups.map((g) => (
          <div key={g.label}>
            <div className="caption px-3 pt-4 pb-1 text-muted">{g.label}</div>
            <ul>
              {g.items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPick(p.id)}
                    className="flex min-h-13 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-ink/5"
                  >
                    <span>
                      <span className="block text-[15px] font-medium">{p.name}</span>
                      <span className="block text-[13px] text-muted">{p.area}</span>
                    </span>
                    {p.id === value && <Check className="h-4 w-4 text-signal-deep" aria-label="Selected" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
