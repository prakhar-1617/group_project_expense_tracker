import { useState } from 'react';
import API from '../api/axios';
import { X } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Housing', 'Utilities', 'Travel', 'Personal Care', 'Investment', 'Salary', 'Freelance', 'Business', 'Gift', 'Other'];

const EMPTY = { amount: '', type: 'expense', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] };

export default function TransactionModal({ onClose, onSave, existing }) {
  const [form, setForm] = useState(existing ? {
    amount: existing.amount,
    type: existing.type,
    category: existing.category,
    description: existing.description || '',
    date: new Date(existing.date).toISOString().split('T')[0],
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAIDetection = async (desc) => {
    if (desc.trim().length <= 3) return;
    try {
      const res = await API.post('/ai/categorize', { description: desc });
      if (res.data.success && res.data.category) {
        setForm(prev => ({ ...prev, category: res.data.category }));
        setAiConfidence(res.data.confidence);
      }
    } catch (err) {
      console.error("AI Categorization failed", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return;
    setLoading(true);
    try {
      if (existing) {
        await API.put(`/transactions/${existing._id}`, { ...form, amount: Number(form.amount) });
      } else {
        await API.post('/transactions', { ...form, amount: Number(form.amount) });
      }
      onSave();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {existing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map((t) => (
              <button key={t} type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'expense' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input name="amount" type="number" min="0.01" step="0.01" value={form.amount}
              onChange={handleChange} placeholder="0.00" className="input" required />
          </div>

          {/* Description */}
          <div>
            <label className="label flex justify-between items-center text-xs">
              Description 
              {aiConfidence && (
                <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-primary-500"></div> AI Enhanced
                </span>
              )}
            </label>
            <input 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              onBlur={(e) => handleAIDetection(e.target.value)}
              placeholder='e.g. "bought pizza"' 
              className="input focus:ring-primary-500/20" 
            />
          </div>

          {/* Category */}
          <div>
            <label className="label flex justify-between items-center text-xs">
              Category
              {aiConfidence && (
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                  aiConfidence > 0.8 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {Math.round(aiConfidence * 100)}% Match
                </span>
              )}
            </label>
            <select name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="input" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : existing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
