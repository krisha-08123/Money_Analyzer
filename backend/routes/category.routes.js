import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getCategories).post(createCategory);
router.delete("/:id", deleteCategory);

export default router;