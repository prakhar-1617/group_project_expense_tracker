const Transaction = require('../models/Transaction');

// Get start dates for the selected time range
function getRangeDates(range) {
  const now = new Date();
  let startDate = new Date();
  let durationMs = 0;

  switch (range) {
    case '1d':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      durationMs = 24 * 60 * 60 * 1000;
      break;
    case '1w':
      startDate.setDate(now.getDate() - 7);
      durationMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '1m':
      startDate.setMonth(now.getMonth() - 1);
      durationMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case '6m':
      startDate.setMonth(now.getMonth() - 6);
      durationMs = 180 * 24 * 60 * 60 * 1000;
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      durationMs = 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
      durationMs = 30 * 24 * 60 * 60 * 1000;
  }

  const prevStartDate = new Date(startDate.getTime() - durationMs);
  return { startDate, prevStartDate, endDate: new Date() };
}

// Split transactions into time buckets for the chart
function computeTrendGroups(txns, range) {
  const now = new Date();
  let groups = [];

  switch (range) {
    case '1d':
      // One bucket per hour for the last 24 hours
      for (let i = 23; i >= 0; i--) {
        const start = new Date(now);
        start.setHours(now.getHours() - i, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(59, 59, 999);
        groups.push({ start, end, label: `${String(start.getHours()).padStart(2, '0')}:00` });
      }
      break;

    case '1w':
      // One bucket per day for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        groups.push({
          start, end,
          label: start.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
      }
      break;

    case '1m':
      // One bucket per week for the last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        groups.push({ start, end, label: `Week ${4 - i}` });
      }
      break;

    case '1y':
      // One bucket per month for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        groups.push({
          start: d,
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
          label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        });
      }
      break;

    default: // 6m — one bucket per month for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        groups.push({
          start: d,
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
          label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        });
      }
  }

  // For each bucket, calculate total income and expense
  return groups.map(({ start, end, label }) => {
    const groupTxns = txns.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const income = groupTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = groupTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { label, income, expense };
  });
}

// Get full summary for a time range: stats, category breakdown, and chart data
async function getSummary(userId, range = '1m') {
  const { startDate, prevStartDate, endDate } = getRangeDates(range);

  // Fetch current period and previous period transactions together
  const [currentTxns, prevTxns] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
    Transaction.find({ user: userId, date: { $gte: prevStartDate, $lt: startDate } }),
  ]);

  // Helper: calculate income, expense, balance from a list of transactions
  const calculateStats = (txns) => {
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, count: txns.length };
  };

  const currentStats = calculateStats(currentTxns);
  const prevStats = calculateStats(prevTxns);

  // Category breakdown (expenses only, sorted by amount)
  const categoryBreakdown = {};
  currentTxns
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

  const formattedCategories = Object.entries(categoryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // % change vs previous period
  const calculateChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const trendData = computeTrendGroups(currentTxns, range);

  return {
    success: true,
    range,
    stats: {
      ...currentStats,
      incomeChange: calculateChange(currentStats.income, prevStats.income),
      expenseChange: calculateChange(currentStats.expense, prevStats.expense),
    },
    categoryData: formattedCategories,
    trendData,
    period: { start: startDate, end: endDate },
  };
}

module.exports = { getSummary };
