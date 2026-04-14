import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Shield, Brain, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const microFeatures = [
  { icon: Shield, label: 'Bank-grade encryption' },
  { icon: Brain, label: 'Smart AI tags' },
  { icon: Zap, label: 'Real-time sync' },
];

export default function Hero() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const phoneRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);
  const microRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const phone = phoneRef.current;
    const text = textRef.current;
    const cta = ctaRef.current;
    const micro = microRef.current;

    if (!section || !card || !phone || !text || !cta || !micro) return;

    const ctx = gsap.context(() => {
      // Initial load animation
      const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      loadTl
        .fromTo(
          card,
          { y: 60, scale: 0.96, rotateX: 10, opacity: 0 },
          { y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 1 }
        )
        .fromTo(
          phone,
          { x: 80, rotateZ: 6, opacity: 0 },
          { x: 0, rotateZ: 0, opacity: 1, duration: 0.9 },
          '-=0.6'
        )
        .fromTo(
          text.children,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          cta.children,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
          '-=0.3'
        )
        .fromTo(
          micro.children,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.4 },
          '-=0.2'
        );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
          onLeaveBack: () => {
            // Reset all elements when scrolling back to top
            gsap.set([card, phone, text, cta, micro], {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotateX: 0,
              rotateZ: 0,
            });
          },
        },
      });

      // Phase 1: ENTRANCE (0-30%) - Hold settle state
      // Phase 2: SETTLE (30-70%) - Static
      
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-10"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      {/* Hero Card */}
      <div
        ref={cardRef}
        className="relative w-[86vw] max-w-[1100px] min-h-[520px] max-h-[600px] glass-card-strong rounded-[34px] overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#A87FF3]/5 via-transparent to-[#7C6BFF]/5" />

        <div className="relative h-full flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 gap-8">
          {/* Left Text Content */}
          <div ref={textRef} className="flex-1 max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A87FF3]/10 border border-[#A87FF3]/20">
              <span className="w-2 h-2 rounded-full bg-[#A87FF3] animate-pulse" />
              <span className="text-xs font-medium text-[#A87FF3]">
                AI-Powered Finance
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.1]">
              Track Smarter.
              <br />
              <span className="gradient-text">Spend Better.</span>
            </h1>

            <p className="text-base lg:text-lg text-white/60 leading-relaxed">
              AI-powered expense tracking that learns your habits and keeps your
              budget on autopilot.
            </p>

            <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
              <button className="btn-primary flex items-center gap-2 group">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="btn-secondary">See how it works</button>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div
            ref={phoneRef}
            className="relative w-[200px] sm:w-[240px] lg:w-[280px] flex-shrink-0"
          >
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="/landing/dashboard.png"
                alt="FinTrack App Dashboard"
                className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
              />
              {/* Bezel overlay */}
              <div className="absolute inset-0 rounded-[28px] border-[1px] border-white/20 pointer-events-none" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#A87FF3]/20 blur-3xl rounded-full -z-10" />
          </div>
        </div>

        {/* Bottom Micro Features */}
        <div
          ref={microRef}
          className="absolute bottom-0 left-0 right-0 px-8 lg:px-12 py-5 border-t border-white/5 bg-white/[0.02]"
        >
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-10">
            {microFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2.5 text-white/50"
              >
                <feature.icon className="w-4 h-4 text-[#A87FF3]" />
                <span className="text-xs font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
