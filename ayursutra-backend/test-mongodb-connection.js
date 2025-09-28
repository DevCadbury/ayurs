// Test MongoDB connection for debugging
const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  console.log("🧪 Testing MongoDB connection...");
  console.log("🔗 MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is not set!");
    process.exit(1);
  }

  try {
    console.log("🚀 Attempting connection...");

    const options = {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: "majority",
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);

    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Connection State:", mongoose.connection.readyState);
    console.log("🏠 Host:", mongoose.connection.host);
    console.log("🗄️ Database:", mongoose.connection.name);

    // Test a simple query
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
    });
    process.exit(1);
  }
}

testConnection();
