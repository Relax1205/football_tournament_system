"use client";

import { useEffect, useState } from "react";
import { getDashboardSnapshot } from "@/components/mock-api";
import { roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

type MetricCard = {
  title: string;
  value: string;
  caption: string;
};

export function DashboardOverview() {
  const { user } = useAuth();
  const [cards, setCards] = useState<MetricCard[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void getDashboardSnapshot().then((snapshot) => {
      if (user.role === "admin") {
        setCards([
          {
            title: "Пользователи",
            value: String(snapshot.users.length),
            caption: "аккаунтов в системе и ролевой модели доступа",
          },
          {
            title: "Турниры",
            value: String(snapshot.tournaments.length),
            caption: "соревнований доступны для контроля и аудита",
          },
          {
            title: "Заявки",
            value: String(snapshot.applications.length),
            caption: "регистрационных сценариев видит администратор",
          },
        ]);
        return;
      }

      if (user.role === "organizer") {
        setCards([
          {
            title: "Турниры",
            value: String(snapshot.tournaments.length),
            caption: "соревнований доступны для управления",
          },
          {
            title: "Заявки",
            value: String(snapshot.applications.filter((item) => item.status === "На рассмотрении").length),
            caption: "команд ждут решения организатора",
          },
          {
            title: "Матчи",
            value: String(snapshot.matches.length),
            caption: "в календаре доступны для контроля и подтверждения",
          },
        ]);
        return;
      }

      if (user.role === "referee") {
        setCards([
          {
            title: "Матчи",
            value: String(snapshot.matches.filter((item) => item.referee === user.name).length),
            caption: "закреплены за текущим судьёй",
          },
          {
            title: "Подтверждение",
            value: String(snapshot.matches.filter((item) => item.status === "Требует подтверждения").length),
            caption: "результатов ожидают решения организатора",
          },
          {
            title: "Турниры",
            value: String(snapshot.tournaments.length),
            caption: "доступны для просмотра расписания и таблицы",
          },
        ]);
        return;
      }

      if (user.role === "coach") {
        setCards([
          {
            title: "Заявки",
            value: String(snapshot.applications.filter((item) => item.coach === user.name).length),
            caption: "командных заявок привязаны к вашему аккаунту",
          },
          {
            title: "Турниры",
            value: String(snapshot.tournaments.length),
            caption: "соревнований доступны для участия и просмотра",
          },
          {
            title: "Матчи",
            value: String(snapshot.matches.length),
            caption: "игр доступны в календаре системы",
          },
        ]);
        return;
      }

      setCards([
        {
          title: "Турниры",
          value: String(snapshot.tournaments.length),
          caption: "соревнований доступны в публичной зоне",
        },
        {
          title: "Матчи",
          value: String(snapshot.matches.length),
          caption: "игр можно просматривать без доступа к управлению",
        },
        {
          title: "Заявки",
          value: String(snapshot.applications.length),
          caption: "статусов доступны в ролевом интерфейсе команды",
        },
      ]);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <>
      <section className="hero glass-panel">
        <div className="hero-copy">
          <span className="pill success">{roleLabels[user.role]}</span>
          <h1>Рабочий кабинет {user.name}</h1>
          <p>
            Здесь собраны ключевые сценарии вашей роли: турниры, заявки, расписание,
            результаты, таблица и управление доступом.
          </p>
          <div className="dashboard-note">
            <strong>Фокус роли:</strong> интерфейс показывает только те действия,
            которые разрешены вашей ролью и нужны в повседневной работе.
          </div>
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
          <article className="card metric-card" key={`${card.title}-detail`}>
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
