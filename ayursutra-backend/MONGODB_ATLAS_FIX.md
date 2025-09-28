# MongoDB Atlas Sleep Mode Fix for Vercel

## Problem Summary

Your MongoDB Atlas cluster goes to sleep after inactivity, causing:

- Cold start delays when first request hits after sleep
- Intermittent connection failures
- "Connecting..." status that sometimes works, sometimes doesn't

## Root Causes Identified

1. **MongoDB Atlas Sleep Mode**: Free tier clusters sleep after 1 hour of inactivity
2. **Poor Connection Handling**: No retry logic for sleep mode wake-up
3. **Serverless Connection Issues**: Connection pooling not optimized for Vercel
4. **Missing Environment Variables**: Frontend pointing to wrong API URL

## Solutions Implemented

### 1. Enhanced Connection Management (`src/config/mongodb-serverless.ts`)

- ✅ Added connection promise caching to prevent multiple simultaneous connections
- ✅ Implemented `ensureConnection()` with health checks and automatic reconnection
- ✅ Optimized connection options for Atlas sleep mode:
  - `maxIdleTimeMS: 10000` - Close idle connections quickly
  - `serverSelectionTimeoutMS: 15000` - Longer timeout for cold starts
  - `serverSelectionRetryDelayMS: 2000` - Retry delay for sleep mode
  - `maxServerSelectionRetries: 3` - Multiple retry attempts

### 2. Database Connection Middleware (`src/middleware/dbConnection.ts`)

- ✅ Added middleware to ensure DB connection before processing requests
- ✅ Automatic reconnection on connection failures
- ✅ Graceful error handling with proper HTTP status codes

### 3. Updated Health Check (`src/index.ts`)

- ✅ Health endpoint now uses `ensureConnection()` for reliable status
- ✅ Better error reporting and connection state tracking

### 4. Frontend API Configuration (`src/lib/api.ts`)

- ✅ Updated default API URL to correct Vercel deployment
- ✅ Added proper timeout handling (10 seconds)
- ✅ Improved error handling for connection failures

## Required Environment Variables

Set these in your Vercel dashboard:

```env
# MongoDB Connection (REQUIRED)
MONGO_URI=mongodb+srv://prince844121_db_user:chaman123@cluster0.yilecha.mongodb.net/ayursutra?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (REQUIRED)
JWT_SECRET=ayursutra-super-secret-jwt-key-2024

# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=reference-lens-436617-i5
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# CORS Configuration (REQUIRED)
CORS_ORIGIN=https://ayursutra-care.vercel.app,http://localhost:3000

# Environment
NODE_ENV=production
```

## Frontend Environment Variables

Set these in your frontend Vercel dashboard:

```env
# API Base URL (REQUIRED)
NEXT_PUBLIC_API_BASE=https://ayursutra-panchakarma-api.vercel.app

# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## How to Deploy the Fix

### 1. Backend Deployment

```bash
cd ayursutra-backend
vercel --prod
```

### 2. Frontend Deployment

```bash
cd ayursutra-frontend
vercel --prod
```

### 3. Verify the Fix

1. Visit your health endpoint: `https://ayursutra-panchakarma-api.vercel.app/health`
2. Check that status is "OK" and database is "connected"
3. Test your frontend application

## Expected Behavior After Fix

### Before Fix:

- ❌ First request after sleep: "Connecting..." then sometimes fails
- ❌ Intermittent 503 errors
- ❌ Long response times on cold starts

### After Fix:

- ✅ First request after sleep: Automatic reconnection, works reliably
- ✅ No more 503 errors due to DB connection issues
- ✅ Faster response times with connection caching
- ✅ Proper error handling with user-friendly messages

## Monitoring and Debugging

### Health Check Endpoints:

- `/health` - Basic health status
- `/api/mongodb-status` - Detailed MongoDB connection info

### Vercel Logs:

Check your Vercel function logs for:

- Connection attempts and successes
- Sleep mode wake-up messages
- Any remaining connection errors

### MongoDB Atlas Monitoring:

- Monitor your cluster's sleep/wake cycles
- Check connection metrics in Atlas dashboard

## Additional Recommendations

### 1. Upgrade MongoDB Atlas Plan

Consider upgrading to a paid plan to avoid sleep mode:

- M0 Sandbox: $0/month (still sleeps)
- M2/M5: $9+/month (no sleep mode)

### 2. Implement Connection Pooling

For high-traffic applications, consider:

- MongoDB Atlas Data API
- Connection pooling services
- Database connection proxies

### 3. Add Monitoring

Implement monitoring for:

- Connection health
- Response times
- Error rates
- Sleep mode wake-up frequency

## Troubleshooting

### If issues persist:

1. **Check Environment Variables**:

   ```bash
   vercel env ls
   ```

2. **Test MongoDB Connection**:

   ```bash
   node test-mongodb-connection.js
   ```

3. **Check Vercel Logs**:

   - Go to Vercel Dashboard → Functions → View Logs
   - Look for MongoDB connection errors

4. **Verify MongoDB Atlas**:
   - Check cluster status
   - Verify network access (0.0.0.0/0)
   - Confirm user permissions

## Success Metrics

After implementing this fix, you should see:

- ✅ 99%+ uptime for health checks
- ✅ < 3 second response times for cold starts
- ✅ No more "Connecting..." indefinite states
- ✅ Reliable database operations

The fix addresses the core MongoDB Atlas sleep mode issue while maintaining optimal performance for your Vercel serverless deployment.
