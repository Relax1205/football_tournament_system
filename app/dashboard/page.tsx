"use client";

import Link from "next/link";
import { AccessGuard } from "@/components/access-guard";
import { DashboardOverview } from "@/components/dashboard-overview";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/components/auth-provider";

const quickLinksByRole = {
  admin: [
    { href: "/tournaments", label: "Управление турнирами" },
    { href: "/teams", label: "Роли и команды" },
    { href: "/matches", label: "Матчи и результаты" },
  ],
  organizer: [
    { href: "/tournaments", label: "Создать турнир" },
    { href: "/matches", label: "Проверить результаты" },
    { href: "/teams", label: "Рассмотреть заявки" },
  ],
  referee: [
    { href: "/matches", label: "Ввести результат матча" },
    { href: "/standings", label: "Проверить таблицу" },
  ],
  coach: [
    { href: "/teams", label: "Подать заявку команды" },
    { href: "/standings", label: "Посмотреть таблицу" },
  ],
  fan: [
    { href: "/standings", label: "Турнирная таблица" },
    { href: "/teams", label: "Статистика игроков" },
  ],
} as const;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard>
          <DashboardOverview />
          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Быстрые действия</h2>
              <p className="section-subtitle">
                Набор ссылок меняется в зависимости от вашей роли.
              </p>
            </div>
            <div className="quick-actions">
              {user
                ? quickLinksByRole[user.role].map((link) => (
                    <Link className="quick-link" href={link.href} key={link.href}>
                      {link.label}
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
