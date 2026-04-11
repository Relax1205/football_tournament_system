"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { UserRole, roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

type AccessGuardProps = {
  roles?: UserRole[];
  children: ReactNode;
};

export function AccessGuard({ roles, children }: AccessGuardProps) {
  const { isReady, user, hasRole } = useAuth();

  if (!isReady) {
    return (
      <section className="card">
        <div className="section-head">
          <h1 className="page-title">Загрузка профиля</h1>
          <p className="page-subtitle">Проверяем авторизацию и доступы.</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="card empty-state">
        <div className="section-head">
          <h1 className="page-title">Нужен вход в систему</h1>
          <p className="page-subtitle">
            Этот раздел доступен только авторизованным пользователям.
          </p>
        </div>
        <Link className="button button-primary" href="/login">
          Перейти ко входу
        </Link>
      </section>
    );
  }

  if (!hasRole(roles)) {
    return (
      <section className="card empty-state">
        <div className="section-head">
          <h1 className="page-title">Недостаточно прав</h1>
          <p className="page-subtitle">
            Ваша роль: {roleLabels[user.role]}. Для этого раздела нужны роли:{" "}
            {roles?.map((role) => roleLabels[role]).join(", ")}.
          </p>
        </div>
        <Link className="button button-secondary" href="/dashboard">
          Вернуться в кабинет
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}
