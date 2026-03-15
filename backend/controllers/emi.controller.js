import Emi from "../models/Emi.js";

// GET /api/emis
export const getEmis = async (req, res, next) => {
  try {
    const emis = await Emi.find({ user: req.user._id }).sort({ startDate: 1 });
    res.json({ success: true, data: emis });
  } catch (err) {
    next(err);
  }
};

// POST /api/emis
export const createEmi = async (req, res, next) => {
  try {
    const { title, totalAmount, emiAmount, totalMonths, startDate, dueDay, lender, interestRate } = req.body;

    if (!title || !totalAmount || !emiAmount || !totalMonths || !startDate || !dueDay)
      return res.status(400).json({ success: false, message: "Required fields missing" });

    const emi = await Emi.create({
      user: req.user._id,
      title,
      totalAmount: parseFloat(totalAmount),
      emiAmount: parseFloat(emiAmount),
      totalMonths: parseInt(totalMonths),
      startDate: new Date(startDate),
      dueDay: parseInt(dueDay),
      lender: lender || "",
      interestRate: parseFloat(interestRate) || 0,
    });

    res.status(201).json({ success: true, data: emi });
  } catch (err) {
    next(err);
  }
};

// PUT /api/emis/:id
export const updateEmi = async (req, res, next) => {
  try {
    const emi = await Emi.findOne({ _id: req.params.id, user: req.user._id });
    if (!emi) return res.status(404).json({ success: false, message: "EMI not found" });

    const fields = ["title", "totalAmount", "emiAmount", "totalMonths", "paidMonths", "startDate", "dueDay", "lender", "interestRate", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) emi[f] = req.body[f];
    });

    await emi.save();
    res.json({ success: true, data: emi });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/emis/:id
export const deleteEmi = async (req, res, next) => {
  try {
    const emi = await Emi.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!emi) return res.status(404).json({ success: false, message: "EMI not found" });
    res.json({ success: true, message: "EMI deleted" });
  } catch (err) {
    next(err);
  }
};