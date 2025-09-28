import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check if we're in development mode and Firebase is properly configured
const isDevelopment = process.env.NODE_ENV === "development";
const hasValidFirebaseConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDfhgZj76OCQWbXoibordA3Axj23jTIx6w",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "reference-lens-436617-i5.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "reference-lens-436617-i5",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "reference-lens-436617-i5.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "549458075105",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:549458075105:web:7e682b09c264c8e11486a0",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1BYJFBCY9C",
};

// Initialize Firebase only if we have valid configuration
let app = null;
let auth = null;
let googleProvider = null;
let db = null;

if (hasValidFirebaseConfig || !isDevelopment) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    // Create mock objects for development
    app = null;
    auth = null;
    googleProvider = null;
    db = null;
  }
} else {
  console.warn(
    "Firebase not configured. Using mock authentication for development."
  );
}

// Initialize Analytics (only in browser and with valid app)
export const analytics =
  typeof window !== "undefined" && app ? getAnalytics(app) : null;

export { auth, googleProvider, db };
