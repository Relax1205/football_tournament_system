"use client";

import { dashboardCardsByRole, roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

export function DashboardOverview() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const cards = dashboardCardsByRole[user.role];

  return (
    <>
      <section className="hero glass-panel">
        <div className="hero-copy">
          <span className="pill success">{roleLabels[user.role]}</span>
          <h1>Рабочий кабинет {user.name}</h1>
          <p>
            Здесь собраны ваши основные сценарии: доступ к турнирам, матчам,
            таблицам, статистике и административным действиям в зависимости от
            роли.
          </p>
        </div>
        <div className="hero-side">
          {cards.map((card) => (
            <div className="stat-card" key={card.title}>
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <span>{card.caption}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-3">
        {cards.map((card) => (
          <article className="card" key={`${card.title}-detail`}>
            <div className="section-head">
              <h2 className="section-title">{card.title}</h2>
              <p className="section-subtitle">{card.caption}</p>
            </div>
            <div className="metric-large">{card.value}</div>
          </article>
        ))}
      </section>
    </>
  );
}
