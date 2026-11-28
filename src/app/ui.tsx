import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { onToast, soon } from './store';

/** One toast at a time, above the tab bar. */
export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => onToast((text) => setMsg({ text, id: Date.now() })), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8" role="status" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="rounded-full bg-ink px-5 py-3 text-[14px] text-paper shadow-[0_18px_40px_-16px_rgb(14_15_12/0.6)]"
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SoonTag({ tone = 'light' }: { tone?: 'light' | 'dark' | 'accent' }) {
  const look = tone === 'dark' ? 'bg-white/15 text-chalk' : tone === 'accent' ? 'bg-black/12 text-[#0E0F0C]' : 'bg-signal/15 text-signal-deep';
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${look}`}>
      SOON
    </span>
  );
}

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'row';

const VARIANTS: Record<Variant, string> = {
  primary: 'h-13 justify-center rounded-full bg-ink px-6 text-[15px] font-semibold text-paper',
  accent: 'h-13 justify-center rounded-full bg-signal px-6 text-[15px] font-semibold text-[#0E0F0C]',
  secondary: 'min-h-11 justify-center rounded-full border border-line bg-surface px-4 text-[14px] font-medium',
  ghost: 'min-h-11 rounded-full px-3 text-[14px] text-muted hover:text-ink',
  row: 'min-h-14 w-full justify-between px-4 text-left text-[15px] hover:bg-ink/4',
};

/** A real button for a feature we haven't built: it says so instead of doing nothing. */
export function SoonButton({ feature, label, icon: Icon, variant = 'secondary', className = '', children }: { feature: string; label?: string; icon?: LucideIcon; variant?: Variant; className?: string; children?: ReactNode }) {
  return (
    <button type="button" onClick={() => soon(feature)} className={`inline-flex items-center gap-2 ${VARIANTS[variant]} ${className}`}>
      <span className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {children ?? label ?? feature}
      </span>
      <SoonTag tone={variant === 'primary' ? 'dark' : variant === 'accent' ? 'accent' : 'light'} />
    </button>
  );
}

export function PageTitle({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div>
      {kicker && <p className="caption text-muted">{kicker}</p>}
      <h1 className="mt-1 font-serif text-[38px] leading-[1.02] font-normal tracking-[-0.02em]">{title}</h1>
      {children && <div className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{children}</div>}
    </div>
  );
}
