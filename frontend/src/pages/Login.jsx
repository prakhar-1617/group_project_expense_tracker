import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('demo@fintrack.app');
  const [password, setPassword] = useState('demo1234');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isForgotPassword) {
      toast.success('Password reset link sent to your email!');
      setIsForgotPassword(false);
      return;
    }
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050505] transition-colors relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/20 to-fuchsia-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-blob"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md card glass border-white/40 dark:border-white/10 z-10 p-8 shadow-2xl relative"
      >
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-primary-400 to-fuchsia-500 rounded-full blur-2xl opacity-50 animate-pulse-slow"></div>
        
        <div className="text-center mb-8 relative z-10">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary-500/40 mx-auto mb-5 relative group"
          >
            <Sparkles className="text-white w-8 h-8 absolute opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
            <span className="text-white text-3xl group-hover:opacity-0 transition-opacity duration-300">💰</span>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isForgotPassword ? "Enter your email to receive a reset link" : "Sign in to manage your finances"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">Demo Mode Ready</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="label">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="email"
                className="input pl-11 py-3 text-base shadow-sm bg-white/60 dark:bg-dark-bg/60 border-slate-200/80 dark:border-dark-border/80"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="label mb-0">Password</label>
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  className="input pl-11 py-3 text-base shadow-sm bg-white/60 dark:bg-dark-bg/60 border-slate-200/80 dark:border-dark-border/80"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isForgotPassword}
                />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-lg flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>{isForgotPassword ? 'Send Reset Link' : 'Sign In'} <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
        </form>

        {isForgotPassword ? (
          <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400 relative z-10">
            Remember your password?{' '}
            <button type="button" onClick={() => setIsForgotPassword(false)} className="text-primary-600 dark:text-primary-400 font-bold hover:underline hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Back to login
            </button>
          </p>
        ) : (
          <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400 relative z-10">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-bold hover:underline hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Sign up now
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
