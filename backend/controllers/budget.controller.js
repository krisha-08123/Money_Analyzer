import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// POST /api/budgets
export const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year)
      return res.status(400).json({ success: false, message: "category, limit, month, year required" });

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month: parseInt(month), year: parseInt(year) },
      { limit: parseFloat(limit) },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

// GET /api/budgets?month=&year=
export const getBudgets = async (req, res, next) => {
  try {
    const now   = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ user: req.user._id, month, year });

    const data = await Promise.all(
      budgets.map(async (b) => {
        const agg = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: "expense",
              category: b.category,
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);

        const spent = agg[0]?.total || 0;
        return {
          _id: b._id,
          category: b.category,
          limit: b.limit,
          spent,
          remaining: b.limit - spent,
          percentage: Math.min(Math.round((spent / b.limit) * 100), 100),
          transactionCount: agg[0]?.count || 0,
          status: spent >= b.limit ? "exceeded" : spent >= b.limit * 0.8 ? "warning" : "safe",
        };
      })
    );

    res.json({ success: true, data, month, year });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/budgets/:id
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
    res.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    next(err);
  }
};