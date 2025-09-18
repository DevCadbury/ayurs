# Patient Schedule Implementation

## Overview

This document describes the complete implementation of the patient schedule functionality for the AyurSutra application, including both frontend and backend components.

## 🎯 Features Implemented

### Frontend (Next.js + TypeScript)

- **Schedule Page**: `/dashboard/patient/schedule`
- **Appointment Management**: View, book, cancel, and reschedule appointments
- **Real-time Data**: Integration with backend APIs
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Smooth Animations**: Framer Motion for enhanced UX
- **Error Handling**: Comprehensive error states and loading indicators

### Backend (Node.js + Express + MongoDB)

- **RESTful APIs**: Complete CRUD operations for appointments
- **Role-based Access**: Secure endpoints with JWT authentication
- **Data Validation**: Input validation and conflict detection
- **MongoDB Integration**: Mongoose schemas and relationships

## 📁 File Structure

### Frontend Files

```
ayursutra-frontend/src/
├── app/dashboard/patient/schedule/
│   └── page.tsx                    # Main schedule page component
├── components/ui/
│   └── select.tsx                  # Select dropdown component
└── lib/
    └── api.ts                      # API integration functions
```

### Backend Files

```
ayursutra-backend/src/
├── routes/
│   ├── schedule.ts                 # Appointment endpoints
│   ├── users.ts                    # User management endpoints
│   └── therapies.ts                # Therapy management endpoints
├── models/
│   ├── Appointment.ts              # Appointment schema
│   ├── User.ts                     # User schema
│   └── Therapy.ts                  # Therapy schema
└── seed/
    ├── schedule-seed.ts            # Sample data for testing
    └── index.ts                    # Main seed script
```

## 🚀 API Endpoints

### Schedule Endpoints

- `GET /api/schedule/patient/:patientId` - Get patient's appointments
- `GET /api/schedule/doctor/:doctorId` - Get doctor's appointments
- `POST /api/schedule` - Create new appointment
- `PATCH /api/schedule/:id/status` - Update appointment status
- `PATCH /api/schedule/:id` - Update appointment details
- `DELETE /api/schedule/:id` - Delete appointment
- `GET /api/schedule/availability/:doctorId/:date` - Get available time slots

### User Endpoints

- `GET /api/users?role=doctor` - Get all doctors
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Therapy Endpoints

- `GET /api/therapies` - Get all therapies
- `GET /api/therapies/:id` - Get therapy by ID
- `POST /api/therapies` - Create therapy (admin only)
- `PUT /api/therapies/:id` - Update therapy (admin only)
- `DELETE /api/therapies/:id` - Delete therapy (admin only)

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
cd ayursutra-backend
npm install
npm run seed  # Populate database with sample data
npm run dev   # Start development server
```

### 2. Frontend Setup

```bash
cd ayursutra-frontend
npm install
npm run dev   # Start development server
```

### 3. Database Setup

Ensure MongoDB is running and update the connection string in your `.env` file:

```
MONGO_URI=mongodb://localhost:27017/ayursutra
```

## 🎨 UI Components

### Schedule Page Features

- **Header Section**: Page title and "Book Appointment" button
- **Search & Filters**: Search by doctor/therapy name, filter by status
- **Appointment Cards**: Detailed appointment information with actions
- **Quick Stats**: Overview of appointment counts by status/type
- **Booking Modal**: Form to create new appointments
- **Loading States**: Spinner and skeleton loaders
- **Error Handling**: User-friendly error messages

### Responsive Design

- **Mobile**: Single column layout with touch-friendly buttons
- **Tablet**: Two-column grid for appointment cards
- **Desktop**: Full-width layout with sidebar navigation

## 🔐 Security Features

### Authentication

- JWT token validation for all API requests
- Role-based access control (RBAC)
- Firebase UID verification

### Authorization

- Patients can only view/modify their own appointments
- Doctors can manage their own appointments
- Admins have full access to all data

### Data Validation

- Input sanitization and validation
- Scheduling conflict detection
- Required field validation

## 📊 Data Models

### Appointment Schema

```typescript
interface IAppointment {
  patient: ObjectId; // Reference to User
  doctor: ObjectId; // Reference to User
  therapy: ObjectId; // Reference to Therapy
  startTime: Date; // Appointment start time
  endTime: Date; // Appointment end time
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string; // Optional notes
  type?: "in_person" | "video_call"; // Session type
}
```

### User Schema

```typescript
interface IUser {
  uid: string; // Firebase UID
  name: string; // User's full name
  email: string; // User's email
  role: "patient" | "doctor" | "admin";
}
```

### Therapy Schema

```typescript
interface ITherapy {
  name: string; // Therapy name
  description?: string; // Therapy description
  durationMinutes: number; // Session duration
}
```

## 🧪 Testing

### API Testing

Run the test script to verify all endpoints:

```bash
cd ayursutra-backend
node test-schedule-api.js
```

### Manual Testing

1. **Login as Patient**: Use Firebase Auth to login
2. **View Schedule**: Navigate to `/dashboard/patient/schedule`
3. **Book Appointment**: Click "Book Appointment" and fill the form
4. **Cancel Appointment**: Use the dropdown menu to cancel
5. **Filter/Search**: Test search and filter functionality

## 🚀 Deployment

### Environment Variables

```bash
# Backend
MONGO_URI=mongodb://localhost:27017/ayursutra
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project

# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
```

### Production Build

```bash
# Backend
npm run build
npm start

# Frontend
npm run build
npm start
```

## 🔄 Future Enhancements

### Planned Features

- **Calendar View**: Monthly/weekly calendar interface
- **Recurring Appointments**: Support for recurring sessions
- **Email Notifications**: Automated appointment reminders
- **Video Integration**: Built-in video calling for remote sessions
- **Payment Integration**: Online payment processing
- **Mobile App**: React Native mobile application

### Performance Optimizations

- **Caching**: Redis cache for frequently accessed data
- **Pagination**: Implement pagination for large appointment lists
- **Real-time Updates**: WebSocket integration for live updates
- **Image Optimization**: Optimize doctor profile images

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**: Check if backend server is running
2. **Authentication Error**: Verify JWT token is valid
3. **Database Connection**: Ensure MongoDB is running
4. **CORS Issues**: Check CORS configuration in backend

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=ayursutra:*
```

## 📝 API Documentation

For detailed API documentation, refer to the Postman collection:
`ayursutra-backend/AyurSutra.postman_collection.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

