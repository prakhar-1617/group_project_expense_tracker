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
          <div className="flex h-[450px] lg:h-[520px]">
            {/* Sidebar */}
            <div className="w-16 lg:w-20 bg-white/[0.03] border-r border-white/5 flex flex-col items-center py-6 gap-2">
              {sidebarItems.map((item, index) => (
                <div
                  key={item.label}
                  ref={(el) => { sidebarItemsRef.current[index] = el; }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    item.active
                      ? 'bg-[#A87FF3]/20 text-[#A87FF3]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 lg:p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Transactions</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">Filter by Date</span>
                    <div className="w-4 h-4 rounded bg-white/10" />
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#A87FF3]/50"
                  />
                </div>
              </div>

              {/* Transaction List */}
              <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="space-y-3">
                  {transactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          <span className={`text-xs font-medium ${
                            tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {tx.amount > 0 ? '+' : '-'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.name}</p>
                          <p className="text-xs text-white/50">{tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-white/50">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Button */}
              <div className="p-4 lg:p-6 border-t border-white/5">
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
