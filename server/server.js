require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("./middleware/mongoSanitize");
const config = require("config");
const connectDB = require("./config/db");
const path = require("path");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

const jwtSecret = process.env.jwtSecret || (config.has("jwtSecret") ? config.get("jwtSecret") : null);
if (!jwtSecret) {
  throw new Error("jwtSecret is not set in config or env");
}

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

// Body parsers with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Prevent NoSQL injection
app.use(mongoSanitize());

// General rate limiter
app.use("/api", apiLimiter);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/notifications", require("./routes/api/notifications"));
app.use("/api/follow", require("./routes/api/follow"));

// Test route
app.get("/", (req, res) => res.send("Sopher API Running"));

const PORT = process.env.PORT || 5000;

// Connect to DB first, THEN start listening
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

start();
