// MongoDB connection handler optimized for Vercel serverless
import mongoose from "mongoose";

// Global variable to track connection state
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    console.log("🚀 Connecting to MongoDB...");
    console.log("🔗 Using URI:", mongoUri.replace(/\/\/.*@/, "//***:***@"));

    const options = {
      maxPoolSize: 1, // Single connection for serverless
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: "majority" as any,
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    await mongoose.connect(mongoUri, options);

    isConnected = true;
    console.log("✅ MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      isConnected = true;
    });

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    isConnected = false;
    throw error;
  }
}

export function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    hasUri: !!process.env.MONGO_URI,
    environment: process.env.NODE_ENV || "development",
  };
}
