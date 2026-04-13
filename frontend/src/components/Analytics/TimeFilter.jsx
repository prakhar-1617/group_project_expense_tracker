import { motion } from 'framer-motion';

const ranges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
];

export default function TimeFilter({ activeRange, onRangeChange }) {
  return (
    <div className="flex bg-slate-100 dark:bg-dark-bg p-1 rounded-2xl border border-slate-200 dark:border-dark-border shadow-inner">
      {ranges.map((range) => {
        const isActive = activeRange === range.value;
        return (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-tighter ${
              isActive 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-white dark:bg-dark-card rounded-xl shadow-md z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{range.label}</span>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-dark-card z-20"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
