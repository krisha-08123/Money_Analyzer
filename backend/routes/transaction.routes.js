import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getTransactions).post(createTransaction);
router.route("/:id").get(getTransactionById).put(updateTransaction).delete(deleteTransaction);

export default router;