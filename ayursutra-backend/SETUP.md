# AyurSutra Backend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Firebase project with Admin SDK

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://prince844121_db_user:.Chaman1@cluster0.yilecha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret (generate a strong secret for production)
JWT_SECRET=ayursutra-super-secret-jwt-key-2024

# Firebase Admin SDK Configuration
# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=reference-lens-436617-i5
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Firebase Admin SDK Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (reference-lens-436617-i5)
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the following values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `POST /api/auth/exchange` - Exchange Firebase token for JWT
- `GET /api/users` - Get users (protected)
- `POST /api/schedule` - Create appointment (protected)
- `GET /api/tracking` - Get tracking data (protected)
- `POST /api/feedback` - Submit feedback (protected)
- `GET /api/reports` - Get reports (protected)

## Testing

The backend includes a Postman collection (`AyurSutra.postman_collection.json`) for testing all endpoints.

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or update MONGO_URI for cloud
- Check if the database name is correct

### Firebase Admin Issues

- Verify all Firebase environment variables are set correctly
- Ensure the service account has proper permissions
- Check if the project ID matches your Firebase project

### CORS Issues

- Update CORS_ORIGIN to match your frontend URL
- Ensure the frontend is making requests to the correct backend URL

## Deploying the Backend to Vercel

1. Ensure these environment variables are configured in Vercel Project Settings → Environment Variables:

   - `MONGO_URI`: your MongoDB connection string
   - `JWT_SECRET`: secret for app JWTs
   - `CORS_ORIGIN`: frontend origin (e.g., https://your-frontend.vercel.app)
   - Optionally: `NEXT_PUBLIC_APP_ORIGIN` matching your frontend origin

2. Project structure uses a serverless handler at `api/index.ts` via `serverless-http`.

   - All routes `/api/*` and `/health` are routed to this function by `vercel.json`.

3. After deployment, set the frontend env var to point to the backend base URL:

   - In frontend: `NEXT_PUBLIC_API_BASE=https://<your-backend>.vercel.app`

4. Local dev remains unchanged:
   - `npm run dev` starts Express on `http://localhost:4000`.
