// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "@/library/api/axios";
import { isAxiosError } from "axios";
import { Token, LoginRequest } from "../types/auth";
import { User } from "../types/user";

interface AuthState {
  token: Token | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (name: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new URLSearchParams();
          formData.append("username", credentials.username);
          formData.append("password", credentials.password);

          const response = await axios.post<Token>(
            "/api/v1/auth/login",
            formData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          set({ token: response.data });

          // Fetch user data
          const userResponse = await axios.get<User>("/api/v1/users/me", {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          });

          set({
            token: response.data,
            user: userResponse.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
            token: null,
            user: null,
          });
          throw error;
        }
      },

      logout: () => {
        set({ token: null, user: null, error: null });
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      },

      fetchUser: async () => {
        const currentToken = get().token;
        if (!currentToken?.access_token) return;

        try {
          const response = await axios.get<User>("/api/v1/users/me", {
            headers: {
              Authorization: `Bearer ${currentToken.access_token}`,
            },
          });
          set({ user: response.data });
        } catch (error: unknown) {
          if (isAxiosError(error) && error.response?.status === 401) {
            set({ token: null, user: null });
            localStorage.removeItem("auth-storage");
            window.location.href = "/login";
          }
        }
      },

      updateUser: async (name) => {
        const currentToken = get().token;
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put<User>("/api/v1/users/me", name, {
            headers: {
              Authorization: `Bearer ${currentToken?.access_token}`,
            },
          });
          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to update user",
          });
        }
      },

      updatePassword: async (currentPassword, newPassword) => {
        const currentToken = get().token;
        set({ isLoading: true, error: null });
        try {
          await axios.put(
            "/api/v1/users/me/password",
            {
              current_password: currentPassword,
              new_password: newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${currentToken?.access_token}`,
              },
            }
          );
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update password",
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
