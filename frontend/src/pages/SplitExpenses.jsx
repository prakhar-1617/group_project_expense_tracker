import { useState } from 'react';
import { useSplit } from '../context/SplitContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, Check, Clock, IndianRupee,
  ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp,
  Search, UserMinus, UserPlus,
} from 'lucide-react';
import SplitExpenseModal from '../components/SplitExpenseModal';

export default function SplitExpenses() {
  const { splits, deleteSplit, markSettled, contacts, removeContact, addContact, totalSplit, youAreOwed, youOwe } = useSplit();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '' });

  const filtered = splits.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.participants.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const summaryCards = [
    { label: 'Total Split', value: totalSplit, icon: Users, color: 'from-primary-500 to-fuchsia-500', bg: 'primary' },
    { label: 'You Are Owed', value: youAreOwed, icon: ArrowDownLeft, color: 'from-emerald-500 to-teal-400', bg: 'emerald' },
    { label: 'You Owe', value: youOwe, icon: ArrowUpRight, color: 'from-rose-500 to-orange-400', bg: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            Split Expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Split bills and track who owes what</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowContacts(!showContacts)}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Users size={16} /> Contacts
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Split
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card card-hover relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-${bg}-500/20`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contacts Panel */}
      <AnimatePresence>
        {showContacts && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="card">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Users size={16} className="text-primary-500" /> Saved Contacts ({contacts.length})
              </h3>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No saved contacts yet. They'll be auto-saved when you create splits.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {contacts.map((c) => (
                    <div key={c.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-bg/50 border border-slate-200/50 dark:border-dark-border/50 text-sm group">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-fuchsia-100 dark:from-primary-900/50 dark:to-fuchsia-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.email}</p>
                      </div>
                      <button onClick={() => removeContact(c.id)}
                        className="p-1 rounded-lg text-transparent group-hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <UserMinus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add contact inline */}
              <div className="flex gap-2 items-center">
                <input value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Name" className="input py-2 text-sm flex-1" />
                <input value={newContact.email} onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Email" className="input py-2 text-sm flex-1" />
                <button onClick={() => {
                  if (newContact.name.trim() && newContact.email.trim()) {
                    addContact({ name: newContact.name.trim(), email: newContact.email.trim() });
                    setNewContact({ name: '', email: '' });
                  }
                }}
                  className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-500/20 transition-colors shrink-0">
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search splits..." className="input pl-10" />
      </div>

      {/* Splits List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-primary-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No split expenses yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Create your first split to get started!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> New Split
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((split, i) => {
            const isExpanded = expandedId === split.id;
            const settledCount = split.participants.filter((p) => p.settled).length;
            const allSettled = settledCount === split.participants.length;

            return (
              <motion.div key={split.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card card-hover overflow-hidden"
              >
                {/* Split header */}
                <div className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : split.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      allSettled
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    }`}>
                      {allSettled ? <Check size={18} /> : <Users size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{split.title}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(split.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}Paid by <span className="font-semibold text-slate-600 dark:text-slate-300">{split.paidBy}</span>
                        {' · '}{split.participants.length} people
                        {' · '}<span className="capitalize">{split.splitType}</span> split
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">₹{split.totalAmount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{settledCount}/{split.participants.length} settled</p>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-400">
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded participants */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border/50 space-y-2">
                        {split.participants.map((p) => (
                          <div key={p.email}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              p.settled
                                ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/10'
                                : 'bg-slate-50/80 dark:bg-dark-bg/30 border border-slate-200/50 dark:border-dark-border/30'
                            }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                p.settled
                                  ? 'bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                              }`}>
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.name}</p>
                                <p className="text-[10px] text-slate-400">{p.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-800 dark:text-white">₹{p.share.toFixed(2)}</span>
                              <button onClick={(e) => { e.stopPropagation(); markSettled(split.id, p.email); }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                  p.settled
                                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20'
                                }`}>
                                {p.settled ? <><Check size={10} /> Settled</> : <><Clock size={10} /> Pending</>}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Delete button */}
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => deleteSplit(split.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} /> Delete Split
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && <SplitExpenseModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
