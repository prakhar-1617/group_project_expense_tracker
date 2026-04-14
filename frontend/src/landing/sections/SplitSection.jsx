import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SplitSection() {
  const sectionRef = useRef(null);
  const screenshotRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const screenshot = screenshotRef.current;
    const text = textRef.current;

    if (!section || !screenshot || !text) return;

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
          text,
          { x: '-30vw', opacity: 0 },
          { x: 0, opacity: 1, duration: 1 },
          0
        )
        .fromTo(
          screenshot,
          { x: '30vw', opacity: 0, rotateY: -10 },
          { x: 0, opacity: 1, rotateY: 0, duration: 1 },
          0.1
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="split"
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-40"
    >
      <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" 
        style={{ backgroundPosition: '50% 40%' }}
      />

      <div className="relative w-full max-w-[1400px] px-6 lg:px-12 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
        {/* Text Content */}
        <div ref={textRef} className="flex-1 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">
              Group Management
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight">
            Stop the awkward{' '}
            <span className="gradient-text">"who owes what"</span>
          </h2>

          <p className="text-white/60 leading-relaxed">
            Whether it's a dinner with friends or shared rent, our group project expense tracker handles the math for you.
          </p>

          <ul className="space-y-4">
            {[
              'Equal, percentage, or custom splits',
              'One-tap settlement notifications',
              'Balance tracking across multiple groups',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-white/70 font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <button className="btn-primary flex items-center gap-2 group mt-4 bg-blue-600 hover:bg-blue-500 border-blue-400/50 shadow-blue-500/20">
            Start a group split
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Screenshot mockup */}
        <div
          ref={screenshotRef}
          className="flex-1 w-full max-w-[750px] glass-card-strong rounded-[32px] overflow-hidden p-1 shadow-2xl relative group"
        >
          <img 
            src="/landing/split.png" 
            alt="Split Expenses Feature"
            className="w-full h-auto rounded-[28px] transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
