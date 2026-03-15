import express from "express";
import { createOrUpdateBudget, getBudgets, deleteBudget } from "../controllers/budget.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getBudgets).post(createOrUpdateBudget);
router.delete("/:id", deleteBudget);

export default router;