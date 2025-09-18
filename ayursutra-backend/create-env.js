#!/usr/bin/env node

// Script to create .env file with the correct MongoDB URL
const fs = require("fs");
const path = require("path");

const envContent = `# MongoDB Configuration
MONGO_URI=mongodb+srv://prince844121_db_user:.Chaman1@cluster0.yilecha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret
JWT_SECRET=ayursutra-super-secret-jwt-key-2024

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK Configuration (Optional)
FIREBASE_PROJECT_ID=reference-lens-436617-i5
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
`;

const envPath = path.join(__dirname, ".env");

try {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created successfully!");
  console.log("📝 Environment variables set:");
  console.log(
    "   MONGO_URI: mongodb+srv://prince844121_db_user:.Chaman1@cluster0.yilecha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
  console.log("   PORT: 4000");
  console.log("   NODE_ENV: development");
  console.log("   JWT_SECRET: ayursutra-super-secret-jwt-key-2024");
  console.log("   CORS_ORIGIN: http://localhost:3000");
  console.log("");
  console.log("🚀 You can now start the backend with: npm run dev");
} catch (error) {
  console.error("❌ Failed to create .env file:", error.message);
  console.log("");
  console.log(
    "📝 Please create the .env file manually with the following content:"
  );
  console.log("");
  console.log(envContent);
}
