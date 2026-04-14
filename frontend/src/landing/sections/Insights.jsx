import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, TrendingDown, Target, PiggyBank } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  { label: 'Total Spent', value: '$12,345', change: '+12%', icon: TrendingDown },
  { label: 'Savings Rate', value: '18%', change: '+3%', icon: Target },
  { label: 'Top Category', value: 'Investments', change: '32%', icon: PiggyBank },
];

export default function Insights() {
  const sectionRef = useRef(null);
  const analyticsRef = useRef(null);
  const textRef = useRef(null);
  const chartRef = useRef(null);
  const metricsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const analytics = analyticsRef.current;
    const text = textRef.current;
    const chart = chartRef.current;
    const metricEls = metricsRef.current.filter(Boolean);

    if (!section || !analytics || !text) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Phase 1: ENTRANCE (0-30%)
      scrollTl
        .fromTo(
          analytics,
          { x: '-70vw', rotateY: 22, scale: 0.9, opacity: 0 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          text,
          { x: '35vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.08
        );

      // Chart line draw
      if (chart) {
        const pathLength = chart.getTotalLength();
        gsap.set(chart, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        scrollTl.to(
          chart,
          { strokeDashoffset: 0, ease: 'none' },
          0
        );
      }

      // Metrics stagger
      metricEls.forEach((el, i) => {
        scrollTl.fromTo(
          el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.18 + i * 0.04
        );
      });

      // Phase 2: SETTLE (30-70%) - Hold

      
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-50"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow-strong opacity-50 pointer-events-none" 
        style={{ backgroundPosition: '50% 60%' }}
      />

      <div className="relative w-full max-w-[1400px] px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Analytics Card */}
        <div
          ref={analyticsRef}
          className="flex-1 w-full max-w-[750px] glass-card-strong rounded-[32px] overflow-hidden p-6 lg:p-8"
          style={{ perspective: '1000px' }}
        >
          {/* Chart Area */}
          <div className="relative group p-1 bg-white/5 rounded-[32px] overflow-hidden analytics-image-container">
            <img 
              src="/landing/analytics.png" 
              alt="FinTrack Analytics Insights"
              className="w-full h-auto rounded-[28px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
            />
            {/* Subtle gloss overlay to make it look embedded in the dark UI */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
          </div>
        </div>

        {/* Right Text Panel */}
        <div ref={textRef} className="flex-1 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A87FF3]/10 border border-[#A87FF3]/20">
            <TrendingDown className="w-3.5 h-3.5 text-[#A87FF3]" />
            <span className="text-xs font-medium text-[#A87FF3]">
              AI Analytics
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight">
            Insights that{' '}
            <span className="gradient-text">actually change</span> behavior
          </h2>

          <ul className="space-y-4">
            {[
              'Spending velocity alerts',
              'Category trends vs. your goals',
              'Monthly forecast + savings opportunities',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#A87FF3]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#A87FF3]" />
                </div>
                <span className="text-white/70">{item}</span>
              </li>
            ))}
          </ul>

          <button className="btn-primary flex items-center gap-2 group mt-4">
            See a sample report
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
