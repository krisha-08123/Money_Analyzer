const Transaction = require("../models/Transaction");

exports.getDashboard = async (req, res) => {
  try {

    // Get all user transactions
    const transactions = await Transaction.find({
      user: req.user._id
    }).sort({ date: -1 });

    // Calculate totals
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    // Get recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      recentTransactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};