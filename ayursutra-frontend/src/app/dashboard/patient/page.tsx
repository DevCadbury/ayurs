"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  Bell,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Info,
} from "lucide-react";

// Mock data for demonstration
const mockData = {
  upcomingAppointments: [
    {
      id: 1,
      date: "2024-01-15",
      time: "10:00 AM",
      therapist: "Dr. Sarah Johnson",
      therapy: "Panchakarma - Abhyanga",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-01-17",
      time: "2:00 PM",
      therapist: "Dr. Michael Chen",
      therapy: "Shirodhara",
      status: "pending",
    },
  ],
  recentProgress: [
    {
      therapy: "Abhyanga",
      sessions: 5,
      improvement: 85,
      lastSession: "2024-01-10",
    },
    {
      therapy: "Shirodhara",
      sessions: 3,
      improvement: 70,
      lastSession: "2024-01-08",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Appointment Reminder",
      message: "Your therapy session is scheduled for tomorrow at 10:00 AM",
      time: "2 hours ago",
      type: "reminder",
    },
    {
      id: 2,
      title: "Progress Update",
      message: "Your therapist has updated your progress report",
      time: "1 day ago",
      type: "update",
    },
  ],
};

const statCards = [
  {
    icon: <Calendar className="h-8 w-8 text-blue-600" />,
    label: "Upcoming Sessions",
    value: mockData.upcomingAppointments.length,
    color: "bg-blue-50",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-green-600" />,
    label: "Avg. Progress",
    value: `${Math.round(
      mockData.recentProgress.reduce((sum, p) => sum + p.improvement, 0) /
        mockData.recentProgress.length
    )}%`,
    color: "bg-green-50",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
    label: "Messages",
    value: 3,
    color: "bg-purple-50",
  },
  {
    icon: <Bell className="h-8 w-8 text-orange-600" />,
    label: "Notifications",
    value: mockData.notifications.length,
    color: "bg-orange-50",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PatientDashboard() {
  const { uid, role, displayName, email } = useAuthStore();

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white flex items-center gap-4"
          >
            <Star className="h-12 w-12 text-yellow-300 drop-shadow-lg" />
            <div>
              <h1 className="text-4xl font-extrabold mb-2">
                Welcome back, {displayName || "Patient"}!
              </h1>
              <p className="text-indigo-100 text-lg">
                Track your therapy progress, appointments, and updates in one
                beautiful dashboard.
              </p>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <Card
                  className={`rounded-xl shadow-sm hover:shadow-md transition ${stat.color} border-0`}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    {stat.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="rounded-xl shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 mr-1" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>
                    Your scheduled therapy sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-lg">
                              {appointment.date} at {appointment.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <Info className="inline h-4 w-4 mr-1 text-indigo-400" />
                            {appointment.therapist}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.therapy}
                          </p>
                        </div>
                        <span
                          className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                    {mockData.upcomingAppointments.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Calendar className="mx-auto mb-2" />
                        No upcoming appointments.
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="gradient"
                    onClick={() =>
                      (window.location.href = "/dashboard/patient/schedule")
                    }
                  >
                    View All Appointments
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Therapy Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="rounded-xl shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    Therapy Progress
                  </CardTitle>
                  <CardDescription>
                    Your recent therapy improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.recentProgress.map((progress, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {progress.therapy}
                          </span>
                          <span className="text-sm text-gray-500">
                            {progress.improvement}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.improvement}%` }}
                            transition={{ duration: 1.2 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{progress.sessions} sessions</span>
                          <span>Last: {progress.lastSession}</span>
                        </div>
                      </div>
                    ))}
                    {mockData.recentProgress.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <TrendingUp className="mx-auto mb-2" />
                        No progress data yet.
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4" variant="gradient">
                    View Detailed Progress
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="rounded-xl shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 mr-1" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  Important updates and reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.1 * notification.id,
                      }}
                      className="flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow transition"
                    >
                      <div className="flex-shrink-0">
                        {notification.type === "reminder" ? (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {mockData.notifications.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Bell className="mx-auto mb-2" />
                      No notifications yet.
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="gradient">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <style jsx global>{`
          .btn-gradient,
          .btn-gradient:focus,
          .btn-gradient:hover {
            background: linear-gradient(90deg, #6366f1, #a78bfa);
            color: white;
            border: none;
          }
        `}</style>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
