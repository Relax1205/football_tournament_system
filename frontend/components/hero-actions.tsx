"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function HeroActions() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="hero-actions">
        <Link className="button button-primary" href="/dashboard">
          Перейти в кабинет
        </Link>
      </div>
    );
  }

  return (
    <div className="hero-actions">
      <Link className="button button-primary" href="/login">
        Войти в систему
      </Link>
    </div>
  );
}
