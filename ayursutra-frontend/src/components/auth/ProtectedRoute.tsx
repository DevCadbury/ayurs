"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { getCurrentUser } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["patient", "doctor", "admin"],
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { uid, role } = useAuthStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [unapproved, setUnapproved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Wait for Zustand store to rehydrate
  useEffect(() => {
    // Check if the store has been hydrated
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        // If not hydrated yet, check again after a short delay
        setTimeout(checkHydration, 100);
      }
    };

    checkHydration();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Check if user is logged in
    if (!uid) {
      router.push(redirectTo);
      return;
    }

    // Check if user has the required role
    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      // Redirect to appropriate dashboard based on user's actual role
      switch (role) {
        case "patient":
          router.push("/dashboard/patient");
          break;
        case "doctor":
          router.push("/dashboard/doctor");
          break;
        case "admin":
          router.push("/dashboard/admin");
          break;
        default:
          router.push("/dashboard");
      }
      return;
    }
    // Additional approval gate for doctor/admin
    (async () => {
      try {
        // Temporarily require approval only for doctors (admins are allowed without approval)
        if (!uid || !role || role !== "doctor") {
          setApprovalChecked(true);
          return;
        }
        const token = useAuthStore.getState().token as string;
        if (!token) {
          setApprovalChecked(true);
          return;
        }
        const me = await getCurrentUser(token);
        if (me && me.role === role && me.isApproved === false) {
          setUnapproved(true);
        } else {
          setUnapproved(false);
        }
      } catch {
        // fail open in dev
      } finally {
        setApprovalChecked(true);
      }
    })();
  }, [uid, role, allowedRoles, redirectTo, router, isHydrated]);

  // Poll for approval if currently unapproved
  useEffect(() => {
    if (!unapproved) return;
    const token = useAuthStore.getState().token as string;
    if (!token) return;
    const timer = setInterval(async () => {
      try {
        const me = await getCurrentUser(token);
        if (me?.isApproved) {
          setUnapproved(false);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [unapproved]);

  // Show loading while rehydrating or checking authentication
  if (!isHydrated || !uid || !approvalChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show loading while checking role
  if (role && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Dialog open={unapproved} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Awaiting Approval</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Your account is pending admin approval. You will gain access once
            approved.
          </p>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setRefreshing(true);
                  const token = useAuthStore.getState().token as string;
                  if (!token) return;
                  const me = await getCurrentUser(token);
                  setUnapproved(!me?.isApproved);
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {refreshing ? "Checking..." : "Check Again"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
