const Transaction = require('../models/Transaction');

class AnalyticsService {
  /**
   * Calculates specific start and previous period dates based on range
   */
  getRangeDates(range) {
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

  /**
   * Splits already-fetched transactions into labelled time buckets
   * matching the selected range — no extra DB calls needed.
   */
  computeTrendGroups(txns, range) {
    const now = new Date();
    let groups = [];

    switch (range) {
      case '1d':
        // Last 24 hours, one bucket per hour
        for (let i = 23; i >= 0; i--) {
          const start = new Date(now);
          start.setHours(now.getHours() - i, 0, 0, 0);
          const end = new Date(start);
          end.setMinutes(59, 59, 999);
          groups.push({
            start,
            end,
            label: `${String(start.getHours()).padStart(2, '0')}:00`,
          });
        }
        break;

      case '1w':
        // Last 7 days, one bucket per day
        for (let i = 6; i >= 0; i--) {
          const start = new Date(now);
          start.setDate(now.getDate() - i);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setHours(23, 59, 59, 999);
          groups.push({
            start,
            end,
            label: start.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' }),
          });
        }
        break;

      case '1m':
        // Last 4 weeks, one bucket per week
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
        // Last 12 months, one bucket per month
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          groups.push({
            start: d,
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
            label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
          });
        }
        break;

      default: // '6m'
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          groups.push({
            start: d,
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
            label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
          });
        }
    }

    return groups.map(({ start, end, label }) => {
      const groupTxns = txns.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      const income = groupTxns
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expense = groupTxns
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return { label, income, expense };
    });
  }

  /**
   * Gets comprehensive summary for a specific range including trends
   */
  async getSummary(userId, range = '1m') {
    const { startDate, prevStartDate, endDate } = this.getRangeDates(range);

    // Fetch current and previous period data in parallel
    const [currentTxns, prevTxns] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Transaction.find({ user: userId, date: { $gte: prevStartDate, $lt: startDate } }),
    ]);

    const calculateStats = (txns) => {
      const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { income, expense, balance: income - expense, count: txns.length };
    };

    const currentStats = calculateStats(currentTxns);
    const prevStats = calculateStats(prevTxns);

    // Category Breakdown (current period)
    const categoryBreakdown = {};
    currentTxns
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const formattedCategories = Object.entries(categoryBreakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Trend Indicators (Percentage Change)
    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    // Grouped trend data based on the selected range (reuses currentTxns — no extra DB queries)
    const trendData = this.computeTrendGroups(currentTxns, range);

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
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Fixed 6-month monthly trend (kept for backward compat, no longer used by Analytics page)
   */
  async getMonthlyTrend(userId) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const trends = await Promise.all(
      months.map(async ({ year, month }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const txns = await Transaction.find({ user: userId, date: { $gte: start, $lte: end } });
        const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return {
          month: `${year}-${String(month).padStart(2, '0')}`,
          label: new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
          income,
          expense,
        };
      })
    );

    return trends;
  }
}

module.exports = new AnalyticsService();
