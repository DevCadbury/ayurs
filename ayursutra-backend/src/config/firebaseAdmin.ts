import admin from "firebase-admin";

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
      console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("❌ Firebase Admin SDK initialization failed:", error);
    }
  } else {
    console.warn(
      "⚠️ Firebase Admin SDK not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env"
    );
    // Initialize with default app for development
    admin.initializeApp({
      projectId: projectId,
    });
  }
}

export const adminAuth = admin.auth();

// Export a function to check if Firebase is properly configured
export const isFirebaseAdminConfigured = () => isFirebaseConfigured;
