"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // The zustand persist middleware handles the restoration automatically
    // We just need to ensure the token is valid
    const token = localStorage.getItem("app_jwt");
    if (!token || token === "demo-token") {
      // Clear auth state if no valid token
      setAuth({
        uid: null,
        role: null,
        displayName: null,
        email: null,
        token: null,
      });
    } else {
      // Set the token in the auth store
      setAuth({ token });
    }
  }, [setAuth]);

  return <>{children}</>;
}
