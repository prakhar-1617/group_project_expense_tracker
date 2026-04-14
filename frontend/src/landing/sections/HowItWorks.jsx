import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link2, Tag, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Connect',
    description: 'Link your accounts securely. We never store passwords. Your data is encrypted end-to-end.',
    offset: 0,
  },
  {
    number: '02',
    icon: Tag,
    title: 'Tag',
    description: 'AI categorizes transactions automatically. Edit anytime to teach it your preferences.',
    offset: 6,
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Act',
    description: 'Get weekly insights and stay on target. Smart nudges help you build better habits.',
    offset: 2,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !heading || cards.length === 0) return;

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
        gsap.fromTo(
          card,
          { y: 60, rotateX: 10, opacity: 0 },
          {
            y: 0,
            rotateX: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
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
      className="section-flowing bg-[#111318] z-40"
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-center mb-16 lg:mb-20"
        >
          Get started in{' '}
          <span className="gradient-text">three simple steps</span>
        </h2>

        {/* Step Cards */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="glass-card rounded-[24px] p-6 lg:p-8 transition-all duration-500 hover:border-[#A87FF3]/30"
              style={{ 
                marginLeft: `${step.offset}vw`,
                perspective: '1000px',
              }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Left: Number & Content */}
                <div className="flex-1 flex items-start gap-6">
                  {/* Step Number */}
                  <div className="relative">
                    <span className="text-6xl lg:text-7xl font-bold text-transparent bg-clip-text"
                      style={{
                        WebkitTextStroke: '1px rgba(168, 127, 243, 0.3)',
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#A87FF3]/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-[#A87FF3]" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-white/60 leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Right: Visual indicator */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#A87FF3]/10 to-[#7C6BFF]/5 border border-[#A87FF3]/20 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-[#A87FF3]/50" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
