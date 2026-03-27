const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({

  category: {
    type: String,
    required: true
  },

  limit: {
    type: Number,
    required: true
  },

  month: {
    type: Number,
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);