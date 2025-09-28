"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  Users,
  Stethoscope,
  Shield,
  Calendar,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const { uid, role, displayName, email } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!uid) {
      router.push("/auth");
    }
  }, [uid, router]);

  if (!uid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getRoleDashboard = () => {
    switch (role) {
      case "patient":
        return {
          title: "Patient Dashboard",
          description: "Track your therapy progress and manage appointments",
          href: "/dashboard/patient",
          icon: Users,
          color: "from-blue-500 to-cyan-600",
        };
      case "doctor":
        return {
          title: "Doctor Dashboard",
          description: "Manage patients and therapy sessions",
          href: "/dashboard/doctor",
          icon: Stethoscope,
          color: "from-green-500 to-teal-600",
        };
      case "admin":
        return {
          title: "Admin Dashboard",
          description: "Manage clinic operations and staff",
          href: "/dashboard/admin",
          icon: Shield,
          color: "from-purple-500 to-pink-600",
        };
      default:
        return {
          title: "Dashboard",
          description: "Welcome to your AyurSutra dashboard",
          href: "/dashboard/patient",
          icon: Users,
          color: "from-indigo-500 to-purple-600",
        };
    }
  };

  const roleDashboard = getRoleDashboard();

  return (
    <div className="space-y-8 pb-24 md:pb-28 lg:pb-32">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AyurSutra
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Your comprehensive Panchakarma Patient Management & Therapy Scheduling
          platform
        </p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {role === "patient"
            ? "Patient"
            : role === "doctor"
            ? "Doctor"
            : "Admin"}
        </Badge>
      </motion.div>

      {/* Role Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          <div
            className={`bg-gradient-to-r ${roleDashboard.color} p-6 text-white`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <roleDashboard.icon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{roleDashboard.title}</h2>
                <p className="text-white/90">{roleDashboard.description}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <Button
              onClick={() => router.push(roleDashboard.href)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              size="lg"
            >
              Access Your Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
              <CardDescription>
                Manage your appointments and therapy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </CardTitle>
              <CardDescription>
                Communicate with your healthcare team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports
              </CardTitle>
              <CardDescription>
                View your progress and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
