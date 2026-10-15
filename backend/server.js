const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const savingsGoalRoutes = require("./routes/savingsGoalRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://fin-track-hscorsnzo-anshuman-kodz.vercel.app",
        "https://fin-track-six-gray.vercel.app",
        "https://fin-track-1jk5ij8gc-anshuman-kodz.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "FinTrack API is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});