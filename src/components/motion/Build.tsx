import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * A dark chapter that opens up as it scrolls in: it starts as an inset,
 * rounded panel and widens to full bleed. Scroll-linked, so it scrubs both ways.
 * Used only on the dark chapters so the effect stays special.
 */
export function ChapterSection({
  id,
  className,
  style,
  children,
}: {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'start 0.15'] });
  const clipPath = useTransform(p, [0, 1], ['inset(0% 3.5% 0% 3.5% round 28px)', 'inset(0% 0% 0% 0% round 0px)']);

  return (
    <motion.section
      ref={ref}
      id={id}
      data-tone="dark"
      className={className}
      style={reduce ? style : { ...style, clipPath }}
    >
      {children}
    </motion.section>
  );
}
