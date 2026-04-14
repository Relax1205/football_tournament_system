"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

export function HeaderBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar glass-panel">
      <div className="brand cluster-brand">
        <div className="brand-badge">FT</div>
        <div className="brand-copy">
          <div className="brand-kicker">Frontend &amp; QA Lead</div>
          <strong>Система учёта турниров</strong>
          <span>Русский интерфейс, роли, валидация, кабинет и mock API</span>
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
