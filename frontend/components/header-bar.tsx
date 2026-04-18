"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

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
        {!user && pathname !== "/login" ? (
          <Link className="button button-primary header-login" href="/login">
            Войти в систему
          </Link>
        ) : null}
      </div>

      {user ? (
        <div className="header-user">
          <div className="user-chip">
            <strong>{user.name}</strong>
            <span>{roleLabels[user.role]}</span>
          </div>
          <button className="button button-secondary" onClick={logout} type="button">
            Выйти
          </button>
        </div>
      ) : null}
    </header>
  );
}
