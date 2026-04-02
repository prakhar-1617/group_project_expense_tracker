import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon, color, sub, trend }) {
  const colors = {
    indigo: 'from-primary-500 to-fuchsia-500 shadow-primary-500/30 text-primary-50',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-500/30 text-emerald-50',
    red: 'from-rose-500 to-orange-500 shadow-rose-500/30 text-rose-50',
    amber: 'from-amber-400 to-orange-500 shadow-amber-500/30 text-amber-50',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/30 text-violet-50',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="card relative overflow-hidden group cursor-pointer"
    >
      {/* Decorative background blob */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${colors[color] || colors.indigo} opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1.5 tracking-tight">{value}</p>
          {sub && <p className="text-xs font-medium text-slate-500 mt-2">{sub}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100/50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
              <span>{trend >= 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} flex items-center justify-center shadow-lg transition-all duration-300`}
        >
          <span className="text-white text-xl">{icon}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
