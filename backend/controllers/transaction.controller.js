import Transaction from "../models/Transaction.js";

// POST /api/transactions
export const createTransaction = async (req, res, next) => {
  try {
    const { type, title, amount, category, note, date, paymentMode } = req.body;

    if (!type || !title || !amount || !category)
      return res.status(400).json({ success: false, message: "type, title, amount, category are required" });

    const tx = await Transaction.create({
      user: req.user._id,
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      note: note || "",
      date: date ? new Date(date) : new Date(),
      paymentMode: paymentMode || "cash",
    });

    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions
export const getTransactions = async (req, res, next) => {
  try {
    const {
      type, category, paymentMode,
      startDate, endDate,
      page = 1, limit = 20,
      sort = "date", order = "desc",
    } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMode) filter.paymentMode = paymentMode;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + "T23:59:59");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sort]: order === "asc" ? 1 : -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/:id
export const getTransactionById = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });

    const fields = ["type", "title", "amount", "category", "note", "date", "paymentMode"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) tx[f] = req.body[f];
    });

    await tx.save();
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};