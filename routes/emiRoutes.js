const express = require("express");
const router = express.Router();

const {
  addEmi,
  getEmis,
  updateEmi,
  deleteEmi
} = require("../controllers/emiController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, addEmi);
router.get("/", protect, getEmis);

router.put("/:id", protect, updateEmi);
router.delete("/:id", protect, deleteEmi);

module.exports = router;