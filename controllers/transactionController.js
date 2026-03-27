const Transaction = require("../models/Transaction");

// Add transaction
exports.addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all transactions with pagination & filters
exports.getTransactions = async (req, res) => {
  try {

    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;

    const query = {
      user: req.user._id
    };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get financial summary
exports.getSummary = async (req, res) => {
  try {

    const transactions = await Transaction.find({
      user: req.user._id
    });

    const income = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      income,
      expense,
      balance: income - expense
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update transaction
exports.updateTransaction = async (req, res) => {
  try {

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.body,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Monthly financial report
exports.getMonthlyReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    report.forEach(item => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    res.json({
      income,
      expense,
      balance: income - expense
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};