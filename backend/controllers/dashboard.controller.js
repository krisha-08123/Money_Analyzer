import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Emi from "../models/Emi.js";

// GET /api/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999);

    // ── All-time aggregation ─────────────────────────────────────────
    const allTimeAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const allTime = { income: 0, expense: 0 };
    allTimeAgg.forEach((r) => (allTime[r._id] = r.total));

    // ── Monthly aggregation ──────────────────────────────────────────
    const monthlyAgg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthly = { income: 0, expense: 0 };
    monthlyAgg.forEach((r) => (monthly[r._id] = r.total));

    // ── Category breakdown (monthly expenses) ───────────────────────
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── 6-Month trend ────────────────────────────────────────────────
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(year, month - 1 - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const agg = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]);

      const income  = agg.find((a) => a._id === "income")?.total  || 0;
      const expense = agg.find((a) => a._id === "expense")?.total || 0;
      trend.push({
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        income,
        expense,
        savings: income - expense,
      });
    }

    // ── Daily breakdown (current month) for sparkline ───────────────
    const dailyAgg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // ── Budget summary ───────────────────────────────────────────────
    const budgets = await Budget.find({ user: userId, month, year });
    const budgetSummary = await Promise.all(
      budgets.map(async (b) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: "expense",
              category: b.category,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalSpent = spent[0]?.total || 0;
        return {
          category: b.category,
          limit: b.limit,
          spent: totalSpent,
          remaining: b.limit - totalSpent,
          percentage: Math.min(Math.round((totalSpent / b.limit) * 100), 100),
        };
      })
    );

    // ── Active EMIs ──────────────────────────────────────────────────
    const activeEmis = await Emi.find({ user: userId, isActive: true });
    const totalEmiOutflow = activeEmis.reduce((s, e) => s + e.emiAmount, 0);

    // ── Recent transactions ──────────────────────────────────────────
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        allTime: {
          income: allTime.income,
          expense: allTime.expense,
          balance: allTime.income - allTime.expense,
        },
        monthly: {
          income: monthly.income,
          expense: monthly.expense,
          savings: monthly.income - monthly.expense,
          savingsRate:
            monthly.income > 0
              ? parseFloat(((monthly.savings || (monthly.income - monthly.expense)) / monthly.income * 100).toFixed(1))
              : 0,
        },
        categoryBreakdown,
        trend,
        dailyAgg,
        budgetSummary,
        emiSummary: {
          activeCount: activeEmis.length,
          totalMonthlyOutflow: totalEmiOutflow,
        },
        recentTransactions,
      },
    });
  } catch (err) {
    next(err);
  }
};