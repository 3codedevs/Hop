import type { ReactNode } from 'react';

/** Chapter label: an italic "No. 3" followed by the section name in plain text. */
export function Kicker({ n, children, dark = false }: { n: number; children: ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-baseline gap-3 text-[14px] ${dark ? 'text-chalk/60' : 'text-muted'}`}>
      <span className={`font-serif text-[18px] italic ${dark ? 'text-chalk' : 'text-ink'}`}>No. {n}</span>
      <span>{children}</span>
    </p>
  );
}
