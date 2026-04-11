"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DemoUser, demoUsers, UserRole } from "@/components/mock-data";

type AuthContextValue = {
  isReady: boolean;
  user: DemoUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  hasRole: (roles?: UserRole[]) => boolean;
};

const STORAGE_KEY = "football-tournament-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as DemoUser;
      setUser(parsed);
    }

    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === password,
    );

    if (!foundUser) {
      return {
        ok: false,
        message: "Неверный логин или пароль",
      };
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
    setUser(foundUser);

    return { ok: true };
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
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
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
