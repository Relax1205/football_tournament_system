"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getDashboardSnapshot, updateUserRole } from "@/components/mock-api";
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

  const roleSummary = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return Object.entries(roleLabels).map(([role, label]) => ({
      role: role as DemoUser["role"],
      label,
      count: snapshot.users.filter((row) => row.role === role).length,
    }));
  }, [snapshot]);

  if (!user || !snapshot) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <section className="card panel-accent panel-admin">
        <div className="section-head">
          <h2 className="section-title">Управление ролями</h2>
        </div>
        <div className="role-overview-grid">
          <article className="role-stat-card role-stat-card-wide">
            <span>Пользователей в системе</span>
            <strong>{snapshot.users.length}</strong>
          </article>
          {roleSummary.map((item) => (
            <article className="role-stat-card" key={item.role}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </article>
          ))}
        </div>
        <div className="role-management-grid">
          {snapshot.users.map((row) => (
            <article className="role-user-card" key={row.id}>
              <div className="role-user-head">
                <div className="role-user-meta">
                  <strong>{row.name}</strong>
                  <span>{row.email}</span>
                </div>
                <span className="pill">{roleLabels[row.role]}</span>
              </div>
              <div className="field">
                <label htmlFor={`role-${row.id}`}>Назначить роль</label>
                <select
                  id={`role-${row.id}`}
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
                  value={row.role}
                >
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <option key={role} value={role}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (user.role === "organizer") {
    return null;
  }

  if (user.role === "referee") {
    return (
      <section className="card panel-accent panel-referee">
        <div className="section-head">
          <h2 className="section-title">Судья: мои матчи</h2>
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
      <section className="card panel-accent panel-coach">
        <div className="section-head">
          <h2 className="section-title">Тренер: статус моей команды</h2>
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
    <section className="card panel-accent panel-fan">
      <div className="section-head">
        <h2 className="section-title">Болельщик: открытые турниры</h2>
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
