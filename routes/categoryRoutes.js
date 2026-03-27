const express = require("express");
const router = express.Router();

const {
  addCategory,
  getCategories,
  deleteCategory
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");


// Add category
router.post("/", protect, addCategory);

// Get categories
router.get("/", protect, getCategories);

// Delete category
router.delete("/:id", protect, deleteCategory);

module.exports = router;