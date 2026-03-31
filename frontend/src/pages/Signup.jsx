import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050505] transition-colors relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-blob"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md card glass border-white/40 dark:border-white/10 z-10 p-8 shadow-2xl relative"
      >
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-2xl opacity-50 animate-pulse-slow"></div>

        <div className="text-center mb-8 relative z-10">
          <motion.div 
            whileHover={{ rotate: [0, 10, -10, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 mx-auto mb-5 relative group"
          >
            <Sparkles className="text-white w-8 h-8 absolute opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
            <span className="text-white text-3xl group-hover:opacity-0 transition-opacity duration-300">🚀</span>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Start tracking your expenses today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1">
            <label className="label">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input type="text" className="input pl-11 py-3 text-base shadow-sm bg-white/60 dark:bg-dark-bg/60 border-slate-200/80 dark:border-dark-border/80 focus:ring-emerald-500/50 focus:border-emerald-500" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input type="email" className="input pl-11 py-3 text-base shadow-sm bg-white/60 dark:bg-dark-bg/60 border-slate-200/80 dark:border-dark-border/80 focus:ring-emerald-500/50 focus:border-emerald-500" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input type="password" className="input pl-11 py-3 text-base shadow-sm bg-white/60 dark:bg-dark-bg/60 border-slate-200/80 dark:border-dark-border/80 focus:ring-emerald-500/50 focus:border-emerald-500" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full btn-primary bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40 py-3.5 text-lg flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400 relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
