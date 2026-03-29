// DEMO API — returns mock data, no backend needed
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// Helper to read/write localStorage
const getTransactions = () => JSON.parse(localStorage.getItem('demo_transactions') || '[]');
const saveTransactions = (txns) => localStorage.setItem('demo_transactions', JSON.stringify(txns));
const getBudget = () => JSON.parse(localStorage.getItem('demo_budget') || '{"monthlyBudget": 0}');
const saveBudget = (b) => localStorage.setItem('demo_budget', JSON.stringify(b));

// Seed some demo data on first load
if (!localStorage.getItem('demo_seeded')) {
  const now = new Date();
  const seeded = [
    { _id: '1', type: 'income',  category: 'Salary',        description: 'Monthly Salary',     amount: 50000, date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() },
    { _id: '2', type: 'expense', category: 'Food',           description: 'Grocery Shopping',   amount: 3200,  date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    { _id: '3', type: 'expense', category: 'Transport',      description: 'Uber rides',         amount: 1500,  date: new Date(now.getFullYear(), now.getMonth(), 8).toISOString() },
    { _id: '4', type: 'expense', category: 'Entertainment',  description: 'Netflix & Spotify',  amount: 800,   date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    { _id: '5', type: 'income',  category: 'Freelance',      description: 'Freelance Project',  amount: 12000, date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString() },
    { _id: '6', type: 'expense', category: 'Health',         description: 'Gym Membership',     amount: 2000,  date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
    { _id: '7', type: 'expense', category: 'Shopping',       description: 'Clothes & Shoes',    amount: 4500,  date: new Date(now.getFullYear(), now.getMonth(), 18).toISOString() },
    { _id: '8', type: 'expense', category: 'Utilities',      description: 'Electricity Bill',   amount: 1200,  date: new Date(now.getFullYear(), now.getMonth(), 20).toISOString() },
  ];
  saveTransactions(seeded);
  saveBudget({ monthlyBudget: 20000 });
  localStorage.setItem('demo_seeded', 'true');
}

const API = {
  get: async (url) => {
    await delay();
    const txns = getTransactions();

    if (url.startsWith('/transactions/summary')) {
      const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const balance = totalIncome - totalExpense;
      const categoryBreakdown = {};
      txns.filter(t => t.type === 'expense').forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });
      return { data: { totalIncome, totalExpense, balance, categoryBreakdown } };
    }

    if (url.startsWith('/transactions/monthly-trend')) {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('default', { month: 'short' });
        const monthTxns = txns.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        });
        months.push({
          label,
          income:  monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        });
      }
      return { data: months };
    }

    if (url.startsWith('/transactions')) {
      const params = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
      let result = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));
      const search = params.get('search');
      const type   = params.get('type');
      const cat    = params.get('category');
      const limit  = parseInt(params.get('limit') || '100');
      if (search) result = result.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
      if (type)   result = result.filter(t => t.type === type);
      if (cat)    result = result.filter(t => t.category === cat);
      return { data: { transactions: result.slice(0, limit) } };
    }

    if (url.startsWith('/budget')) {
      return { data: getBudget() };
    }

    if (url.startsWith('/ai/insights')) {
      const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const topCategory = (() => {
        const breakdown = {};
        txns.filter(t => t.type === 'expense').forEach(t => { breakdown[t.category] = (breakdown[t.category] || 0) + t.amount; });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
      })();
      return { data: { insights: [
        { type: 'info',    icon: '💡', title: 'Top Spending Category', message: `You spend the most on ${topCategory}. Consider setting a specific budget for it.` },
        { type: 'success', icon: '✅', title: 'Good Income Balance',   message: 'Your income covers your expenses well this month. Keep it up!' },
        { type: 'warning', icon: '⚠️', title: 'Track Discretionary Spend', message: 'Entertainment and shopping are growing. Watch these categories.' },
      ]}};
    }

    if (url.startsWith('/ai/predict')) {
      return { data: { predicted: 14200, slope: 1, message: 'Spending trending slightly up' } };
    }

    return { data: {} };
  },

  post: async (url, body) => {
    await delay();
    if (url === '/transactions') {
      const txns = getTransactions();
      const newTxn = { ...body, _id: Date.now().toString(), date: body.date || new Date().toISOString() };
      saveTransactions([newTxn, ...txns]);
      return { data: newTxn };
    }
    if (url === '/ai/categorize') {
      const map = { pizza: 'Food', uber: 'Transport', netflix: 'Entertainment', gym: 'Health', salary: 'Salary' };
      const desc = (body.description || '').toLowerCase();
      const category = Object.keys(map).find(k => desc.includes(k)) ? map[Object.keys(map).find(k => desc.includes(k))] : 'Other';
      return { data: { category } };
    }
    if (url === '/ai/chat') {
      const responses = [
        "Based on your spending, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
        "Your top expense categories suggest you could save ₹2,000+ by cutting discretionary spending.",
        "Consider setting up an emergency fund of at least 3-6 months of expenses.",
        "Track daily expenses for a week — most people are surprised by small recurring costs."
      ];
      return { data: { response: responses[Math.floor(Math.random() * responses.length)] } };
    }
    return { data: {} };
  },

  put: async (url, body) => {
    await delay();
    if (url === '/budget') { saveBudget(body); return { data: body }; }
    if (url.startsWith('/transactions/')) {
      const id = url.split('/').pop();
      const txns = getTransactions().map(t => t._id === id ? { ...t, ...body } : t);
      saveTransactions(txns);
      return { data: body };
    }
    return { data: {} };
  },

  delete: async (url) => {
    await delay();
    if (url.startsWith('/transactions/')) {
      const id = url.split('/').pop();
      saveTransactions(getTransactions().filter(t => t._id !== id));
    }
    return { data: {} };
  },
};

export default API;
