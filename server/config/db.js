const mongoose = require("mongoose");
const config = require("config");

const connectDB = async () => {
  try {
    const db = process.env.MONGO_URI || (config.has("mongoURI") ? config.get("mongoURI") : null);
    if (!db) {
      throw new Error("mongoURI is not set in config or environment vars");
    }
    await mongoose.connect(db, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
