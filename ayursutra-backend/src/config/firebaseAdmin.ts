import admin from "firebase-admin";
import path from "path";

// For your project: reference-lens-436617-i5
const projectId = process.env.FIREBASE_PROJECT_ID || "reference-lens-436617-i5";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Check if Firebase Admin SDK is properly configured
const isFirebaseConfigured = projectId && clientEmail && privateKey;

if (!admin.apps.length) {
  if (isFirebaseConfigured) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        } as admin.ServiceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully with environment variables");
    } catch (error) {
      console.error("❌ Firebase Admin SDK initialization failed:", error);
    }
  } else {
    // Try to use service account key file
    try {
      const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
      console.log("🔍 Looking for service account key at:", serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: projectId,
      });
      console.log("✅ Firebase Admin SDK initialized successfully with service account key file");
    } catch (error) {
      console.warn(
        "⚠️ Firebase Admin SDK not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env or place firebase-service-account.json in the backend root"
      );
      console.error("❌ Service account key file initialization failed:", error);
      // Initialize with default app for development
      admin.initializeApp({
        projectId: projectId,
      });
    }
  }
}

export const adminAuth = admin.auth();

// Export a function to check if Firebase is properly configured
export const isFirebaseAdminConfigured = () => {
  // Check if configured via environment variables
  if (isFirebaseConfigured) return true;
  
  // Check if service account key file exists
  try {
    const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
    const fs = require('fs');
    return fs.existsSync(serviceAccountPath);
  } catch {
    return false;
  }
};
