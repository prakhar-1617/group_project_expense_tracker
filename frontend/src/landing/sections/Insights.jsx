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
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
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

      // Phase 3: EXIT (70-100%)
      scrollTl
        .fromTo(
          analytics,
          { y: 0, scale: 1, opacity: 1 },
          { y: '-16vh', scale: 0.92, opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          text,
          { x: 0, opacity: 1 },
          { x: '18vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
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
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">
              Spending Trends
            </h4>
            <div className="relative h-[180px] lg:h-[220px]">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={50 * i + 25}
                    x2="600"
                    y2={50 * i + 25}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Area gradient */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A87FF3" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#A87FF3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d="M0,150 Q75,120 150,130 T300,80 T450,100 T600,60 L600,200 L0,200 Z"
                  fill="url(#areaGradient)"
                />
                
                {/* Line */}
                <path
                  ref={chartRef}
                  d="M0,150 Q75,120 150,130 T300,80 T450,100 T600,60"
                  fill="none"
                  stroke="#A87FF3"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Data points */}
                {[
                  [0, 150],
                  [150, 130],
                  [300, 80],
                  [450, 100],
                  [600, 60],
                ].map(([x, y], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#A87FF3"
                    stroke="#0B0C10"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              
              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span>JAN</span>
                <span>MAR</span>
                <span>JUN</span>
                <span>SEP</span>
                <span>DEC</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                ref={(el) => { metricsRef.current[index] = el; }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#A87FF3]/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="w-4 h-4 text-[#A87FF3]" />
                  <span className="text-xs text-white/50">{metric.label}</span>
                </div>
                <p className="text-xl lg:text-2xl font-semibold text-white mb-1">
                  {metric.value}
                </p>
                <span className="text-xs text-green-400">{metric.change}</span>
              </div>
            ))}
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
