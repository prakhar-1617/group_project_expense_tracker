import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const phoneRef = useRef(null);
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const phone = phoneRef.current;
    const form = formRef.current;

    if (!section || !card || !phone || !form) return;

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
          card,
          { y: '80vh', scale: 0.9, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          phone,
          { x: '20vw', rotateZ: 8, opacity: 0 },
          { x: 0, rotateZ: 0, opacity: 1, ease: 'none' },
          0.1
        )
        .fromTo(
          form.children,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.03, ease: 'none' },
          0.15
        );

      // Phase 2: SETTLE (30-70%) - Hold

      
    }, section);

    return () => ctx.revert();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        navigate('/signup');
      }, 1500);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-[#0B0C10] flex items-center justify-center z-[80]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow-strong opacity-50 pointer-events-none" 
        style={{ backgroundPosition: '50% 45%' }}
      />

      {/* CTA Card */}
      <div
        ref={cardRef}
        className="relative w-[86vw] max-w-[980px] min-h-[420px] glass-card-strong rounded-[34px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#A87FF3]/5 via-transparent to-[#7C6BFF]/5" />

        <div className="relative h-full flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 gap-8">
          {/* Left Form Content */}
          <div ref={formRef} className="flex-1 max-w-md space-y-6">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight">
              Start tracking your finances with{' '}
              <span className="gradient-text">AI today</span>
            </h2>

            <p className="text-white/60 leading-relaxed">
              Join thousands who've stopped guessing and started saving. 
              No credit card required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#A87FF3]/50 transition-colors"
                  disabled={isSubmitted}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full btn-primary flex items-center justify-center gap-2 group ${
                  isSubmitted ? 'bg-green-500 hover:bg-green-500' : ''
                }`}
              >
                {isSubmitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    You're on the list!
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-white/40">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Right Phone Mockup */}
          <div
            ref={phoneRef}
            className="relative w-[180px] sm:w-[200px] lg:w-[220px] flex-shrink-0"
          >
            <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/cta_phone_ui.jpg"
                alt="FinTrack Success State"
                className="w-full h-auto"
              />
              {/* Phone bezel overlay */}
              <div className="absolute inset-0 rounded-[24px] border-[6px] border-[#1a1a1a] pointer-events-none" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#A87FF3]/20 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
