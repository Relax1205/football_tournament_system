"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DemoUser, UserRole } from "@/components/mock-data";
import { loginUser } from "@/components/mock-api";

type AuthContextValue = {
  isReady: boolean;
  user: DemoUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  hasRole: (roles?: UserRole[]) => boolean;
};

const USER_STORAGE_KEY = "football-tournament-auth";
const TOKEN_STORAGE_KEY = "football-tournament-token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser) as DemoUser);
    }

    setIsReady(true);
  }, []);

  async function login(email: string, password: string) {
    try {
      const result = await loginUser(email.trim().toLowerCase(), password);

      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setUser(result.user);

      return { ok: true };
    } catch (error) {
      if (error instanceof Error) {
        return {
          ok: false,
          message:
            error.message === "Invalid credentials"
              ? "Неверный логин или пароль"
              : "Не удалось выполнить вход",
        };
      }

      return { ok: false, message: "Не удалось выполнить вход" };
    }
  }

  function logout() {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  const value: AuthContextValue = {
    isReady,
    user,
    login,
    logout,
    hasRole: (roles) => {
      if (!roles || roles.length === 0) {
        return Boolean(user);
      }

      return user ? roles.includes(user.role) : false;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
