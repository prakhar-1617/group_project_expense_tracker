import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIHub from '../components/AI/AIHub';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const noTransactions = summary?.stats?.income === 0 && summary?.stats?.expense === 0;
  const showDashboardReminder = !loading && (noTransactions || (budget?.monthlyBudget || 0) === 0);

  useEffect(() => {
    const savedNote = localStorage.getItem('dashboardNotepad');
    if (savedNote) setNote(savedNote);
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardNotepad', note);
  }, [note]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, budgetRes, txnsRes] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/budget'),
          API.get('/transactions?limit=5')
        ]);
        setSummary(summaryRes.data);
        setBudget(budgetRes.data);
        setRecentTxns(txnsRes.data.transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  const { income: totalIncome = 0, expense: totalExpense = 0, balance = 0 } = summary?.stats || {};
  const { monthlyBudget = 0 } = budget || {};

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, let's track your finances.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/transactions" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2 group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Add Transaction
          </Link>
        </motion.div>
      </motion.div>

      {showDashboardReminder && (
        <motion.div variants={itemVariants} className="card border border-amber-200/80 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-950/20 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-amber-950 dark:text-amber-200">Reminder</h2>
            {noTransactions && (
              <p className="text-sm text-slate-700 dark:text-slate-300">You have not added any transactions yet. Add your first expense or income to begin tracking your finances.</p>
            )}
            {(budget?.monthlyBudget || 0) === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300">Set a monthly budget to unlock spending insights and make your dashboard more useful.</p>
            )}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance"   value={`₹${balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}      icon={<Wallet />}      color="indigo" />
        <StatCard title="Total Income"    value={`₹${totalIncome.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}   icon={<TrendingUp />}  color="emerald" />
        <StatCard title="Total Expenses"  value={`₹${totalExpense.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}  icon={<TrendingDown />} color="red" />
        <StatCard title="Monthly Budget"  value={`₹${monthlyBudget.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} icon={<Target />}      color="amber"
          sub={monthlyBudget > 0 ? `${((totalExpense / monthlyBudget) * 100).toFixed(1)}% used` : 'No budget set'} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIHub />

      <motion.div variants={itemVariants} className="card relative z-10 overflow-hidden flex flex-col group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-800/70 dark:to-slate-900/70 z-0"></div>
        <div className="relative z-10 p-6 h-full flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Quick Notepad</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Jot down reminders or ideas for your budgeting.</p>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            rows={8}
            className="w-full min-h-[180px] resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
          />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{note.length} characters</span>
            <span>Auto-saved locally</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card relative z-10 overflow-hidden flex flex-col group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-fuchsia-500/5 z-0"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-8 text-center">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-primary-100 to-fuchsia-100 dark:from-primary-900/30 dark:to-fuchsia-900/30 rounded-3xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 shadow-inner border border-white/50 dark:border-white/5 cursor-pointer"
          >
            <Target className="w-10 h-10" />
          </motion.div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Manage Your Budget</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-[200px]">Set limits and track your financial goals to build wealth over time.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-4">
            <Link to="/budget" className="btn-secondary w-full group relative overflow-hidden inline-block text-center flex-1 py-3">
              <span className="relative z-10 block">Configure Budget</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
      </div>

      {/* Recent Transactions List */}
      <motion.div variants={itemVariants} className="card z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {recentTxns.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">No transactions yet. Start by adding one!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {recentTxns.map((txn) => (
              <div key={txn._id} className="py-4 flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${txn.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                    <ArrowLeftRight size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors">{txn.description || txn.category}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(txn.date).toLocaleDateString()} • {txn.category}</p>
                  </div>
                </div>
                <div className={`font-black text-lg ${txn.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                  {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
