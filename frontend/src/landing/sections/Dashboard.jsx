import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Search, LayoutDashboard, Wallet, PieChart, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Wallet, label: 'Transactions', active: false },
  { icon: PieChart, label: 'Analytics', active: false },
  { icon: Sparkles, label: 'AI Hub', active: false },
];

const transactions = [
  { name: 'Starbucks Coffee', category: 'Food', amount: -15.5, date: 'Today' },
  { name: 'Uber Ride', category: 'Transport', amount: -28.75, date: 'Today' },
  { name: 'Amazon Purchase', category: 'Shopping', amount: -124.99, date: 'Yesterday' },
  { name: 'Freelance Payment', category: 'Income', amount: 2500, date: 'Yesterday' },
  { name: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, date: '2 days ago' },
];

export default function Dashboard() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const dashboardRef = useRef(null);
  const sidebarItemsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const dashboard = dashboardRef.current;
    const sidebarEls = sidebarItemsRef.current.filter(Boolean);

    if (!section || !text || !dashboard) return;

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
          text,
          { x: '-40vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          dashboard,
          { x: '60vw', rotateY: -18, scale: 0.92, opacity: 0 },
          { x: 0, rotateY: 0, scale: 1, opacity: 1, ease: 'none' },
          0.05
        );

      // Sidebar items stagger
      sidebarEls.forEach((el, i) => {
        scrollTl.fromTo(
          el,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.18 + i * 0.03
        );
      });

      // Phase 2: SETTLE (30-70%) - Hold

      
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dashboard"
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-30"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-70 pointer-events-none" 
        style={{ backgroundPosition: '50% 55%' }}
      />

      <div className="relative w-full max-w-[1400px] px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Text Panel */}
        <div ref={textRef} className="flex-1 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#A87FF3]" />
            <span className="text-xs font-medium text-white/70">
              Web Dashboard
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight">
            Your financial{' '}
            <span className="gradient-text">command center</span>
          </h2>

          <ul className="space-y-4">
            {[
              'Multi-account balances in one view',
              'Instant search + smart filters',
              'Recurring charges detection',
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
            Explore the dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Right Dashboard Card */}
        <div
          ref={dashboardRef}
          className="flex-1 w-full max-w-[700px] glass-card-strong rounded-[32px] overflow-hidden"
          style={{ perspective: '1000px' }}
        >
          <div className="relative group p-1 bg-white/5 rounded-[32px]">
            <img 
              src="/landing/dashboard.png" 
              alt="FinTrack Dashboard Overview"
              className="w-full h-auto rounded-[28px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
            {/* Subtle glow overlay */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-[#A87FF3]/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
