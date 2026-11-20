
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// =====================================
// MIDDLEWARE
// =====================================

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =====================================
// API ROUTES
// =====================================

// Authentication APIs
app.use("/api/auth", authRoutes);

// AI Chat API
app.use("/api/chat", chatRoutes);

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRMS Backend is running successfully!",
  });
});

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================
// ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`HRMS Backend running on http://localhost:${PORT}`);
  console.log("Authentication routes: /api/auth");
  console.log("AI Chat route: /api/chat");
});
