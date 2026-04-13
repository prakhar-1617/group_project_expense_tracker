import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { BarChart3, LineChart as LineIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// New Components
import TimeFilter from '../components/Analytics/TimeFilter';
import SummaryCards from '../components/Analytics/SummaryCards';
import CategoryChart from '../components/Analytics/CategoryChart';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Analytics() {
  const [range, setRange] = useState('1m');
  const [data, setData] = useState({ stats: null, categoryData: [] });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  
  // Cache for different ranges to avoid redundant API calls
  const cache = useRef({});

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const res = await API.get('/transactions/monthly-trend');
        setTrendData(res.data);
      } catch (err) {
        console.error('Failed to load trend data', err);
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => {
    const fetchRangeData = async () => {
      // Return from cache if exists
      if (cache.current[range]) {
        setData(cache.current[range]);
        setFiltering(false);
        setLoading(false);
        return;
      }

      setFiltering(true);
      try {
        const res = await API.get(`/transactions/summary?range=${range}`);
        const result = {
          stats: res.data.stats,
          categoryData: res.data.categoryData
        };
        setData(result);
        cache.current[range] = result;
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setFiltering(false);
        setLoading(false);
      }
    };
    fetchRangeData();
  }, [range]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 dark:border-dark-border">
          <p className="font-black text-slate-800 dark:text-white mb-2 uppercase text-xs tracking-tighter">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {entry.name}: <span className="text-slate-800 dark:text-white ml-2">₹{entry.value.toLocaleString()}</span>
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
      className="space-y-8 pb-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-dark-border pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 transition-transform hover:scale-110 duration-500">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Analytics Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1">Real-time financial intelligence</p>
          </div>
        </div>

        <TimeFilter activeRange={range} onRangeChange={setRange} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
           key={range}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           className="space-y-8"
        >
          {/* Summary Cards with Trends */}
          <SummaryCards stats={data.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart Component */}
            <CategoryChart data={data.categoryData} loading={filtering} />

            {/* Static Trends Chart */}
            <motion.div variants={itemVariants} className="card shadow-md shadow-slate-200/50 dark:shadow-black/20 h-[400px] flex flex-col relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-lg shadow-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white leading-none">Monthly Comparison</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Static 6-month historical view</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="99%" height="100%">
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
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[6,6,0,0]} maxBarSize={24} />
                    <Bar dataKey="expense" name="Expense" fill="url(#expenseGradient)" radius={[6,6,0,0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card shadow-md shadow-slate-200/50 dark:shadow-black/20 h-[450px] flex flex-col relative overflow-hidden group">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-500 rounded-lg shadow-sm">
            <LineIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white leading-none">Expense Trend Analysis</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">6-month spending intensity</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative z-10">
          {trendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LineIcon className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest text-center">No trend data available<br/><span className="text-[8px] opacity-70">Add a few months of transactions to see trends</span></p>
            </div>
          ) : (
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} width={45} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f59e0b" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}