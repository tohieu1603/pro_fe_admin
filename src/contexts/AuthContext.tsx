"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, UserRole } from "@/types";
import { authService } from "@/services";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));

          // Verify token is still valid by fetching user
          try {
            const response = await authService.getMe();
            if (response.data) {
              setUser(response.data);
              localStorage.setItem(USER_KEY, JSON.stringify(response.data));
            }
          } catch {
            // Token invalid, try refresh
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              try {
                const refreshResponse = await authService.refresh(refreshToken);
                if (refreshResponse.data?.accessToken) {
                  localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.data.accessToken);
                  const meResponse = await authService.getMe();
                  if (meResponse.data) {
                    setUser(meResponse.data);
                    localStorage.setItem(USER_KEY, JSON.stringify(meResponse.data));
                  }
                }
              } catch {
                // Refresh failed, clear everything
                clearAuth();
              }
            } else {
              clearAuth();
            }
          }
        }
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.push("/login");
    } else if (isAuthenticated && isPublicPath) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
      router.push("/");
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authService.register({ name, email, password });
    router.push("/login");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
