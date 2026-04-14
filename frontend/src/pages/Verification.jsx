import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, CheckCircle2, ArrowRight, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Verification() {
  const { user, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || user?.email;

  const [step, setStep] = useState(() => {
    if (user?.emailVerified && !user?.phoneVerified) return 'phone';
    if (user?.emailVerified && user?.phoneVerified) return 'success';
    return 'email';
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(3);

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

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please login again.');
      navigate('/login');
    } else if (step !== 'success') {
      // Auto-send first OTP on mount if not already sent/verified
      // We only send if the user isn't already verified for this step
      handleSendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, navigate]); // Removed handleSendOTP from deps to prevent loops

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (resendCooldown > 0) return;
    
    // Safety check: if user already has this factor verified, skip sending and move to next step
    if (step === 'email' && user?.emailVerified) {
      setStep('phone');
      return;
    }
    if (step === 'phone' && user?.phoneVerified) {
      setStep('success');
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP(email, step);
      toast.success(`OTP sent to your ${step}!`);
      setResendCooldown(30);
      setAttempts(3);
    } catch (err) {
      // Don't toast 429 errors silently if it was an auto-send, or handle gracefully
      if (err.status !== 429) {
        toast.error(err.message || 'Failed to send OTP');
      } else {
        console.log('OTP cooldown active');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOTP(email, otp, step);
      toast.success(`${step === 'email' ? 'Email' : 'Phone'} verified!`);
      setOtp('');
      
      // Step state will be updated by the useEffect checking 'user'
      if (step === 'email') {
        setStep('phone');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050505] transition-colors relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md card glass border-white/40 dark:border-white/10 z-10 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            {step === 'email' ? <Mail className="text-white w-8 h-8" /> : step === 'phone' ? <Phone className="text-white w-8 h-8" /> : <CheckCircle2 className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight uppercase">
            {step === 'success' ? 'Verified!' : `${step} Verification`}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {step === 'email' ? `We've sent a 6-digit code to ${email}` : step === 'phone' ? `Now verify your phone number associated with ${email}` : 'Your account is now fully verified and secure.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step !== 'success' ? (
            <motion.form 
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleVerify} 
              className="space-y-6 relative z-10"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength="6"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                
                <div className="flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Random OTP in Console</span>
                </div>
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
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="py-4">
                <p className="text-slate-600 dark:text-slate-300">You are all set. Redirecting you to the dashboard...</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full btn-primary bg-emerald-500 py-3.5 text-lg"
              >
                Go to Dashboard
              </button>
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
