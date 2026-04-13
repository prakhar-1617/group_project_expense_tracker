import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const { predicted, confidence, trend, message, success, code } = prediction;

  if (!success && code === 'insufficient_data') {
    return (
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-dark-bg/50 border border-slate-200 dark:border-dark-border flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-dark-card flex items-center justify-center text-slate-400 mb-3">
          <Target size={24} />
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-white">Analyzing Your Trends</p>
        <p className="text-xs text-slate-500 max-w-[180px] mt-1">{message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border border-primary-100 dark:border-primary-800/30">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Next Month Forecast</p>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          confidence > 80 ? 'bg-emerald-100 text-emerald-600' : 
          confidence > 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {confidence}% Confidence
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-800 dark:text-white">₹{predicted.toLocaleString()}</span>
        <span className={`text-xs font-bold ${trend === 'increasing' ? 'text-rose-500' : 'text-emerald-500'} flex items-center gap-0.5`}>
          {trend === 'increasing' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend === 'increasing' ? 'Upward' : 'Downward'}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">Predicted spending based on 6-month history.</p>
      
      {/* Confidence Bar */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
          <span>Reliability</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              confidence > 80 ? 'bg-emerald-500' : 
              confidence > 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
