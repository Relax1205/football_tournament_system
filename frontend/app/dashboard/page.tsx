"use client";

import Link from "next/link";
import { AccessGuard } from "@/components/access-guard";
import { DashboardRolePanels } from "@/components/dashboard-role-panels";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/components/auth-provider";

const quickLinksByRole = {
  admin: [
    {
      href: "/tournaments",
      label: "Управление турнирами",
      note: "Создание турниров, статусы и параметры соревнований",
    },
    {
      href: "/teams",
      label: "Пользователи и команды",
      note: "Роли, заявки, составы и команды турниров",
    },
    {
      href: "/matches",
      label: "Матчи и результаты",
      note: "Контроль сценариев судьи и подтверждение результатов",
    },
  ],
  organizer: [
    {
      href: "/tournaments",
      label: "Создать турнир",
      note: "Новые соревнования и управление текущими турнирами",
    },
    {
      href: "/matches",
      label: "Проверить результаты",
      note: "Подтверждение счёта, событий матча и протоколов",
    },
    {
      href: "/teams",
      label: "Рассмотреть заявки",
      note: "Одобрение или отклонение командных заявок",
    },
  ],
  referee: [
    {
      href: "/matches",
      label: "Ввести результат матча",
      note: "Счёт, события, минуты и комментарии судьи",
    },
    {
      href: "/standings",
      label: "Проверить таблицу",
      note: "Положение команд после подтверждённых матчей",
    },
  ],
  coach: [
    {
      href: "/teams",
      label: "Подать заявку",
      note: "Регистрация команды и ведение состава игроков",
    },
    {
      href: "/matches",
      label: "Посмотреть расписание",
      note: "Календарь матчей и результаты своей команды",
    },
    {
      href: "/standings",
      label: "Турнирная таблица",
      note: "Место команды и статистика соревнования",
    },
  ],
  fan: [
    {
      href: "/tournaments",
      label: "Турниры",
      note: "Просмотр активных соревнований и их параметров",
    },
    {
      href: "/matches",
      label: "Расписание матчей",
      note: "Календарь игр, счёт и протоколы матчей",
    },
    {
      href: "/standings",
      label: "Турнирная таблица",
      note: "Публичный просмотр положения команд и результатов",
    },
  ],
} as const;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard>
          <DashboardRolePanels />
          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Быстрые действия</h2>
              <p className="section-subtitle">
                Набор ссылок меняется в зависимости от вашей роли в системе.
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
