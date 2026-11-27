# Motion recipes

One signature set-piece, and quiet motion everywhere else. All recipes use a single easing curve, `cubic-bezier(0.16, 1, 0.3, 1)`, and all of them respect `prefers-reduced-motion`.

React versions use framer-motion (`motion`). A plain-JavaScript version follows each one where it matters, for agents not using React.

## Contents

1. Smooth scroll (Lenis)
2. Headline: masked line rise, with italic emphasis
3. Block fade and rise
4. Paragraph that fills word by word on scroll
5. The set-piece: a sticky, scroll-scrubbed chapter
6. Dark chapter that opens to full width
7. Drawing a route or line
8. Scroll progress bar
9. What to leave out

---

## 1. Smooth scroll (Lenis)

```tsx
import Lenis from 'lenis';

useEffect(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  let raf = 0;
  const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); lenis.destroy(); };
}, []);
```

CSS Lenis needs: `html.lenis, html.lenis body { height: auto; } .lenis.lenis-smooth { scroll-behavior: auto !important; }`

## 2. Headline: masked line rise

Each word rises from behind a mask. Words wrapped in `*asterisks*` are set in italic and a softer tone. Screen readers get the plain sentence once.

```tsx
const EASE = [0.16, 1, 0.3, 1] as const;

export function RevealWords({ text, delay = 0, stagger = 0.045, mutedClass = 'text-muted' }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 }); // observe the unclipped wrapper
  const words = text.split(' ');
  const muted: boolean[] = [];
  words.forEach((w, i) => muted.push(w.startsWith('*') || (i > 0 && muted[i - 1] && !words[i - 1].endsWith('*'))));

  return (
    <span ref={ref}>
      <span className="sr-only">{text.replace(/\*/g, '')}</span>
      {words.map((raw, i) => (
        <Fragment key={i}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${muted[i] ? `italic pr-[0.07em] ${mutedClass}` : ''}`}
              initial={reduce ? false : { y: '105%' }}
              animate={inView || reduce ? { y: '0%' } : undefined}
              transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
            >
              {raw.replace(/\*/g, '')}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  );
}
// <h1><RevealWords text="Every way across Lagos, *ranked for the hour you leave.*" /></h1>
```

Plain JS: wrap each word in `<span class="mask"><span class="word">…</span></span>`, give `.word` `transform: translateY(105%)` and a transition, and add an `in` class from an IntersectionObserver with a per-word `transition-delay`.

## 3. Block fade and rise

```tsx
export function Reveal({ children, delay = 0, y = 28 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
```

Keep the distance small (20 to 30px). Do not tilt, scale or blur blocks on entry.

## 4. Paragraph that fills word by word

Good for one big statement per page.

```tsx
function FillWord({ word, i, total, progress }) {
  const opacity = useTransform(progress, [i / total, (i + 1) / total], [0.22, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export function ScrollFillText({ text, className }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  if (reduce) return <p className={className}>{text}</p>;
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => <FillWord key={i} word={w} i={i} total={words.length} progress={scrollYProgress} />)}
      </span>
    </p>
  );
}
```

## 5. The set-piece: sticky, scroll-scrubbed chapter

A tall section (about 440vh) with a sticky full-screen stage. Scroll progress drives one variable (here, minutes from 06:00 to 22:00), and that variable drives everything on the stage. Because it is tied to scroll position, it scrubs both ways and never plays on its own.

```tsx
export function TimeOfDay() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [minutes, setMinutes] = useState(6 * 60);

  useMotionValueEvent(p, 'change', (v) => {
    const m = Math.round((6 * 60 + v * 16 * 60) / 5) * 5; // snap to 5 minutes
    setMinutes((prev) => (prev === m ? prev : m));
  });

  const dusk = useTransform(p, [0.5, 0.68], [0, 1]);   // photo crossfades
  const night = useTransform(p, [0.8, 0.92], [0, 1]);
  const zoom = useTransform(p, [0, 1], reduce ? [1, 1] : [1.14, 1]);
  const snapshot = dataForHour(Math.floor(minutes / 60)); // your product's table

  return (
    <section ref={ref} data-tone="dark" style={{ height: '440vh' }} className="relative bg-night text-chalk">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: zoom }}>
          <img src="/img/day.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <motion.img src="/img/dusk.jpg" alt="" style={{ opacity: dusk }} className="absolute inset-0 h-full w-full object-cover" />
          <motion.img src="/img/night.jpg" alt="" style={{ opacity: night }} className="absolute inset-0 h-full w-full object-cover" />
        </motion.div>
        {/* legibility gradient, then: chapter label, big clock, side scale, answer card */}
      </div>
      {/* the same information as a list, for screen readers */}
      <ul className="sr-only">{/* one item per hour */}</ul>
    </section>
  );
}
```

Design notes:
- Put the data in a table (one row per step) so the copy is easy to check and edit.
- Show the variable huge (a light-weight clock at `clamp(5.5rem, 17vw, 15rem)`), a scale down one side with the current phase highlighted, and one card with the answer for this moment.
- Animate the card on change with a short fade and rise, keyed on the data row.
- Add a small "Scroll to change the time" hint and the photo credits in a corner.
- On mobile, stack the card's figures into two columns so nothing overflows.

## 6. Dark chapter that opens to full width

```tsx
export function ChapterSection({ children, ...rest }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'start 0.15'] });
  const clipPath = useTransform(p, [0, 1], ['inset(0% 3.5% 0% 3.5% round 28px)', 'inset(0% 0% 0% 0% round 0px)']);
  return <motion.section ref={ref} data-tone="dark" style={reduce ? undefined : { clipPath }} {...rest}>{children}</motion.section>;
}
```

Use it on dark chapters only, so the effect stays special.

## 7. Drawing a route or line

SVG: animate `pathLength` from 0 to 1 once, on entry.

```tsx
<motion.path d={d} fill="none" stroke="var(--color-signal)" strokeWidth={3.5} strokeLinecap="round"
  initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }}
  viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} />
```

Do not combine `pathLength` animation with `vector-effect: non-scaling-stroke`: the dash maths breaks and the line draws in segments. For a responsive path with `preserveAspectRatio="none"`, just use a stroke width in viewBox units.

For a line on a real map, see `real-maps.md` (grow the GeoJSON coordinates over time).

## 8. Scroll progress bar

```tsx
const { scrollYProgress } = useScroll();
const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
<motion.div className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-signal" style={{ scaleX: progress }} />
```

## 9. What to leave out

Each of these is cheap to add, and together they make a page feel like a demo: text scramble or "decoding" effects, blinking colons, pinging dots, infinite marquees, floating gradient blobs, tilt-on-hover cards, magnetic buttons, cursor trails, parallax on every image, staggered entry on every list item, count-up numbers on every stat. Keep at most one of them, and only if it carries meaning.
