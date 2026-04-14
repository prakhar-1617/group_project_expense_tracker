import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Receipt, Target, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Receipt,
    title: 'Track',
    description: 'Auto-capture every spend. Categorize without lifting a finger.',
    image: '/hero_phone_ui.jpg',
  },
  {
    icon: Target,
    title: 'Budget',
    description: 'Set weekly limits. Get nudges before you overspend.',
    image: '/feature_budget.jpg',
    highlighted: true,
  },
  {
    icon: BarChart3,
    title: 'Analyze',
    description: 'See trends, spot waste, and optimize your cash flow.',
    image: '/feature_analyze.jpg',
  },
];

export default function Features() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !heading || cards.length === 0) return;

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
          heading,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          cards[0],
          { x: '-50vw', rotateY: 35, opacity: 0 },
          { x: 0, rotateY: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          cards[1],
          { y: '100vh', scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(
          cards[2],
          { x: '50vw', rotateY: -35, opacity: 0 },
          { x: 0, rotateY: 0, opacity: 1, ease: 'none' },
          0
        );

      // Phase 2: SETTLE (30-70%) - Hold positions

      
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="section-pinned bg-[#0B0C10] flex flex-col items-center justify-center z-20"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />

      {/* Heading */}
      <h2
        ref={headingRef}
        className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-center mb-12 lg:mb-16 px-6"
      >
        Everything you need to{' '}
        <span className="gradient-text">master your money</span>
      </h2>

      {/* Feature Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 px-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            ref={(el) => { cardsRef.current[index] = el; }}
            className={`relative w-[280px] sm:w-[320px] lg:w-[26vw] lg:max-w-[360px] h-[420px] lg:h-[520px] rounded-[28px] overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
              feature.highlighted
                ? 'glass-card-strong border-t-2 border-t-[#A87FF3]'
                : 'glass-card'
            }`}
            style={{ perspective: '1000px' }}
          >
            {/* Highlighted badge */}
            {feature.highlighted && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#A87FF3]/20 border border-[#A87FF3]/30">
                <span className="text-[10px] font-semibold text-[#A87FF3] uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6 lg:p-8 h-full flex flex-col">
              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#A87FF3]/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-[#A87FF3]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* UI Thumbnail */}
              <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={feature.image}
                  alt={`${feature.title} feature`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/60 to-transparent" />
              </div>
            </div>

            {/* Hover glow */}
            <div className="absolute -inset-px bg-gradient-to-br from-[#A87FF3]/0 via-[#A87FF3]/0 to-[#A87FF3]/10 rounded-[28px] opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
