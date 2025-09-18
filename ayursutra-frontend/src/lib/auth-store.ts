import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "patient" | "doctor" | "admin";

interface AuthState {
  uid: string | null;
  role: UserRole | null;
  displayName: string | null;
  email: string | null;
  token: string | null;
  setAuth: (data: Partial<AuthState>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      role: null,
      displayName: null,
      email: null,
      token: null,
      setAuth: (data) => set((s) => ({ ...s, ...data })),
      clear: () =>
        set({
          uid: null,
          role: null,
          displayName: null,
          email: null,
          token: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        uid: state.uid,
        role: state.role,
        displayName: state.displayName,
        email: state.email,
        token: state.token,
      }),
    }
  )
);
