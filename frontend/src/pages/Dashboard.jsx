import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);

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

  const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary || {};
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

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance"   value={`₹${balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}      icon={<Wallet />}      color="indigo" />
        <StatCard title="Total Income"    value={`₹${totalIncome.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}   icon={<TrendingUp />}  color="emerald" />
        <StatCard title="Total Expenses"  value={`₹${totalExpense.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}  icon={<TrendingDown />} color="red" />
        <StatCard title="Monthly Budget"  value={`₹${monthlyBudget.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} icon={<Target />}      color="amber"
          sub={monthlyBudget > 0 ? `${((totalExpense / monthlyBudget) * 100).toFixed(1)}% used` : 'No budget set'} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 card relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-primary-500 to-fuchsia-500"></span>
              Recent Transactions
            </h2>
            <motion.div whileHover={{ scale: 1.05, x: 2 }} whileTap={{ scale: 0.95 }}>
              <Link to="/transactions" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {recentTxns.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No recent transactions found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTxns.map((txn) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4, scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  key={txn._id} 
                  className="flex items-center justify-between p-4 bg-white dark:bg-dark-bg/50 border border-slate-100 dark:border-dark-border hover:border-primary-100 dark:hover:border-primary-900/50 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${txn.type === 'income' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-500/10 dark:to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                      {txn.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-base">{txn.description}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • <span className="text-primary-600 dark:text-primary-400">{txn.category}</span></p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${txn.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Link to="/budget" className="btn-secondary w-full group relative overflow-hidden inline-block text-center flex-1 py-3">
                <span className="relative z-10 block">Configure Budget</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
