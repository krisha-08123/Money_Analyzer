const express = require("express");
const router = express.Router();

const {
  createBudget,
  getBudgetStatus
} = require("../controllers/budgetController");

const protect = require("../middleware/authMiddleware");


// Create budget
router.post("/", protect, createBudget);

// Get budget status
router.get("/status", protect, getBudgetStatus);

module.exports = router;