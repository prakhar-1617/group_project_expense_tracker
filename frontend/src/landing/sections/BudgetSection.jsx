import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, ArrowRight, ListChecks } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BudgetSection() {
  const sectionRef = useRef(null);
  const budgetImgRef = useRef(null);
  const transactionsImgRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      scrollTl
        .fromTo(
          textRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          0
        )
        .fromTo(
          budgetImgRef.current,
          { opacity: 0, x: -50, rotate: -5 },
          { opacity: 1, x: 0, rotate: 0, duration: 1 },
          0.2
        )
        .fromTo(
          transactionsImgRef.current,
          { opacity: 0, x: 50, rotate: 5 },
          { opacity: 1, x: 0, rotate: 0, duration: 1 },
          0.3
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="budget-overview"
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-20 py-20"
    >
      <div className="max-w-[1400px] px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Images stacked/layered on the left */}
        <div className="lg:col-span-7 relative h-[400px] sm:h-[500px] flex items-center justify-center">
          {/* Transactions behind */}
          <div 
             ref={transactionsImgRef}
             className="absolute w-[80%] top-[10%] right-0 glass-card-strong rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10"
          >
            <img 
              src="/landing/transactions.png" 
              alt="Transaction List"
              className="w-full h-auto opacity-60 hover:opacity-100 transition-opacity duration-500"
            />
          </div>
          
          {/* Budget Setting on top */}
          <div 
             ref={budgetImgRef}
             className="absolute w-[70%] bottom-[10%] left-0 glass-card-strong rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20"
          >
            <img 
              src="/landing/budget.png" 
              alt="Budget Settings"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Text on the right */}
        <div ref={textRef} className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              Budgetary Control
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight">
            Setting limits has{' '}
            <span className="gradient-text">never been easier</span>
          </h2>

          <p className="text-white/60 leading-relaxed text-lg">
            Monitor your spending in real-time. Our intuitive budget tools give you the discipline you need to reach your financial goals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <ListChecks className="w-5 h-5 text-emerald-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold">Live Tracking</h4>
                <p className="text-white/40 text-sm">Every penny accounted for.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-emerald-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold">Strict Limits</h4>
                <p className="text-white/40 text-sm">Stay within your means.</p>
              </div>
            </div>
          </div>

          <button className="btn-primary flex items-center gap-2 group mt-6 bg-emerald-600 hover:bg-emerald-500 border-emerald-400/50 shadow-emerald-500/20">
            Configure your budget
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
