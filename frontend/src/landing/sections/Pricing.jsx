import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 'Free',
    period: '',
    description: 'Perfect for getting started',
    features: [
      'Track up to 200 transactions/month',
      'Basic categorization',
      '2 bank accounts',
      'Monthly reports',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    price: '$9',
    period: '/month',
    description: 'For serious budgeters',
    features: [
      'Unlimited transactions',
      'AI-powered insights',
      'Unlimited bank accounts',
      'Weekly reports & forecasts',
      'Smart budgeting alerts',
      'Export to CSV/PDF',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    icon: Building2,
    price: '$29',
    period: '/month',
    description: 'For teams & professionals',
    features: [
      'Everything in Pro',
      'Team access (up to 5)',
      'API access',
      'Custom integrations',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Pricing() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !heading) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        heading,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation
      cards.forEach((card, index) => {
        const isHighlighted = plans[index].highlighted;
        gsap.fromTo(
          card,
          { y: 50, scale: isHighlighted ? 0.96 : 1, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.1,
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="section-flowing bg-[#0B0C10] z-[70]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" 
        style={{ backgroundPosition: '50% 20%' }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-center mb-16 lg:mb-20"
        >
          Simple{' '}
          <span className="gradient-text">pricing</span>
        </h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              ref={(el) => { cardsRef.current[index] = el; }}
              className={`relative rounded-[28px] p-6 lg:p-8 transition-all duration-500 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'glass-card-strong border-t-2 border-t-[#A87FF3]'
                  : 'glass-card'
              }`}
            >
              {/* Highlighted badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#A87FF3] text-xs font-semibold text-white">
                  Recommended
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.highlighted ? 'bg-[#A87FF3]/20' : 'bg-white/5'
                }`}>
                  <plan.icon className={`w-6 h-6 ${
                    plan.highlighted ? 'text-[#A87FF3]' : 'text-white/60'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-white/50">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/50">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'bg-[#A87FF3]/20' : 'bg-white/10'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.highlighted ? 'text-[#A87FF3]' : 'text-white/60'
                      }`} />
                    </div>
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
