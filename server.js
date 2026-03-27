require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Routes
const userRoutes = require("./routes/userRoutes");
const emiRoutes = require("./routes/emiRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// Connect database
connectDB();


// Global Middlewares
app.use(cors());
app.use(express.json());


// Security Middleware
app.use(helmet());


// Logger
app.use(morgan("dev"));


// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});

app.use(limiter);


// Routes
app.use("/api/users", userRoutes);
app.use("/api/emis", emiRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Money Analyzer API Running");
});


// Error Handler (must be last middleware)
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

