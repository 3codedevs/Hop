import type { ReactNode } from 'react';

/** Content on the left and the map on the right on desktop; map on top on phones. */
export function Split({ children, map, mapOnPhones = true }: { children: ReactNode; map: ReactNode; mapOnPhones?: boolean }) {
  return (
    <div className="flex flex-col lg:grid lg:h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(400px,480px)_1fr]">
      <div className="order-2 lg:order-1 lg:overflow-y-auto">{children}</div>
      <div className={`order-1 h-[38svh] min-h-[240px] lg:order-2 lg:block lg:h-full ${mapOnPhones ? '' : 'hidden'}`}>{map}</div>
    </div>
  );
}
