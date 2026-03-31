import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vibrant premium color palette for charts
  const COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#f43f5e', '#10b981', '#3b82f6', '#d946ef', '#84cc16'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, trendRes] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/transactions/monthly-trend')
        ]);
        const breakdown = summaryRes.data.categoryBreakdown || {};
        const formattedCategories = Object.keys(breakdown).map(key => ({
          name: key, value: breakdown[key]
        })).sort((a, b) => b.value - a.value);
        setCategoryData(formattedCategories);
        setTrendData(trendRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 dark:border-dark-border">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {entry.name}: <span className="text-slate-800 dark:text-white ml-2">₹{entry.value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize your spending patterns and financial health.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card shadow-md shadow-slate-200/50 dark:shadow-black/20 h-[400px] flex flex-col relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-pink-100 dark:bg-pink-500/10 text-pink-500 rounded-lg">
              <PieIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Expenses by Category</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <PieIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>No expense data available</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="card shadow-md shadow-slate-200/50 dark:shadow-black/20 h-[400px] flex flex-col relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Income vs Expenses (6 Months)</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p>No trend data available</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} width={45} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[6,6,0,0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="Expense" fill="url(#expenseGradient)" radius={[6,6,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="card shadow-md shadow-slate-200/50 dark:shadow-black/20 h-[450px] flex flex-col lg:col-span-2 relative overflow-hidden group">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-500 rounded-lg">
              <LineIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Expense Trend Analysis</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <LineIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>No trend data available</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} width={45} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#f59e0b" strokeWidth={4} 
                    dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#f59e0b' }} 
                    activeDot={{ r: 8, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} 
                    fillOpacity={1} fill="url(#lineGradient)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
