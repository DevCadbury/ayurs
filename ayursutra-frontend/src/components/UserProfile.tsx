"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Stethoscope,
  Shield,
  ArrowRight,
  LogOut,
  Settings,
  User,
} from "lucide-react";

export default function UserProfile() {
  const { uid, role, displayName, email, setAuth } = useAuthStore();
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [showDashboardDialog, setShowDashboardDialog] = useState(false);
  const router = useRouter();

  // Fetch Google profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (email) {
        try {
          // Try to get profile picture from Google using the stored credential
          const credential = localStorage.getItem("google_access_token");
          if (credential) {
            // Decode the JWT credential to get user info
            const base64Url = credential.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const userInfo = JSON.parse(jsonPayload);
            if (userInfo.picture) {
              setProfilePicture(userInfo.picture);
            }
          }
        } catch (error) {
          console.log("Could not fetch Google profile picture:", error);
        }
      }
    };

    fetchProfilePicture();
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("app_jwt");
    localStorage.removeItem("google_access_token");
    setAuth({ uid: null, role: null, displayName: null, email: null });
    window.location.reload();
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "patient":
        return {
          title: "Patient",
          icon: Users,
          color: "from-blue-500 to-cyan-600",
          description: "Track your therapy progress and manage appointments",
        };
      case "doctor":
        return {
          title: "Doctor",
          icon: Stethoscope,
          color: "from-green-500 to-emerald-600",
          description: "Manage your patients and therapy sessions",
        };
      case "admin":
        return {
          title: "Admin",
          icon: Shield,
          color: "from-purple-500 to-pink-600",
          description: "Manage clinic operations and staff",
        };
      default:
        return {
          title: "User",
          icon: Users,
          color: "from-indigo-500 to-purple-600",
          description: "Welcome to AyurSutra",
        };
    }
  };

  const roleInfo = getRoleInfo(role || "patient");

  const handleGoToDashboard = () => {
    setShowDashboardDialog(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profilePicture} alt={displayName || "User"} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                {displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profilePicture} alt={displayName || "User"} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm">
                {displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{displayName || "User"}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {email || "user@example.com"}
              </p>
              <Badge className={`mt-1 w-fit ${roleInfo.color} text-white`}>
                {roleInfo.title}
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/dashboard/profile" className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/dashboard/settings" className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Go to Dashboard Button */}
      <Dialog open={showDashboardDialog} onOpenChange={setShowDashboardDialog}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <roleInfo.icon className="h-4 w-4 mr-2" />
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <roleInfo.icon className="h-5 w-5 mr-2" />
              Welcome to {roleInfo.title} Dashboard
            </DialogTitle>
            <DialogDescription>{roleInfo.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profilePicture} alt={displayName || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  {displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName || "User"}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Badge className={`mt-1 ${roleInfo.color} text-white`}>
                  {roleInfo.title}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleGoToDashboard}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Enter Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDashboardDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
