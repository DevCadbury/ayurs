# Vercel Deployment Guide for AyurSutra Backend

## MongoDB Connection Issues - SOLVED

This guide addresses the MongoDB connection problems you were experiencing on Vercel deployment.

## Issues Fixed

1. **Hardcoded MongoDB URI**: Removed hardcoded connection string for security
2. **Serverless Optimization**: Updated connection options for Vercel's serverless environment
3. **Environment Variables**: Added proper error handling for missing MONGO_URI
4. **Connection Pooling**: Reduced pool size to 1 for serverless functions
5. **Health Check**: Enhanced health endpoint with connection retry logic

## Required Environment Variables

You MUST set these environment variables in your Vercel dashboard:

### 1. MongoDB Connection

```env
MONGO_URI=mongodb+srv://prince844121_db_user:.Chaman1@cluster0.yilecha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 2. JWT Secret

```env
JWT_SECRET=ayursutra-super-secret-jwt-key-2024
```

### 3. Firebase Configuration

```env
FIREBASE_PROJECT_ID=reference-lens-436617-i5
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

### 4. CORS Configuration

```env
CORS_ORIGIN=https://ayursutra-panchakarma.vercel.app,http://localhost:3000
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project: `ayursutra-panchakarma-api`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `MONGO_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production, Preview, Development (select all)
5. Repeat for all variables above

## Testing the Connection

### 1. Test Locally

```bash
cd ayursutra-backend
node test-mongodb-connection.js
```

### 2. Test on Vercel

After deployment, visit:

- `https://ayursutra-panchakarma-api.vercel.app/health`
- `https://ayursutra-panchakarma-api.vercel.app/api/health`

## Key Changes Made

### 1. MongoDB Configuration (`src/config/mongodb-fallback.ts`)

- Removed hardcoded URI
- Added proper error handling for missing MONGO_URI
- Optimized connection options for serverless

### 2. Serverless Connection Handler (`src/config/mongodb-serverless.ts`)

- New connection handler optimized for Vercel
- Global connection state tracking
- Automatic reconnection logic

### 3. Enhanced Health Check (`src/index.ts`)

- Health endpoint now attempts to connect if disconnected
- Better error reporting
- Proper HTTP status codes (200/503)

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster allows connections from:

- **IP Address**: `0.0.0.0/0` (all IPs) - You mentioned this is already set
- **Database User**: `prince844121_db_user` with proper permissions
- **Network Access**: Should allow all IPs

## Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Redeploy** your backend:
   ```bash
   cd ayursutra-backend
   vercel --prod
   ```
3. **Test** the health endpoint
4. **Check logs** in Vercel dashboard for any errors

## Troubleshooting

### If MongoDB still doesn't connect:

1. **Check Vercel Logs**:

   - Go to Vercel dashboard → Functions → View Function Logs
   - Look for MongoDB connection errors

2. **Verify Environment Variables**:

   - Ensure MONGO_URI is set correctly
   - Check for typos in variable names

3. **Test MongoDB URI**:

   - Use the test script: `node test-mongodb-connection.js`
   - Try connecting with MongoDB Compass

4. **Check MongoDB Atlas**:
   - Verify user permissions
   - Check network access settings
   - Ensure cluster is running

## Expected Health Check Response

When working correctly, `/health` should return:

```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "database": "connected",
  "mongoState": 1,
  "environment": "production",
  "hasMongoUri": true,
  "mongoHost": "cluster0-shard-00-00.yilecha.mongodb.net",
  "mongoDatabase": "ayursutra"
}
```

## Next Steps

1. Set the environment variables in Vercel
2. Redeploy the backend
3. Test the health endpoint
4. Verify your frontend can now connect to the API

The CORS issues should also be resolved with the updated configuration.
