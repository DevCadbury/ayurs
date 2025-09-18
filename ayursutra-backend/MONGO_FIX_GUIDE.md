# MongoDB Connection Fix Guide

## 🚨 Current Issue

The backend is trying to connect to `localhost:27017` instead of your cloud MongoDB Atlas database.

## 🔧 Solution

### Option 1: Create .env file (Recommended)

Run this command to create the .env file:

```bash
npm run create-env
```

### Option 2: Create .env file manually

Create a file named `.env` in the `ayursutra-backend` directory with this content:

```env
# MongoDB Configuration
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
```

### Option 3: Use the start-dev.js script

The `start-dev.js` script now sets the MongoDB URL directly:

```bash
npm run dev:simple
```

## 🧪 Test the Fix

1. **Create the .env file** using one of the options above
2. **Start the backend**:
   ```bash
   npm run dev
   ```
3. **Check the logs** - you should see:
   ```
   ✅ MongoDB connected successfully
   ```
4. **Test the API**:
   ```bash
   npm run test:api
   ```

## 🔍 Troubleshooting

### If you still see localhost:27017 in the logs:

1. Make sure the `.env` file is in the `ayursutra-backend` directory
2. Check that the `.env` file has the correct MongoDB URL
3. Restart the backend server

### If MongoDB connection fails:

1. Check your MongoDB Atlas cluster is running
2. Verify the connection string is correct
3. Check if your IP is whitelisted in MongoDB Atlas
4. Ensure the database user has proper permissions

## 📋 Environment Variables Explained

- **MONGO_URI**: Your MongoDB Atlas connection string
- **PORT**: Backend server port (4000)
- **NODE_ENV**: Environment mode (development)
- **JWT_SECRET**: Secret key for JWT tokens
- **CORS_ORIGIN**: Frontend URL for CORS (localhost:3000)

## ✅ Expected Output

When working correctly, you should see:

```
🚀 AyurSutra Backend API running on port 4000
📊 Health check: http://localhost:4000/health
🔗 API Base URL: http://localhost:4000/api
✅ MongoDB connected successfully
```

## 🚀 Quick Commands

```bash
# Create .env file
npm run create-env

# Start backend with .env
npm run dev

# Start backend without .env (uses hardcoded values)
npm run dev:simple

# Test API
npm run test:api
```
