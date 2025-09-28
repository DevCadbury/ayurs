# AyurSutra Complete Setup Guide

## 🚀 Quick Start (Recommended)

### 1. Start Backend

```bash
cd ayursutra-backend
npm install
npm run dev:simple
```

### 2. Start Frontend

```bash
cd ayursutra-frontend
npm install
npm run dev
```

### 3. Test Authentication

- Open http://localhost:3000/auth
- Click "Try Demo Mode" for instant access
- Or use Firebase authentication (requires setup)

## 🔧 Backend Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (optional - backend works without it)

### Environment Variables

Create `ayursutra-backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/ayursutra
PORT=4000
NODE_ENV=development
JWT_SECRET=ayursutra-super-secret-jwt-key-2024
CORS_ORIGIN=http://localhost:3000
FIREBASE_PROJECT_ID=reference-lens-436617-i5
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

### Start Backend

```bash
cd ayursutra-backend
npm install
npm run dev:simple
```

### Backend Features

- ✅ **Health Check**: http://localhost:4000/health
- ✅ **API Base**: http://localhost:4000/api
- ✅ **Demo Mode**: Works without MongoDB/Firebase
- ✅ **CORS**: Configured for frontend
- ✅ **Error Handling**: Graceful fallbacks

## 🔥 Frontend Setup

### Prerequisites

- Node.js (v18+)
- Next.js 15.5.2

### Environment Variables (Optional)

Create `ayursutra-frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDfhgZj76OCQWbXoibordA3Axj23jTIx6w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=reference-lens-436617-i5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=reference-lens-436617-i5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=reference-lens-436617-i5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=549458075105
NEXT_PUBLIC_FIREBASE_APP_ID=1:549458075105:web:7e682b09c264c8e11486a0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1BYJFBCY9C
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### Start Frontend

```bash
cd ayursutra-frontend
npm install
npm run dev
```

### Frontend Features

- ✅ **Demo Mode**: Instant authentication
- ✅ **Firebase Auth**: Google & Email/Password
- ✅ **Error Handling**: Graceful fallbacks
- ✅ **Beautiful UI**: Animated components
- ✅ **Responsive**: Mobile-friendly

## 🔐 Authentication Options

### 1. Demo Mode (Recommended for Testing)

- Click "Try Demo Mode" button
- Instant access without setup
- Perfect for development

### 2. Firebase Authentication

- Requires Firebase project setup
- Google Sign-in
- Email/Password authentication
- Full user management

### 3. Backend Integration

- JWT token exchange
- User role management
- Database persistence

## 🛠️ Firebase Setup (Optional)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "AyurSutra"
3. Enable Authentication
4. Add web app

### 2. Configure Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google
4. Add authorized domains: localhost:3000

### 3. Get Service Account Key

1. Go to Project Settings > Service Accounts
2. Generate new private key
3. Download JSON file
4. Extract values for backend .env

## 🗄️ Database Setup (Optional)

### MongoDB Local

```bash
# Install MongoDB
# Start MongoDB service
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env
```

### Database Features

- User management
- Appointment scheduling
- Therapy tracking
- Feedback collection
- Report generation

## 🧪 Testing

### Backend API

```bash
# Health check
curl http://localhost:4000/health

# Test authentication
curl -X POST http://localhost:4000/api/auth/exchange \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{"uid":"test-user","email":"test@example.com","name":"Test User"}'
```

### Frontend

- Open http://localhost:3000
- Test all authentication methods
- Verify UI animations
- Check responsive design

## 🚨 Troubleshooting

### Backend Issues

- **Port 4000 in use**: Change PORT in .env
- **MongoDB connection failed**: Backend works in demo mode
- **Firebase Admin errors**: Check service account credentials

### Frontend Issues

- **Firebase errors**: Use demo mode or check configuration
- **API connection failed**: Ensure backend is running
- **Build errors**: Check Node.js version (v18+)

### Common Solutions

1. **Clear cache**: `npm run build` and restart
2. **Check ports**: Ensure 3000 (frontend) and 4000 (backend) are free
3. **Environment variables**: Verify all required variables are set
4. **Dependencies**: Run `npm install` in both directories

## 📱 Features Overview

### Landing Page

- Hero section with animations
- Features showcase
- Benefits section
- Testimonials
- Call-to-action

### Authentication

- Demo mode (instant access)
- Firebase Google sign-in
- Email/password authentication
- Error handling

### Dashboard (Coming Soon)

- Patient management
- Appointment scheduling
- Therapy tracking
- Reports and analytics

## 🎯 Next Steps

1. **Start both servers** using the commands above
2. **Test demo mode** for instant access
3. **Set up Firebase** for production authentication
4. **Configure MongoDB** for data persistence
5. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:

1. Check the console logs
2. Verify all environment variables
3. Ensure ports are available
4. Try demo mode first
5. Check the troubleshooting section above

---

**Happy coding! 🚀**
