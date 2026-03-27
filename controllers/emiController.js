const Emi = require("../models/Emi");

// Add EMI
exports.addEmi = async (req, res) => {
  try {
    const { title, amount, dueDate } = req.body;

    const emi = await Emi.create({
      user: req.user.id,  // from auth middleware (next step)
      title,
      amount,
      dueDate,
    });

    res.status(201).json({
      message: "EMI added successfully",
      emi,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All EMI for user
exports.getEmis = async (req, res) => {
  try {
    const emis = await Emi.find({ user: req.user.id });

    res.json(emis);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update EMI
exports.updateEmi = async (req, res) => {
  try {
    const { title, amount, duration } = req.body;

    const emi = await Emi.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({
        message: "EMI not found",
      });
    }

    // Update EMI fields
    emi.title = title || emi.title;
    emi.amount = amount || emi.amount;
    emi.duration = duration || emi.duration;

    const updatedEmi = await emi.save();

    res.json({
      message: "EMI updated successfully",
      updatedEmi,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete EMI
exports.deleteEmi = async (req, res) => {
  try {
    const emi = await Emi.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({
        message: "EMI not found",
      });
    }

    await emi.deleteOne();

    res.json({
      message: "EMI deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};