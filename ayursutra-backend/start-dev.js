#!/usr/bin/env node

// Simple script to start the backend with default environment variables
// This ensures the backend can run even without a .env file

const { spawn } = require("child_process");
const path = require("path");

// Set environment variables (override any existing values)
process.env.MONGO_URI =
  "mongodb+srv://prince844121_db_user:.Chaman1@cluster0.yilecha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
process.env.PORT = "4000";
process.env.NODE_ENV = "development";
process.env.JWT_SECRET = "ayursutra-super-secret-jwt-key-2024";
process.env.CORS_ORIGIN = "http://localhost:3000";

console.log("🚀 Starting AyurSutra Backend...");
console.log("📝 Environment variables:");
console.log(`   MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
console.log("");

// Start the development server
const child = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname,
});

child.on("error", (error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  console.log(`\n🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  child.kill("SIGINT");
});
