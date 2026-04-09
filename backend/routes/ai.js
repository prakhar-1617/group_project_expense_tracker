const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// Keyword-based smart categorization
const categorize = (description) => {
  const text = description.toLowerCase();
  const rules = [
    { keywords: ['food', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'coffee', 'eat', 'meal', 'snack', 'groceries', 'grocery', 'supermarket', 'swiggy', 'zomato'], category: 'Food' },
    { keywords: ['bus', 'metro', 'taxi', 'uber', 'ola', 'auto', 'train', 'fuel', 'petrol', 'diesel', 'transport', 'cab', 'commute', 'toll'], category: 'Transport' },
    { keywords: ['shirt', 'shoes', 'dress', 'clothes', 'shopping', 'amazon', 'flipkart', 'mall', 'fashion', 'cloth', 'bag', 'purchase', 'buy', 'bought'], category: 'Shopping' },
    { keywords: ['movie', 'netflix', 'spotify', 'game', 'gaming', 'entertainment', 'cinema', 'theatre', 'concert', 'event', 'party', 'outing', 'fun'], category: 'Entertainment' },
    { keywords: ['doctor', 'hospital', 'medicine', 'medical', 'health', 'pharmacy', 'clinic', 'dental', 'gym', 'fitness', 'yoga', 'checkup'], category: 'Health' },
    { keywords: ['course', 'book', 'college', 'school', 'tuition', 'class', 'education', 'study', 'fee', 'exam', 'learning', 'udemy', 'coaching'], category: 'Education' },
    { keywords: ['rent', 'house', 'apartment', 'home', 'housing', 'maintenance', 'repair', 'landlord', 'lease'], category: 'Housing' },
    { keywords: ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'bill', 'utility', 'recharge', 'subscription', 'dth'], category: 'Utilities' },
    { keywords: ['flight', 'hotel', 'travel', 'trip', 'holiday', 'vacation', 'tour', 'booking', 'airbnb'], category: 'Travel' },
    { keywords: ['haircut', 'salon', 'spa', 'beauty', 'grooming', 'personal', 'care'], category: 'Personal Care' },
    { keywords: ['salary', 'wage', 'stipend', 'paycheck', 'income earned'], category: 'Salary' },
    { keywords: ['freelance', 'freelancing', 'client', 'project payment', 'consulting'], category: 'Freelance' },
    { keywords: ['investment', 'stock', 'mutual fund', 'sip', 'fd', 'crypto', 'dividend', 'returns'], category: 'Investment' },
    { keywords: ['gift', 'birthday', 'anniversary', 'present', 'donation', 'charity'], category: 'Gift' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }
  return 'Other';
};

// @route   POST /api/ai/categorize
router.post('/categorize', protect, (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ message: 'Description required' });
  const category = categorize(description);
  res.json({ category, description });
});

