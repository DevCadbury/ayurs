# Firebase Setup Instructions

## Current Issue

The Firebase configuration is causing errors because the project configuration is not found. This is likely because:

1. The Firebase project doesn't exist
2. The API key is invalid
3. The project is not properly configured

## Solution

### Option 1: Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Authentication and Firestore
5. Get your configuration details

### Option 2: Use Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Option 3: Disable Firebase (Current State)

The app is currently configured to work without Firebase. Authentication will show an error message, but the app won't crash.

## Current Status

- ✅ Firebase errors are handled gracefully
- ✅ App won't crash if Firebase is not configured
- ✅ Google sign-in button is disabled when Firebase is not available
- ✅ User-friendly error messages are shown
- ✅ Cross-Origin-Opener-Policy (COOP) errors are handled
- ✅ Backend connection errors are handled with fallback to demo mode
- ✅ Demo authentication mode available for development
- ✅ Comprehensive error handling for all authentication scenarios

## New Features Added

### Demo Mode

- **Try Demo Mode** button allows testing the app without Firebase
- Automatically logs in as a demo patient user
- Perfect for development and testing

### Enhanced Error Handling

- **COOP Policy Errors**: Handled gracefully with user-friendly messages
- **Backend Connection**: Falls back to demo mode when backend is unavailable
- **Firebase Errors**: Specific error messages for different failure scenarios
- **Network Timeouts**: 10-second timeout prevents hanging requests

### Improved User Experience

- Clear error messages for all authentication scenarios
- Fallback authentication when services are unavailable
- Better visual separation between authentication options

## Next Steps

1. **For Development**: Use the "Try Demo Mode" button to test the app
2. **For Production**: Set up a Firebase project and add configuration to `.env.local`
3. **For Backend**: Start the backend server at `localhost:4000` for full functionality
4. **Test Authentication**: Try all authentication methods to ensure they work properly
