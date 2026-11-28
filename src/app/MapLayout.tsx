import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useDesktop } from './store';

export type Snap = 'peek' | 'half' | 'full';
export interface MapPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const PANEL = 420;

interface Props {
  /** Render the map; padding keeps the route clear of the sheet or panel. */
  map: (padding: MapPadding) => ReactNode;
  /** Pinned above the scrolling content (also a drag handle on phones). */
  header?: ReactNode;
  /** Pinned below the content, in thumb reach. */
  footer?: ReactNode;
  children: ReactNode;
  initialSnap?: Snap;
  /** Change this to scroll the content back to the top (e.g. a new screen). */
  resetKey?: string;
}

/**
 * Map-first layout. Phones: the map fills the screen and content sits in a
 * bottom sheet you can drag between peek, half and full. Desktop: a floating
 * panel on the left over a full-bleed map.
 */
export function MapLayout({ map, header, footer, children, initialSnap = 'half', resetKey }: Props) {
  const desktop = useDesktop();
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxH, setBoxH] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxH(el.clientHeight));
    ro.observe(el);
    setBoxH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const [settled, setSettled] = useState<number | null>(null);
  const padding: MapPadding = desktop
    ? { top: 40, right: 60, bottom: 40, left: PANEL + 56 }
    : { top: 70, right: 24, bottom: (settled ?? boxH * 0.5) + 16, left: 24 };

  return (
    <div ref={boxRef} className="relative h-[calc(100svh-3.5rem-4.5rem-env(safe-area-inset-bottom))] overflow-hidden lg:h-[calc(100svh-3.5rem)]">
      <div className="absolute inset-0">{map(padding)}</div>
      {desktop ? (
        <aside className="absolute top-4 bottom-4 left-4 z-20 flex flex-col overflow-hidden rounded-[24px] bg-paper shadow-[0_24px_60px_-24px_rgb(14_15_12/0.5)] ring-1 ring-line" style={{ width: PANEL }}>
          {header && <div className="shrink-0 border-b border-line px-6 pt-5 pb-4">{header}</div>}
          <Scroller resetKey={resetKey} className="px-6 pt-5 pb-8">{children}</Scroller>
          {footer && <div className="shrink-0 border-t border-line bg-paper px-6 py-4">{footer}</div>}
        </aside>
      ) : (
        boxH > 0 && (
          <Sheet boxH={boxH} initial={initialSnap} header={header} footer={footer} onSettle={setSettled} resetKey={resetKey}>
            {children}
          </Sheet>
        )
      )}
    </div>
  );
}

function Scroller({ children, className, resetKey }: { children: ReactNode; className: string; resetKey?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [resetKey]);
  return (
    <div ref={ref} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${className}`}>
      {children}
    </div>
  );
}

function Sheet({ boxH, initial, header, footer, children, onSettle, resetKey }: { boxH: number; initial: Snap; header?: ReactNode; footer?: ReactNode; children: ReactNode; onSettle: (h: number) => void; resetKey?: string }) {
  const reduce = useReducedMotion();
  const snaps: Record<Snap, number> = { peek: Math.min(200, boxH * 0.32), half: Math.round(boxH * 0.52), full: boxH - 8 };
  const order: Snap[] = ['peek', 'half', 'full'];
  const [snap, setSnap] = useState<Snap>(initial);
  const height = useMotionValue(snaps[initial]);
  const drag = useRef<{ y: number; h: number; t: number; lastY: number; lastT: number } | null>(null);

  const go = (to: Snap) => {
    setSnap(to);
    animate(height, snaps[to], reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 });
  };

  // Keep the sheet at its snap point when the screen size changes (rotation, address bar)
  const snapHeight = snaps[snap];
  const lastBox = useRef(boxH);
  useEffect(() => {
    if (lastBox.current !== boxH) {
      lastBox.current = boxH;
      height.set(snapHeight);
    }
    onSettle(snapHeight);
  }, [boxH, snapHeight, height, onSettle]);

  const onDown = (e: PointerEvent) => {
    drag.current = { y: e.clientY, h: height.get(), t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp };
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const el = e.currentTarget as HTMLElement;
    // Capture only once it's clearly a drag, so taps still reach the handle button
    if (!el.hasPointerCapture(e.pointerId)) {
      if (Math.abs(e.clientY - d.y) < 6) return;
      el.setPointerCapture(e.pointerId);
    }
    height.set(Math.max(snaps.peek * 0.7, Math.min(snaps.full, d.h + (d.y - e.clientY))));
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
  };
  const onUp = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const moved = Math.abs(e.clientY - d.y);
    if (moved < 6) return; // a tap, not a drag
    const v = (d.y - e.clientY) / Math.max(1, e.timeStamp - d.t); // px/ms, up is positive
    const h = height.get();
    let target: Snap;
    if (Math.abs(v) > 0.6) {
      const i = order.indexOf(snap);
      target = v > 0 ? order[Math.min(2, i + 1)] : order[Math.max(0, i - 1)];
    } else {
      target = order.reduce((best, s) => (Math.abs(snaps[s] - h) < Math.abs(snaps[best] - h) ? s : best), 'half' as Snap);
    }
    go(target);
  };

  return (
    <motion.section
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-[26px] bg-paper shadow-[0_-12px_40px_-12px_rgb(14_15_12/0.35)] ring-1 ring-line"
      style={{ height }}
      aria-label="Trip panel"
    >
      <div className="shrink-0 touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <button
          type="button"
          onClick={() => go(snap === 'full' ? 'half' : 'full')}
          aria-label={snap === 'full' ? 'Show more map' : 'Expand panel'}
          className="flex h-7 w-full items-center justify-center"
        >
          <span className="h-1.5 w-11 rounded-full bg-ink/20" />
        </button>
        {header && <div className="px-5 pb-3">{header}</div>}
      </div>
      <Scroller resetKey={resetKey} className="border-t border-line px-5 pt-4 pb-6">{children}</Scroller>
      {footer && <div className="shrink-0 border-t border-line bg-paper px-5 py-3">{footer}</div>}
    </motion.section>
  );
}