// @route   GET /api/ai/insights
router.get('/insights', protect, async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonth = await Transaction.find({ user: req.user._id, date: { $gte: thisMonthStart } });
    const lastMonth = await Transaction.find({ user: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } });

    const totalExpenseThis = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIncomeThis = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenseLast = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const insights = [];
    const savingsRate = totalIncomeThis > 0 ? ((totalIncomeThis - totalExpenseThis) / totalIncomeThis) * 100 : 0;

    if (totalIncomeThis > 0) {
      const expenseRatio = (totalExpenseThis / totalIncomeThis) * 100;
      if (expenseRatio > 80) {
        insights.push({ type: 'warning', icon: '⚠️', title: 'High Spending Alert', message: `You've spent ${expenseRatio.toFixed(1)}% of your income this month. Consider cutting back.` });
      } else if (expenseRatio < 50) {
        insights.push({ type: 'success', icon: '🎉', title: 'Great Saving Rate!', message: `You are saving ${(100 - expenseRatio).toFixed(1)}% of your income. Keep it up!` });
      }
    }

    if (totalExpenseLast > 0) {
      const change = ((totalExpenseThis - totalExpenseLast) / totalExpenseLast) * 100;
      if (change > 20) {
        insights.push({ type: 'warning', icon: '📈', title: 'Spending Increased', message: `Your expenses increased by ${change.toFixed(1)}% compared to last month.` });
      } else if (change < -10) {
        insights.push({ type: 'success', icon: '📉', title: 'Spending Decreased', message: `You spent ${Math.abs(change).toFixed(1)}% less than last month. Excellent!` });
      }
    }

    // Category analysis
    const catMap = {};
    thisMonth.filter((t) => t.type === 'expense').forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const [topCat, topAmt] = sortedCats[0];
      const pct = totalExpenseThis > 0 ? ((topAmt / totalExpenseThis) * 100).toFixed(1) : 0;
      insights.push({ type: 'info', icon: '💡', title: 'Top Spending Category', message: `You spent ${pct}% of your expenses on ${topCat} (₹${topAmt.toLocaleString()}).` });
    }

    if (savingsRate > 0) {
      insights.push({ type: 'info', icon: '💰', title: 'Savings Rate', message: `Your savings rate this month is ${savingsRate.toFixed(1)}%.` });
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', icon: '📊', title: 'Track More Transactions', message: 'Add more transactions to get personalized AI financial insights.' });
    }

    res.json({ insights, summary: { totalExpenseThis, totalIncomeThis, totalExpenseLast, savingsRate } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/ai/predict
router.get('/predict', protect, async (req, res) => {
  try {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const data = await Promise.all(
      months.map(async ({ year, month }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const txns = await Transaction.find({ user: req.user._id, date: { $gte: start, $lte: end }, type: 'expense' });
        return txns.reduce((s, t) => s + t.amount, 0);
      })
    );

    const n = data.length;
    const validData = data.filter((v) => v > 0);
    if (validData.length < 2) {
      return res.json({ predicted: null, message: 'Not enough data to predict. Add more transactions.' });
    }

    // Simple linear regression
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    data.forEach((y, x) => {
      num += (x - xMean) * (y - yMean);
      den += (x - xMean) ** 2;
    });
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;
    const predicted = Math.max(0, slope * n + intercept);

    res.json({ predicted: Math.round(predicted), slope: Math.round(slope), historicalData: data, message: predicted > yMean ? 'Your expenses are trending upward.' : 'Your expenses are trending downward.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const lowerMsg = message.toLowerCase();
    let response = '';

    // Rule-based financial chatbot responses
    if (lowerMsg.includes('reduce') || lowerMsg.includes('save') || lowerMsg.includes('saving')) {
      response = '💡 **Tips to Reduce Expenses & Save More:**\n\n1. Track every expense — awareness is the first step\n2. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n3. Cook at home instead of eating out frequently\n4. Cancel unused subscriptions\n5. Set a monthly budget and stick to it\n6. Use public transport when possible\n7. Buy in bulk for frequently used items\n8. Avoid impulse purchases — wait 24 hours before buying';
    } else if (lowerMsg.includes('budget')) {
      response = '📊 **Smart Budgeting Tips:**\n\n1. Use the **50/30/20 Rule**: 50% on needs, 30% on wants, 20% on savings\n2. Set category-wise limits (e.g., Food: ₹3000, Transport: ₹1500)\n3. Review your budget at the end of each month\n4. Keep an emergency fund of 3-6 months of expenses\n5. Use the Budget page to set your monthly limit here in the app!';
    } else if (lowerMsg.includes('invest') || lowerMsg.includes('investment')) {
      response = '📈 **Beginner Investment Tips:**\n\n1. Start a SIP (Systematic Investment Plan) in mutual funds\n2. Invest in the Employee Provident Fund (EPF) and PPF\n3. Consider index funds for long-term wealth building\n4. Diversify: stocks, bonds, gold, real estate\n5. Start early — even ₹500/month grows significantly over 10 years\n6. Avoid high-risk investments without research';
    } else if (lowerMsg.includes('debt') || lowerMsg.includes('loan') || lowerMsg.includes('emi')) {
      response = '💳 **Managing Debt & EMIs:**\n\n1. Pay off high-interest debt first (credit cards, personal loans)\n2. Never miss an EMI payment — it damages your credit score\n3. Try to prepay loans when you have extra money\n4. Avoid taking multiple loans simultaneously\n5. Keep EMI payments below 40% of your monthly income';
    } else if (lowerMsg.includes('emergency') || lowerMsg.includes('fund')) {
      response = '🔐 **Building an Emergency Fund:**\n\n1. Aim for 3-6 months of monthly expenses\n2. Keep it in a liquid savings account or liquid mutual fund\n3. Only use it for genuine emergencies (job loss, medical)\n4. Rebuild it immediately after using\n5. Automate a monthly transfer to your emergency fund';
    } else if (lowerMsg.includes('credit') || lowerMsg.includes('score')) {
      response = '⭐ **Improving Your Credit Score:**\n\n1. Pay all bills and EMIs on time\n2. Keep credit card utilization below 30%\n3. Don\'t close old credit accounts\n4. Avoid applying for multiple loans at once\n5. Check your credit report regularly for errors';
    } else if (lowerMsg.includes('food') || lowerMsg.includes('groceries')) {
      response = '🍽️ **Reducing Food Expenses:**\n\n1. Plan meals weekly and make a shopping list\n2. Cook in bulk and meal prep for the week\n3. Limit takeout/delivery to once or twice a week\n4. Buy seasonal fruits and vegetables\n5. Use grocery store loyalty programs and coupons\n6. Reduce food waste by using leftovers creatively';
    } else {
      response = `💬 **AI Financial Assistant**\n\nI can help you with tips on:\n• 💰 **Saving money** — ask "How can I save more?"\n• 📊 **Budgeting** — ask "How should I budget?"\n• 📈 **Investing** — ask "How do I start investing?"\n• 💳 **Debt management** — ask "How to manage my loans?"\n• 🔐 **Emergency funds** — ask "How to build an emergency fund?"\n• 🍽️ **Reducing food expenses**\n\nFeel free to ask me anything about personal finance!`;
    }

    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
