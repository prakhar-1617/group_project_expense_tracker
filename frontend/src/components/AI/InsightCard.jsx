import { motion } from 'framer-motion';
import { PieChart, Zap, TrendingUp } from 'lucide-react';

export default function InsightCard({ insights }) {
  if (!insights) return null;
  const { topCategory, savingsPercent } = insights;

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="p-4 rounded-2xl bg-white dark:bg-dark-bg/30 border border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2 mb-2">
          <PieChart size={16} className="text-primary-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Category</span>
        </div>
        {topCategory ? (
          <div>
            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{topCategory.name}</p>
            <p className="text-xs font-bold text-slate-500">₹{topCategory.amount.toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-400">---</p>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-dark-bg/30 border border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Savings Rate</span>
        </div>
        <p className="text-lg font-black text-slate-800 dark:text-white">{savingsPercent}%</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="h-1 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, savingsPercent)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
