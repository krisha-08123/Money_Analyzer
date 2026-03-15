import mongoose from "mongoose";

const emiSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total loan amount is required"],
      min: 1,
    },
    emiAmount: {
      type: Number,
      required: [true, "EMI amount is required"],
      min: 1,
    },
    totalMonths: {
      type: Number,
      required: [true, "Total months is required"],
      min: 1,
      max: 360,
    },
    paidMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    dueDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      default: 1,
    },
    lender: {
      type: String,
      trim: true,
      default: "",
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emi", emiSchema);