"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { selectUserRole } from "@/lib/api";
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
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface RoleSelectionProps {
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
  };
  onRoleSelected: (role: string) => void;
}

const roles = [
  {
    id: "patient",
    title: "Patient",
    description:
      "Track your therapy progress, manage appointments, and communicate with your healthcare team.",
    icon: Users,
    color: "from-blue-500 to-cyan-600",
    features: [
      "View therapy schedule",
      "Track progress",
      "Message doctors",
      "Submit feedback",
      "Receive notifications",
    ],
  },
  {
    id: "doctor",
    title: "Doctor/Therapist",
    description:
      "Manage patients, prescribe therapies, update treatment status, and monitor patient progress.",
    icon: Stethoscope,
    color: "from-green-500 to-teal-600",
    features: [
      "Manage patients",
      "Schedule therapies",
      "Update progress",
      "Send notifications",
      "Generate reports",
    ],
  },
  {
    id: "admin",
    title: "Administrator",
    description:
      "Manage clinic operations, staff, schedules, and generate comprehensive reports.",
    icon: Shield,
    color: "from-purple-500 to-pink-600",
    features: [
      "Staff management",
      "System oversight",
      "Revenue reports",
      "Schedule management",
      "System settings",
    ],
  },
];

export default function RoleSelection({
  user,
  onRoleSelected,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Call API to save role with name/email so DB has full profile
      const { token } = await selectUserRole(user.uid, role, {
        name: user.displayName,
        email: user.email,
      });
      localStorage.setItem("app_jwt", token);
      onRoleSelected(role);
    } catch (error) {
      console.error("Role selection failed:", error);
      // Fallback to demo mode
      localStorage.setItem("app_jwt", "demo-token");
      onRoleSelected(role);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to AyurSutra!</h1>
            <p className="text-indigo-100 mb-4">
              Please select your role to get started with your personalized
              dashboard
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user.displayName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold">{user.displayName || "User"}</p>
                <p className="text-sm text-indigo-100">{user.email}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: roles.indexOf(role) * 0.1 }}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedRole === role.id
                      ? "ring-2 ring-indigo-500 scale-105"
                      : "hover:scale-105"
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <Card
                    className={`h-full border-2 ${
                      selectedRole === role.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center`}
                      >
                        <role.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {role.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {selectedRole === role.id && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => selectedRole && handleRoleSelect(selectedRole)}
                disabled={!selectedRole || isLoading}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your dashboard...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Continue to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
