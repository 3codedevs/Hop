import { Fragment, useRef, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import { EASE } from '../../lib/ui';

/**
 * Masked line rise, word by word. Wrap words in *asterisks* to set them in
 * italic and a softer tone, the way an editor would mark the second half of a headline.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  mutedClass = 'text-muted',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  mutedClass?: string;
}) {
  const reduce = useReducedMotion();
  // Observe the unclipped wrapper: words start hidden behind an overflow mask.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(' ');
  const plain = text.replace(/\*/g, '');
  // A word is muted from the one that opens with * through the one that closes with *.
  const mutedFlags: boolean[] = [];
  words.forEach((w, i) => {
    const carried = i > 0 && mutedFlags[i - 1] && !words[i - 1].endsWith('*');
    mutedFlags.push(w.startsWith('*') || carried);
  });

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{plain}</span>
      {words.map((raw, i) => {
        const isMuted = mutedFlags[i];
        const word = raw.replace(/\*/g, '');
        return (
          <Fragment key={`${word}-${i}`}>
            <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block ${isMuted ? `italic pr-[0.07em] ${mutedClass}` : ''}`}
                initial={reduce ? false : { y: '105%' }}
                animate={inView || reduce ? { y: '0%' } : undefined}
                transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        );
      })}
    </span>
  );
}

/** Block-level fade and rise, once, when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li';
}) {
  const reduce = useReducedMotion();
  const Tag = as === 'li' ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

function FillWord({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.22, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
export function ScrollFillText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <FillWord key={`${w}-${i}`} word={w} i={i} total={words.length} progress={scrollYProgress} />
        ))}
      </span>
    </p>
  );
}
