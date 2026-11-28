import type { AnchorHTMLAttributes } from 'react';
import { navigate } from '../lib/router';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean };

/** An ordinary link that changes page without a reload. Modified clicks still open a new tab. */
export function Link({ to, replace, onClick, ...rest }: Props) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to, { replace });
      }}
    />
  );
}
