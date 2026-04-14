"use client";

import Link from "next/link";
import { AccessGuard } from "@/components/access-guard";
import { DashboardOverview } from "@/components/dashboard-overview";
import { DashboardRolePanels } from "@/components/dashboard-role-panels";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/components/auth-provider";

const quickLinksByRole = {
  admin: [
    {
      href: "/tournaments",
      label: "Управление турнирами",
      note: "Создание, статусы, структура соревнований",
    },
    {
      href: "/teams",
      label: "Роли и команды",
      note: "Ролевой доступ, пользователи, составы",
    },
    {
      href: "/matches",
      label: "Матчи и результаты",
      note: "Контроль судейских сценариев и подтверждений",
    },
  ],
  organizer: [
    {
      href: "/tournaments",
      label: "Создать турнир",
      note: "Новые соревнования и фильтрация текущих",
    },
    {
      href: "/matches",
      label: "Проверить результаты",
      note: "Подтверждение результатов и статусов матчей",
    },
    {
      href: "/teams",
      label: "Рассмотреть заявки",
      note: "Одобрение и отклонение заявок команд",
    },
  ],
  referee: [
    {
      href: "/matches",
      label: "Ввести результат матча",
      note: "Счёт, событие, минута, комментарий судьи",
    },
    {
      href: "/standings",
      label: "Проверить таблицу",
      note: "Актуальное положение команд после матчей",
    },
  ],
  coach: [
    {
      href: "/teams",
      label: "Подать заявку команды",
      note: "Регистрация команды и контроль статуса заявки",
    },
    {
      href: "/standings",
      label: "Посмотреть таблицу",
      note: "Следить за местом команды и статистикой",
    },
  ],
  fan: [
    {
      href: "/standings",
      label: "Турнирная таблица",
      note: "Публичный просмотр текущего положения команд",
    },
    {
      href: "/teams",
      label: "Статистика игроков",
      note: "Бомбардиры, карточки и составы команд",
    },
  ],
} as const;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard>
          <DashboardOverview />
          <DashboardRolePanels />
          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Быстрые действия</h2>
              <p className="section-subtitle">
                Набор ссылок меняется в зависимости от вашей роли.
              </p>
            </div>
            <div className="quick-actions-grid">
              {user
                ? quickLinksByRole[user.role].map((link) => (
                    <Link className="quick-link" href={link.href} key={link.href}>
                      <span className="quick-link-label">{link.label}</span>
                      <span className="quick-link-note">{link.note}</span>
                    </Link>
                  ))
                : null}
            </div>
          </section>
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
