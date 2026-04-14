import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, CheckCircle2, ArrowRight, Loader2, RefreshCcw, ShieldCheck, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Verification() {
  const { user, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || user?.email;

  // Determine the initial step based on user verification state
  const getInitialStep = () => {
    if (user?.emailVerified && user?.phoneVerified) return 'success';
    if (user?.emailVerified && !user?.phoneVerified) return 'phone';
    return 'email';
  };

  const [step, setStep] = useState(getInitialStep);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // Auto-redirect if everything is verified
  useEffect(() => {
    if (user?.emailVerified && user?.phoneVerified) {
      setStep('success');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // useCallback so the function identity is stable and useEffect can safely depend on `step`
  const handleSendOTP = useCallback(async (currentStep) => {
    const activeStep = currentStep || step;
    if (resendCooldown > 0) return;

    // Skip if already verified
    if (activeStep === 'email' && user?.emailVerified) {
      setStep('phone');
      return;
    }
    if (activeStep === 'phone' && user?.phoneVerified) {
      setStep('success');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please login again.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP(email, activeStep);
      setOtpSent(true);
      setResendCooldown(30);
      toast.success(
        activeStep === 'email'
          ? `OTP sent! Check your backend console/terminal.`
          : `OTP sent! Check your backend console/terminal.`,
        { duration: 5000 }
      );
    } catch (err) {
      if (err?.status === 429 || err?.message?.includes('30 seconds')) {
        toast('Please wait 30 seconds before requesting a new OTP.', { icon: '⏳' });
        setResendCooldown(30);
      } else {
        toast.error(err?.message || 'Failed to send OTP. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
    }
  }, [step, resendCooldown, user, email, sendOTP, navigate]);

  // Auto-send OTP on mount / step change only if not verified yet
  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please login again.');
      navigate('/login');
      return;
    }
    if (step !== 'success') {
      handleSendOTP(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); // Only re-run when step changes

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOTP(email, otp, step);
      toast.success(`${step === 'email' ? 'Email' : 'Phone'} verified successfully! ✅`);
      setOtp('');
      setOtpSent(false);

      if (step === 'email') {
        setStep('phone');
      }
      // If phone verified, the useEffect watching `user` will handle redirect
    } catch (err) {
      toast.error(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };

  const stepInfo = {
    email: {
      icon: <Mail className="text-white w-8 h-8" />,
      title: 'Email Verification',
      subtitle: `We've logged a 6-digit OTP for ${email}`,
      hint: 'Look for the OTP in your backend server console/terminal.',
    },
    phone: {
      icon: <Phone className="text-white w-8 h-8" />,
      title: 'Phone Verification',
      subtitle: `Now verifying the phone linked to your account`,
      hint: 'Look for the OTP in your backend server console/terminal.',
    },
    success: {
      icon: <CheckCircle2 className="text-white w-8 h-8" />,
      title: 'All Verified!',
      subtitle: 'Your account is fully secure.',
      hint: '',
    },
  };

  const current = stepInfo[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050505] transition-colors relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md card glass border-white/40 dark:border-white/10 z-10 p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background icon */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>

        {/* Progress steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-3 mb-8 relative z-10">
            {['email', 'phone'].map((s, i) => {
              const isDone = (s === 'email' && (step === 'phone' || user?.emailVerified));
              const isActive = step === s;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all
                    ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                  {i === 0 && <div className={`w-8 h-0.5 rounded ${isDone ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
            {current.icon}
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            {current.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {current.subtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step !== 'success' ? (
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-5 relative z-10"
            >
              {/* Console hint banner */}
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                >
                  <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    <span className="font-bold">OTP logged to backend console.</span> Open your terminal where the Node.js server is running and look for the line starting with <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">--- [SIMULATION] OTP</code>
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength="6"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={() => handleSendOTP(step)}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {step === 'email' ? `For: ${email}` : 'Phone OTP'}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full btn-primary bg-gradient-to-r from-blue-600 to-indigo-500 py-3.5 text-lg flex justify-center items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Now <ArrowRight className="w-5 h-5" /></>}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  🎉 Both email and phone verified!
                </p>
                <p className="text-sm text-slate-400 mt-1">Redirecting you to the dashboard...</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="w-full btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-lg"
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
