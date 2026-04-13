import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Target, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Budget() {
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const [budgetRes, summaryRes] = await Promise.all([
          API.get('/budget'), API.get('/transactions/summary')
        ]);
        setBudget(budgetRes.data.monthlyBudget || 0);
        setSpent(summaryRes.data.totalExpense || 0);
      } catch { toast.error('Failed to load budget data'); }
      finally { setLoading(false); }
    };
    fetchBudgetData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.put('/budget', { monthlyBudget: Number(budget) });
      toast.success('Budget updated successfully');
    } catch { toast.error('Failed to update budget'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/50"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = budget > 0 && spent > budget;
  const isNearLimit = budget > 0 && percentage >= 80 && !isOverBudget;
  const remaining = budget > 0 ? (budget - spent) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
          <Target className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Budget Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your monthly spending limit to achieve financial goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 card shadow-sm space-y-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white relative z-10 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-primary-500"></span> Set Limit
          </h2>
          <form onSubmit={handleSave} className="space-y-5 relative z-10 text-center">
            <div>
              <label className="label text-left">Monthly Spending Limit (₹)</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                <input type="number" min="0" step="100" value={budget || ''}
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : 0)}
                  className="w-full bg-slate-50 dark:bg-dark-bg border-2 border-slate-200 dark:border-dark-border focus:border-primary-500 dark:focus:border-primary-500 rounded-2xl pl-10 pr-4 py-4 text-3xl font-black text-slate-800 dark:text-white transition-all shadow-inner" required />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} className="w-full btn-primary py-3.5 text-lg flex justify-center items-center gap-2">
              {saving ? 'Saving...' : <><Save size={20} /> Update Budget</>}
            </motion.button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 card shadow-sm space-y-8"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-fuchsia-500"></span> Budget Overview
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</p>
                <p className={`text-4xl font-black mt-1 tracking-tight ${isOverBudget ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>₹{spent.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Limit</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1 tracking-tight">₹{budget.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
              </div>
            </div>

            <div className="relative h-6 w-full bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-dark-border/50 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full relative overflow-hidden ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-rose-600' : isNearLimit ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-150%]"></div>
              </motion.div>
            </div>
            
            <div className="flex justify-between text-sm font-bold">
              <span className={isOverBudget ? 'text-rose-500' : 'text-slate-500'}>{percentage.toFixed(1)}% used</span>
              <span className={isOverBudget ? 'text-rose-500' : 'text-emerald-500'}>{budget === 0 ? 'No budget set' : remaining >= 0 ? `₹${remaining.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} remaining` : `₹${Math.abs(remaining).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} over budget`}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-dark-border">
            {budget === 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-500 bg-slate-50 dark:bg-dark-bg p-5 rounded-2xl border border-slate-200/50 dark:border-dark-border/50">
                <div className="p-3 bg-white dark:bg-dark-card rounded-full shadow-sm"><Target className="w-8 h-8 text-primary-500" /></div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200">No Budget Set</h4>
                  <p className="text-sm mt-1">Set a budget to track your remaining allowance.</p>
                </div>
              </div>
            ) : isOverBudget ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-rose-600 bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm">
                <div className="p-3 bg-white dark:bg-dark-card rounded-full shadow-sm text-rose-500"><AlertTriangle className="w-8 h-8" /></div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold">Budget Exceeded!</h4>
                  <p className="text-sm mt-1 font-medium">You have exceeded your monthly budget by ₹{Math.abs(remaining).toFixed(2)}. Consider cutting down on non-essential expenses.</p>
                </div>
              </div>
            ) : isNearLimit ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20 shadow-sm">
                <div className="p-3 bg-white dark:bg-dark-card rounded-full shadow-sm text-amber-500"><AlertTriangle className="w-8 h-8" /></div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold">Nearing Limit</h4>
                  <p className="text-sm mt-1 font-medium">You've used {percentage.toFixed(0)}% of your budget. Slow down your spending.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                <div className="p-3 bg-white dark:bg-dark-card rounded-full shadow-sm text-emerald-500"><CheckCircle2 className="w-8 h-8" /></div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold">On Track</h4>
                  <p className="text-sm mt-1 font-medium">You're doing great! You have ₹{remaining.toFixed(2)} remaining for this month.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
