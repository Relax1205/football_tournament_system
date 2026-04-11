"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

export function HeaderBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar glass-panel">
      <div className="brand">
        <div className="brand-badge">FT</div>
        <div className="brand-copy">
          <strong>Система учёта турниров</strong>
          <span>Frontend next level: роли, вход, кабинет, сценарии</span>
        </div>
      </div>
      <Navigation />
      <div className="header-user">
        {user ? (
          <>
            <div className="user-chip">
              <strong>{user.name}</strong>
              <span>{roleLabels[user.role]}</span>
            </div>
            <button className="button button-secondary" onClick={logout} type="button">
              Выйти
            </button>
          </>
        ) : (
          <Link className="button button-primary" href="/login">
            Войти в систему
          </Link>
        )}
      </div>
    </header>
  );
}
