"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  getDashboardSnapshot,
  updateApplicationStatus,
  updateUserRole,
} from "@/components/mock-api";
import {
  ApplicationRecord,
  DemoUser,
  MatchRecord,
  Tournament,
  roleLabels,
} from "@/components/mock-data";

type Snapshot = {
  applications: ApplicationRecord[];
  matches: MatchRecord[];
  tournaments: Tournament[];
  users: DemoUser[];
};

export function DashboardRolePanels() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    getDashboardSnapshot().then((data) =>
      setSnapshot({
        applications: data.applications,
        matches: data.matches,
        tournaments: data.tournaments,
        users: data.users,
      }),
    );
  }, []);

  if (!user || !snapshot) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Управление ролями</h2>
          <p className="section-subtitle">
            Демо-flow администратора: смена роли пользователя без перезагрузки.
          </p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Текущая роль</th>
                <th>Изменить</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.users.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{roleLabels[row.role]}</td>
                  <td>
                    <select
                      defaultValue={row.role}
                      onChange={async (event) => {
                        const updated = await updateUserRole(
                          row.id,
                          event.target.value as DemoUser["role"],
                        );

                        setSnapshot((current) =>
                          current
                            ? {
                                ...current,
                                users: current.users.map((item) =>
                                  item.id === updated.id ? updated : item,
                                ),
                              }
                            : current,
                        );
                      }}
                    >
                      {Object.entries(roleLabels).map(([role, label]) => (
                        <option key={role} value={role}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (user.role === "organizer") {
    return (
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Организатор: оперативные задачи</h2>
          <p className="section-subtitle">
            Заявки можно одобрять или отклонять прямо из кабинета.
          </p>
        </div>
        <ul className="list">
          {snapshot.applications.map((application) => (
            <li className="list-item list-item-spread" key={application.id}>
              <div>
                <strong>
                  {application.team} · {application.tournament}
                </strong>
                Тренер: {application.coach} · Игроков: {application.playersCount}
              </div>
              <div className="inline-actions">
                <span className="pill">{application.status}</span>
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    const updated = await updateApplicationStatus(
                      application.id,
                      "Одобрена",
                    );

                    setSnapshot((current) =>
                      current
                        ? {
                            ...current,
                            applications: current.applications.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
                          }
                        : current,
                    );
                  }}
                  type="button"
                >
                  Одобрить
                </button>
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    const updated = await updateApplicationStatus(
                      application.id,
                      "Отклонена",
                    );

                    setSnapshot((current) =>
                      current
                        ? {
                            ...current,
                            applications: current.applications.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
                          }
                        : current,
                    );
                  }}
                  type="button"
                >
                  Отклонить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (user.role === "referee") {
    return (
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Судья: мои матчи</h2>
          <p className="section-subtitle">
            Быстрый обзор матчей, где нужно внести или уточнить результат.
          </p>
        </div>
        <ul className="list">
          {snapshot.matches
            .filter((match) => match.referee === user.name)
            .map((match) => (
              <li className="list-item" key={match.id}>
                <div>
                  <strong>
                    {match.home} - {match.away}
                  </strong>
                  {match.date} · {match.time} · {match.venue}
                </div>
                <span className="pill">{match.status}</span>
              </li>
            ))}
        </ul>
      </section>
    );
  }

  if (user.role === "coach") {
    return (
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Тренер: статус моей команды</h2>
          <p className="section-subtitle">
            Отсюда можно быстро понять, что с заявкой и ближайшими матчами.
          </p>
        </div>
        <ul className="list">
          {snapshot.applications
            .filter((application) => application.coach === user.name)
            .map((application) => (
              <li className="list-item" key={application.id}>
                <div>
                  <strong>{application.team}</strong>
                  {application.tournament} · Игроков: {application.playersCount}
                </div>
                <span className="pill">{application.status}</span>
              </li>
            ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="section-title">Болельщик: открытые турниры</h2>
        <p className="section-subtitle">
          Публичный сценарий: обзор соревнований и готовность календаря.
        </p>
      </div>
      <ul className="list">
        {snapshot.tournaments.map((tournament) => (
          <li className="list-item" key={tournament.id}>
            <div>
              <strong>{tournament.name}</strong>
              {tournament.format} · Команд: {tournament.teams}
            </div>
            <span className="pill">{tournament.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
