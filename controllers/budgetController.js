const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");


// Create budget
exports.createBudget = async (req, res) => {
  try {

    const budget = await Budget.create({
      category: req.body.category,
      limit: req.body.limit,
      month: req.body.month,
      year: req.body.year,
      user: req.user._id
    });

    res.status(201).json(budget);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get budget status
exports.getBudgetStatus = async (req, res) => {
  try {

    const budgets = await Budget.find({
      user: req.user._id
    });

    const result = [];

    for (let budget of budgets) {

      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            category: budget.category,
            type: "expense"
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      const totalSpent = spent.length ? spent[0].total : 0;

      result.push({
        category: budget.category,
        limit: budget.limit,
        spent: totalSpent,
        remaining: budget.limit - totalSpent
      });
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};