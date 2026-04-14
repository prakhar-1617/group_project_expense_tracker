import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Cloud, Key, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const trustFeatures = [
  {
    icon: Lock,
    title: 'Encrypted at rest & in transit',
    description: 'AES-256 encryption keeps your data secure at all times.',
  },
  {
    icon: Cloud,
    title: 'Read-only access',
    description: 'We can never move your money. View-only permissions.',
  },
  {
    icon: Key,
    title: 'Instant logout & device management',
    description: 'Control access from any device, anytime.',
  },
];

const testimonials = [
  {
    quote: 'I finally stopped overspending on subscriptions. FinTrack caught $40/month I was wasting.',
    author: 'Alex R.',
    role: 'Product Designer',
  },
  {
    quote: 'The AI tags are surprisingly accurate. It knows food delivery vs. groceries!',
    author: 'Priya M.',
    role: 'Software Engineer',
  },
];

export default function Security() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);
  const testimonialsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const testimonialEls = testimonialsRef.current.filter(Boolean);

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

      // Trust cards animation
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 40, scale: 0.95, rotate: -6, opacity: 0 },
          {
            y: 0,
            scale: 1,
            rotate: 0,
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

      // Testimonials animation
      testimonialEls.forEach((el, index) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.15,
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-flowing bg-[#0B0C10] z-[60]"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-center mb-16 lg:mb-20"
        >
          Your data is yours.{' '}
          <span className="gradient-text">Protected.</span>
        </h2>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustFeatures.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="glass-card rounded-[24px] p-6 lg:p-8 text-center transition-all duration-500 hover:border-[#A87FF3]/30 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#A87FF3]/10 flex items-center justify-center mx-auto mb-5">
                <feature.icon className="w-7 h-7 text-[#A87FF3]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              ref={(el) => { testimonialsRef.current[index] = el; }}
              className="glass-card rounded-[24px] p-6 lg:p-8 transition-all duration-500 hover:border-[#A87FF3]/20"
            >
              <Quote className="w-8 h-8 text-[#A87FF3]/30 mb-4" />
              <p className="text-white/80 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A87FF3] to-[#7C6BFF] flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {testimonial.author.split(' ')[0][0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-white/50">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
