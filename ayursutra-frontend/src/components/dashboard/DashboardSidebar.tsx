"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Home,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  Bell,
  User,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Shield,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const navigationItems = {
  patient: [
    { name: "Dashboard", href: "/dashboard/patient", icon: Home },
    {
      name: "My Schedule",
      href: "/dashboard/patient/schedule",
      icon: Calendar,
    },
    {
      name: "Therapy Progress",
      href: "/dashboard/patient/progress",
      icon: TrendingUp,
    },
    {
      name: "Messages",
      href: "/dashboard/patient/messages",
      icon: MessageSquare,
    },
    { name: "Feedback", href: "/dashboard/patient/feedback", icon: FileText },
    {
      name: "Notifications",
      href: "/dashboard/patient/notifications",
      icon: Bell,
    },
  ],
  doctor: [
    { name: "Dashboard", href: "/dashboard/doctor", icon: Home },
    { name: "Patients", href: "/dashboard/doctor/patients", icon: Users },
    { name: "Schedule", href: "/dashboard/doctor/schedule", icon: Calendar },
    {
      name: "Therapies",
      href: "/dashboard/doctor/therapies",
      icon: Stethoscope,
    },
    {
      name: "Messages",
      href: "/dashboard/doctor/messages",
      icon: MessageSquare,
    },
    { name: "Reports", href: "/dashboard/doctor/reports", icon: BarChart3 },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard/admin", icon: Home },
    { name: "Staff Management", href: "/dashboard/admin/staff", icon: Users },
    { name: "Schedules", href: "/dashboard/admin/schedules", icon: Calendar },
    { name: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

export default function DashboardSidebar({
  isOpen,
  onClose,
  userRole,
}: DashboardSidebarProps) {
  // Sidebar removed per request
  return null;
}
