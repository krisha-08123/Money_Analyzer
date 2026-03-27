const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getSummary,
  updateTransaction,
  deleteTransaction,
  getMonthlyReport
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");
const { validateTransaction } = require("../middleware/validationMiddleware");


// Add transaction
router.post("/", protect, validateTransaction, addTransaction);


// Get all transactions (pagination + filters supported)
router.get("/", protect, getTransactions);


// Financial summary
router.get("/summary", protect, getSummary);


// Update transaction
router.put("/:id", protect, validateTransaction, updateTransaction);


// Delete transaction
router.delete("/:id", protect, deleteTransaction);

//Get monthly report
router.get("/report/monthly", protect, getMonthlyReport);


module.exports = router;