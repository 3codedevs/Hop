import { useEffect } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { scrollToId } from './lib/ui';
import { HeroPlanner } from './components/HeroPlanner';
import { RushHour } from './components/RushHour';
import { StickyJourney } from './components/StickyJourney';
import { LagosMapSection } from './components/LagosMapSection';
import { WhyHopAndFleet } from './components/WhyHopAndFleet';
import { FaqAndFooter } from './components/FaqAndFooter';

export function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#planner"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to trip planner
      </a>
      <Navbar />
      <main>
        <HeroPlanner onJumpToFleet={() => scrollToId('fleet')} />
        <RushHour />
        <StickyJourney />
        <LagosMapSection />
        <WhyHopAndFleet />
      </main>
      <FaqAndFooter />
    </div>
  );
}

export default App;
