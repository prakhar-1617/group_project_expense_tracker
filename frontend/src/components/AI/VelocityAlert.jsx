import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

export default function VelocityAlert({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-border group group-hover:border-primary-300 transition-colors">
        <Sparkles className="text-slate-200 dark:text-dark-border mb-2 group-hover:text-primary-300" />
        <p className="text-slate-400 text-sm font-medium text-center">No unusual spending patterns detected today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={idx}
          className={`p-4 rounded-2xl flex gap-3 items-start border shadow-sm ${
            alert.level === 'critical' 
              ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300' 
              : 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300'
          }`}
        >
          <div className="mt-1">
            {alert.level === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <p className="text-sm font-black leading-none mb-1">{alert.title}</p>
            <p className="text-xs font-semibold opacity-90 leading-relaxed">{alert.message}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
