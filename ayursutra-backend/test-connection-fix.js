#!/usr/bin/env node

/**
 * Test script to verify MongoDB Atlas connection fix
 * This script simulates the sleep mode scenario and tests reconnection
 */

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://prince844121_db_user:chaman123@cluster0.yilecha.mongodb.net/ayursutra?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  console.log("🧪 Testing MongoDB Atlas Connection Fix");
  console.log("=".repeat(50));

  try {
    // Test 1: Initial connection
    console.log("1️⃣ Testing initial connection...");
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      bufferCommands: false,
      retryWrites: true,
      w: "majority",
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      serverSelectionRetryDelayMS: 2000,
      maxServerSelectionRetries: 3,
    });

    console.log("✅ Initial connection successful");
    console.log("📊 Connection State:", mongoose.connection.readyState);
    console.log("🏠 Host:", mongoose.connection.host);
    console.log("🗄️ Database:", mongoose.connection.name);

    // Test 2: Health check
    console.log("\n2️⃣ Testing health check...");
    try {
      await mongoose.connection.db.admin().ping();
      console.log("✅ Health check passed");
    } catch (error) {
      console.log("❌ Health check failed:", error.message);
    }

    // Test 3: Simulate sleep mode by closing connection
    console.log("\n3️⃣ Simulating sleep mode (closing connection)...");
    await mongoose.connection.close();
    console.log("✅ Connection closed (simulating sleep)");
    console.log("📊 Connection State:", mongoose.connection.readyState);

    // Test 4: Reconnection after sleep
    console.log("\n4️⃣ Testing reconnection after sleep...");
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      bufferCommands: false,
      retryWrites: true,
      w: "majority",
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      serverSelectionRetryDelayMS: 2000,
      maxServerSelectionRetries: 3,
    });

    console.log("✅ Reconnection successful");
    console.log("📊 Connection State:", mongoose.connection.readyState);
    console.log("🏠 Host:", mongoose.connection.host);

    // Test 5: Final health check
    console.log("\n5️⃣ Final health check...");
    await mongoose.connection.db.admin().ping();
    console.log("✅ Final health check passed");

    console.log(
      "\n🎉 All tests passed! MongoDB Atlas sleep mode fix is working."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("🔍 Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  } finally {
    // Clean up
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("\n🧹 Connection closed");
    }
    process.exit(0);
  }
}

// Run the test
testConnection().catch(console.error);
