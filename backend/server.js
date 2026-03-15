import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/error.middleware.js";

import authRoutes        from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import dashboardRoutes   from "./routes/dashboard.routes.js";
import budgetRoutes      from "./routes/budget.routes.js";
import categoryRoutes    from "./routes/category.routes.js";
import emiRoutes         from "./routes/emi.routes.js";

dotenv.config();
connectDB();

const app = express();

// ── Core middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/budgets",      budgetRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/emis",         emiRoutes);

// ── Health check ───────────────────────────────────────────────────
app.get("/api/health", (_, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() })
);

// ── 404 ────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// ── Global error handler ───────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer  →  http://localhost:${PORT}`);
  console.log(`Health  →  http://localhost:${PORT}/api/health\n`);
});