import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#f43f5e', '#10b981', '#3b82f6', '#d946ef', '#84cc16'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 dark:border-dark-border">
        <p className="font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter text-xs">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data, loading }) {
  return (
    <div className="card shadow-white/10 h-[400px] flex flex-col relative overflow-hidden group">
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-pink-100 dark:bg-pink-500/10 text-pink-500 rounded-lg shadow-sm">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white leading-none">Spending by Category</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Breakdown for selected period</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-primary-500 animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <PieIcon className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-xs font-bold uppercase tracking-widest">No data for this range</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative z-10">
          <ResponsiveContainer width="99%" height="100%">
            <PieChart>
              <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={110} 
                paddingAngle={8} 
                dataKey="value" 
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
