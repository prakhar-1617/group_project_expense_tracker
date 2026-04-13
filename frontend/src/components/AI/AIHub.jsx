import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Sparkles, Brain } from 'lucide-react';
import PredictionCard from './PredictionCard';
import VelocityAlert from './VelocityAlert';
import InsightCard from './InsightCard';

export default function AIHub() {
  const [data, setData] = useState({ prediction: null, insights: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const [p, i] = await Promise.all([
          API.get('/ai/predict'),
          API.get('/ai/insights')
        ]);
        setData({ prediction: p.data, insights: i.data });
      } catch (err) {
        console.error("AI Hub fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, []);

  if (loading) {
    return (
      <div className="lg:col-span-2 card animate-pulse bg-white/50 dark:bg-dark-card/50">
        <div className="h-6 w-48 bg-slate-200 dark:bg-dark-border rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-100 dark:bg-dark-bg/50 rounded-3xl"></div>
          <div className="h-40 bg-slate-100 dark:bg-dark-bg/50 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 card relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-indigo-500/5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <Brain size={18} />
            </div>
            AI Financial Hub
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-bg text-[10px] font-bold text-slate-500 uppercase">
             <Sparkles size={12} className="text-primary-500" /> System Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PredictionCard prediction={data.prediction} />
          <VelocityAlert alerts={data.insights?.alerts} />
        </div>

        <InsightCard insights={data.insights} />
      </div>
    </div>
  );
}
