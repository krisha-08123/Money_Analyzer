import express from "express";
import { getEmis, createEmi, updateEmi, deleteEmi } from "../controllers/emi.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getEmis).post(createEmi);
router.route("/:id").put(updateEmi).delete(deleteEmi);

export default router;