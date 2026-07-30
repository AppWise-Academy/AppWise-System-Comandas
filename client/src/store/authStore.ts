import { create } from "zustand";
import type { ErrorApi, UserInterface } from "../types";
import { persist } from "zustand/middleware";
import { api } from "../api";

interface AuthState {
  user: UserInterface | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: UserInterface) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const session = await api.login(email, password);
          set({
            user: session.usuario,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            loading: false,
          });
          return true;
        } catch (error) {
          const err = error as ErrorApi;
          set({
            error: err.errores?.[0]?.mensaje ?? err.message,
            loading: false,
          });
          return false;
        }
      },
      logout: async () => {
        get();
        return;
      },
      updateUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "comandas-auth",
    },
  ),
);
