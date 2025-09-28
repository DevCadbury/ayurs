"use client";

import { useAuthStore } from "./auth-store";

export function useAuth() {
  const authState = useAuthStore();

  return {
    user: authState.uid
      ? {
          uid: authState.uid,
          role: authState.role,
          displayName: authState.displayName,
          email: authState.email,
        }
      : null,
    token: authState.token,
    isAuthenticated: !!authState.uid && !!authState.token,
    setAuth: authState.setAuth,
    clear: authState.clear,
  };
}

