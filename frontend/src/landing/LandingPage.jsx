import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Features from './sections/Features';
import Dashboard from './sections/Dashboard';
import HowItWorks from './sections/HowItWorks';
import Insights from './sections/Insights';
import Security from './sections/Security';
import Pricing from './sections/Pricing';
import SplitSection from './sections/SplitSection';
import BudgetSection from './sections/BudgetSection';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  useEffect(() => {
    // Add landing-body class to body
    document.body.classList.add('landing-body');

    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );

            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );

            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    return () => {
      document.body.classList.remove('landing-body');
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#0B0C10] min-h-screen text-white">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <main className="relative">
        <Hero />
        <Features />
        <Dashboard />
        <SplitSection />
        <BudgetSection />
        <HowItWorks />
        <Insights />
        <Security />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;
