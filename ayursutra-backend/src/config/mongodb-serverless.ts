// MongoDB connection handler optimized for Vercel serverless
import mongoose from "mongoose";

// Global variable to track connection state
let isConnected = false;
let connectionPromise: Promise<typeof mongoose.connection> | null = null;

export async function connectToDatabase() {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    console.log("⏳ Waiting for existing connection attempt...");
    return connectionPromise;
  }

  // Start new connection attempt
  connectionPromise = performConnection();
  return connectionPromise;
}

async function performConnection(): Promise<typeof mongoose.connection> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    console.log("🚀 Connecting to MongoDB...");
    console.log("🔗 Using URI:", mongoUri.replace(/\/\/.*@/, "//***:***@"));

    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
      console.log("🔄 Closing existing connection...");
      await mongoose.connection.close();
    }

    const options = {
      maxPoolSize: 1, // Single connection for serverless
      minPoolSize: 0, // Allow connection to close when idle
      serverSelectionTimeoutMS: 15000, // Increased timeout for cold starts
      socketTimeoutMS: 60000, // Increased socket timeout
      bufferCommands: false, // Disable buffering for serverless
      retryWrites: true,
      w: "majority" as any,
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 10000, // Close connection after 10s of inactivity
      connectTimeoutMS: 15000, // Increased connection timeout
      heartbeatFrequencyMS: 10000, // Check connection health every 10s
    };

    await mongoose.connect(mongoUri, options);

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Connection State:", mongoose.connection.readyState);
    console.log("🏠 Connected to:", mongoose.connection.host);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      isConnected = true;
    });

    // Reset connection promise on successful connection
    connectionPromise = null;
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    isConnected = false;
    connectionPromise = null;
    throw error;
  }
}

export async function ensureConnection() {
  try {
    // Check if connection is healthy
    if (mongoose.connection.readyState === 1) {
      // Test the connection with a simple ping
      await mongoose.connection.db.admin().ping();
      return mongoose.connection;
    }
  } catch (error) {
    console.log("🔄 Connection unhealthy, reconnecting...", error);
    isConnected = false;
  }

  // If not connected or unhealthy, establish new connection
  return connectToDatabase();
}

export function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    hasUri: !!process.env.MONGO_URI,
    environment: process.env.NODE_ENV || "development",
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
  };
}

// Graceful shutdown
export async function closeConnection() {
  if (mongoose.connection.readyState !== 0) {
    console.log("🔄 Closing MongoDB connection...");
    await mongoose.connection.close();
    isConnected = false;
    connectionPromise = null;
  }
}
