"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Navigation } from "@/components/navigation";
import { NotificationCenter } from "@/components/notification-center";
import { roleLabels } from "@/components/mock-data";

export function HeaderBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="topbar glass-panel">
      <div className="brand cluster-brand">
        <div className="brand-badge">FT</div>
        <div className="brand-copy">
          <strong>Система учёта турниров</strong>
        </div>
      </div>

      <div className="header-nav">
        <Navigation />
        {!user ? (
          <div className="header-auth-links">
            {pathname !== "/login" ? (
              <Link
                className="button button-primary header-login"
                href="/login"
                id="header-login-link"
              >
                Войти
              </Link>
            ) : null}
            {pathname !== "/register" ? (
              <Link
                className="button button-secondary header-register"
                href="/register"
                id="header-register-link"
              >
                Регистрация
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {user ? (
        <div className="header-user">
          <NotificationCenter />
          <div className="user-chip" id="user-role-chip">
            <strong>{user.name}</strong>
            <span>{roleLabels[user.role]}</span>
          </div>
          <button
            className="button button-secondary"
            id="logout-button"
            onClick={logout}
            type="button"
          >
            Выйти
          </button>
        </div>
      ) : null}
    </header>
  );
}
