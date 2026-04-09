import { useState, useMemo } from 'react';
import { useSplit } from '../context/SplitContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users, Percent, Hash, Equal, ChevronDown, ChevronUp, Star, Trash2 } from 'lucide-react';

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal', icon: Equal, desc: 'Split evenly' },
  { value: 'percentage', label: 'Percentage', icon: Percent, desc: 'By percent' },
  { value: 'custom', label: 'Custom', icon: Hash, desc: 'Custom amounts' },
];

const EMPTY_PARTICIPANT = { name: '', email: '', share: 0 };

export default function SplitExpenseModal({ onClose }) {
  const { addSplit, contacts } = useSplit();

  const [form, setForm] = useState({
    title: '',
    totalAmount: '',
    paidBy: 'You',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
  });

  const [participants, setParticipants] = useState([
    { name: 'You', email: 'you@demo.com', share: 0, settled: true },
  ]);

  const [showContacts, setShowContacts] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  // ─── Helpers ──────────────────────────────────────────
  const total = Number(form.totalAmount) || 0;

  const recalculateShares = (parts, type, totalAmt) => {
    const t = Number(totalAmt) || 0;
    if (type === 'equal' && parts.length > 0) {
      const each = Math.round((t / parts.length) * 100) / 100;
      return parts.map((p, i) => ({
        ...p,
        share: i === parts.length - 1 ? Math.round((t - each * (parts.length - 1)) * 100) / 100 : each,
      }));
    }
    return parts;
  };

  const addParticipant = (contact) => {
    // Check for duplicate
    if (participants.some((p) => p.email.toLowerCase() === contact.email.toLowerCase())) return;
    const updated = [...participants, { ...contact, share: 0, settled: false }];
    setParticipants(recalculateShares(updated, form.splitType, form.totalAmount));
  };

  const removeParticipant = (index) => {
    if (index === 0) return; // Can't remove "You"
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(recalculateShares(updated, form.splitType, form.totalAmount));
  };

  const updateParticipantField = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: field === 'share' ? Number(value) || 0 : value };
    setParticipants(updated);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (name === 'totalAmount' || name === 'splitType') {
      setParticipants(recalculateShares(participants, next.splitType, next.totalAmount));
    }
  };

  const setSplitType = (type) => {
    setForm((f) => ({ ...f, splitType: type }));
    setParticipants(recalculateShares(participants, type, form.totalAmount));
  };

  // ─── Validation ───────────────────────────────────────
  const sharesTotal = useMemo(() => participants.reduce((s, p) => s + p.share, 0), [participants]);

  const percentTotal = useMemo(() => {
    if (form.splitType !== 'percentage') return 100;
    return participants.reduce((s, p) => s + (total > 0 ? (p.share / total) * 100 : 0), 0);
  }, [participants, form.splitType, total]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!total || total <= 0) errs.totalAmount = 'Enter a valid amount';
    if (participants.length < 2) errs.participants = 'Need at least 2 people';
    if (form.splitType !== 'equal') {
      const diff = Math.abs(sharesTotal - total);
      if (diff > 0.02) errs.shares = `Shares add up to ₹${sharesTotal.toFixed(2)}, but total is ₹${total.toFixed(2)}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addSplit({
      title: form.title,
      totalAmount: total,
      paidBy: form.paidBy,
      date: form.date,
      splitType: form.splitType,
      participants,
    });
    onClose();
  };

  // ─── Saved contacts not yet added ────────────────────
  const availableContacts = contacts.filter(
    (c) => !participants.some((p) => p.email.toLowerCase() === c.email.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-primary-500" /> New Split Expense
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="label">Title / Description</label>
            <input name="title" value={form.title} onChange={handleFormChange}
              placeholder='e.g. "Dinner at restaurant"' className="input" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Amount (₹)</label>
              <input name="totalAmount" type="number" min="0.01" step="0.01" value={form.totalAmount}
                onChange={handleFormChange} placeholder="0.00" className="input" />
              {errors.totalAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAmount}</p>}
            </div>
            <div>
              <label className="label">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleFormChange} className="input" />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="label">Paid By</label>
            <select name="paidBy" value={form.paidBy} onChange={handleFormChange} className="input">
              <option value="You">You</option>
              {participants.filter((p) => p.email !== 'you@demo.com').map((p) => (
                <option key={p.email} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Split Type */}
          <div>
            <label className="label">Split Type</label>
            <div className="grid grid-cols-3 gap-2">
              {SPLIT_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <button key={value} type="button" onClick={() => setSplitType(value)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    form.splitType === value
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-500/30 ring-2 ring-primary-400/30'
                      : 'bg-slate-50 dark:bg-dark-bg/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-border/50'
                  }`}>
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Participants ({participants.length})</label>
              <div className="flex gap-2">
                {availableContacts.length > 0 && (
                  <button type="button" onClick={() => setShowContacts(!showContacts)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    <Star size={13} /> Saved {showContacts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Saved contacts dropdown */}
            <AnimatePresence>
              {showContacts && availableContacts.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3">
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200/50 dark:border-primary-500/10">
                    {availableContacts.map((c) => (
                      <button key={c.id} type="button" onClick={() => { addParticipant(c); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm">
                        <UserPlus size={12} /> {c.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.participants && <p className="text-xs text-red-500 mb-2">{errors.participants}</p>}

            {/* Participant rows */}
            <div className="flex flex-col gap-2">
              {participants.map((p, i) => (
                <motion.div key={i} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-dark-bg/50 border border-slate-200/50 dark:border-dark-border/50">
                  <div className="flex-1 min-w-0">
                    {i === 0 ? (
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">You</p>
                    ) : (
                      <div className="flex gap-2">
                        <input value={p.name} onChange={(e) => updateParticipantField(i, 'name', e.target.value)}
                          placeholder="Name" className="input py-1.5 px-2.5 text-sm flex-1" />
                        <input value={p.email} onChange={(e) => updateParticipantField(i, 'email', e.target.value)}
                          placeholder="Email" className="input py-1.5 px-2.5 text-sm flex-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {form.splitType === 'equal' ? (
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 min-w-[60px] text-right">
                        ₹{p.share.toFixed(2)}
                      </span>
                    ) : form.splitType === 'percentage' ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" max="100" step="0.1"
                          value={total > 0 ? ((p.share / total) * 100).toFixed(1) : ''}
                          onChange={(e) => updateParticipantField(i, 'share', (Number(e.target.value) / 100) * total)}
                          className="input py-1 px-2 text-sm w-16 text-right" />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                    ) : (
                      <input type="number" min="0" step="0.01" value={p.share || ''}
                        onChange={(e) => updateParticipantField(i, 'share', e.target.value)}
                        placeholder="₹" className="input py-1 px-2 text-sm w-20 text-right" />
                    )}
                    {i > 0 && (
                      <button type="button" onClick={() => removeParticipant(i)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add new participant inline */}
            <div className="mt-3 flex gap-2 items-end">
              <div className="flex-1">
                <input value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Name" className="input py-2 text-sm" />
              </div>
              <div className="flex-1">
                <input value={newContact.email} onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Email" className="input py-2 text-sm" />
              </div>
              <button type="button"
                onClick={() => {
                  if (newContact.name.trim() && newContact.email.trim()) {
                    addParticipant({ name: newContact.name.trim(), email: newContact.email.trim() });
                    setNewContact({ name: '', email: '' });
                  }
                }}
                className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-500/20 transition-colors shrink-0">
                <UserPlus size={16} />
              </button>
            </div>

            {/* Shares validation */}
            {form.splitType !== 'equal' && total > 0 && (
              <div className={`mt-2 text-xs font-semibold px-3 py-2 rounded-lg ${
                Math.abs(sharesTotal - total) <= 0.02
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                Total of shares: ₹{sharesTotal.toFixed(2)} / ₹{total.toFixed(2)}
                {Math.abs(sharesTotal - total) <= 0.02 ? ' ✓' : ' — does not match!'}
              </div>
            )}
            {errors.shares && <p className="text-xs text-red-500 mt-1">{errors.shares}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Split Expense</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
