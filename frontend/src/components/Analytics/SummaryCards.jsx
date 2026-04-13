import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function SummaryCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Selected Period Expense',
      value: stats.expense,
      change: stats.expenseChange,
      icon: TrendingDown,
      color: 'rose',
      isExpense: true
    },
    {
      label: 'Selected Period Income',
      value: stats.income,
      change: stats.incomeChange,
      icon: TrendingUp,
      color: 'emerald',
      isExpense: false
    },
    {
      label: 'Net Balance',
      value: stats.balance,
      change: null, // No change for balance currently
      icon: Wallet,
      color: 'primary',
      isExpense: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card overflow-hidden group relative"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150`}></div>
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`p-3 rounded-2xl bg-${card.color}-100 dark:bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-400`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">₹{card.value.toLocaleString()}</h3>
            </div>
          </div>

          {card.change !== null && (
            <div className="flex items-center gap-2 relative z-10">
              <div className={`px-2 py-0.5 rounded-lg flex items-center gap-0.5 text-[10px] font-black uppercase ${
                card.change > 0 
                  ? (card.isExpense ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')
                  : (!card.isExpense ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')
              }`}>
                {card.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(card.change)}%
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">vs previous period</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
