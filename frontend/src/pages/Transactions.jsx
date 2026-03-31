import { useState, useEffect } from 'react';
import API from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import { Search, Edit2, Trash2, Plus, TrendingUp, TrendingDown, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/transactions?limit=100';
      if (search) url += `&search=${search}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const { data } = await API.get(url);
      setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [search, typeFilter, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch { toast.error('Failed to delete transaction'); }
  };

  const openModal = (txn = null) => { setEditTxn(txn); setModalOpen(true); };

  const handleExportCSV = () => {
    if (transactions.length === 0) { toast.error('No transactions to export'); return; }
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [headers.join(','), ...transactions.map(t =>
      [new Date(t.date).toLocaleDateString(), `"${t.description.replace(/"/g, '""')}"`, t.category, t.type, t.amount].join(',')
    )].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Housing', 'Utilities', 'Travel', 'Personal Care', 'Investment', 'Salary', 'Freelance', 'Business', 'Gift', 'Other'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your expense history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 group"><Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Export CSV</button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Transaction</motion.button>
        </div>
      </div>

      <div className="card shadow-sm p-4 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-fuchsia-500/5"></div>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5 transition-colors focus-within:text-primary-500" />
            <input type="text" placeholder="Search by description or category..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input pl-10 bg-white/50 dark:bg-dark-bg/50" />
          </div>
          <div className="flex gap-2">
            <select className="input w-36 bg-white/50 dark:bg-dark-bg/50" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="input w-40 bg-white/50 dark:bg-dark-bg/50" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-0 bg-transparent dark:bg-transparent shadow-none">
        {loading ? (
          <div className="p-12 flex justify-center text-primary-500">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-lg">No transactions found matching your criteria.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3">
            <AnimatePresence>
              {transactions.map((txn) => (
                <motion.div 
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  key={txn._id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-900/50 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${txn.type === 'income' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-500/10 dark:to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                      {txn.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{txn.description}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-dark-bg px-2 py-0.5 rounded-md">{new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${txn.type === 'income' ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100/50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                          {txn.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 w-full sm:w-auto border-t sm:border-0 border-slate-100 dark:border-dark-border pt-3 sm:pt-0">
                    <div className={`font-bold text-xl tracking-tight ${txn.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                      {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                    </div>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(txn)} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(txn._id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <TransactionModal existing={editTxn} onClose={() => setModalOpen(false)}
            onSave={() => { setModalOpen(false); fetchTransactions(); }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
