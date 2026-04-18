"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function HeroActions() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="hero-actions">
      <Link className="button button-primary" href="/dashboard">
        Перейти в кабинет
      </Link>
    </div>
  );
}
