"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { deleteUser, getDashboardSnapshot, updateUserRole } from "@/components/mock-api";
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

type AdminFeedback = {
  text: string;
  tone: "error" | "success";
};

export function DashboardRolePanels() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<AdminFeedback | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<DemoUser | null>(null);

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

  async function confirmDeleteUser() {
    if (!userToDelete) {
      return;
    }

    try {
      setPendingDeleteUserId(userToDelete.id);
      setAdminFeedback(null);
      const deleted = await deleteUser(userToDelete.id);

      setSnapshot((current) =>
        current
          ? {
              ...current,
              users: current.users.filter((item) => item.id !== deleted.id),
            }
          : current,
      );
      setAdminFeedback({
        tone: "success",
        text: `Пользователь "${deleted.name}" удалён.`,
      });
      setUserToDelete(null);
    } catch (error) {
      setAdminFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Не удалось удалить пользователя.",
      });
    } finally {
      setPendingDeleteUserId((current) =>
        current === userToDelete.id ? null : current,
      );
    }
  }

  if (!user || !snapshot) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <>
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
          <div className="form-feedback-slot">
            {adminFeedback ? (
              adminFeedback.tone === "error" ? (
                <div className="message-error">{adminFeedback.text}</div>
              ) : (
                <div className="message-success">{adminFeedback.text}</div>
              )
            ) : (
              <div aria-hidden="true" className="message-placeholder" />
            )}
          </div>
          <div className="role-management-grid">
            {snapshot.users.map((row) => (
              <article
                className="role-user-card"
                data-user-email={row.email}
                key={row.id}
              >
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
                      try {
                        setAdminFeedback(null);
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
                        setAdminFeedback({
                          tone: "success",
                          text: `Роль пользователя "${updated.name}" обновлена.`,
                        });
                      } catch (error) {
                        setAdminFeedback({
                          tone: "error",
                          text:
                            error instanceof Error
                              ? error.message
                              : "Не удалось обновить роль пользователя.",
                        });
                      }
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
                <div className="inline-actions role-user-actions">
                  <button
                    className="button button-secondary"
                    disabled={row.id === user.id || pendingDeleteUserId === row.id}
                    id={`delete-user-${row.id}`}
                    onClick={() => {
                      setAdminFeedback(null);
                      setUserToDelete(row);
                    }}
                    title={row.id === user.id ? "Нельзя удалить свою учётную запись" : undefined}
                    type="button"
                  >
                    {pendingDeleteUserId === row.id ? "Удаляем..." : "Удалить пользователя"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        {userToDelete ? (
          <div
            className="confirm-overlay"
            onClick={() => {
              if (!pendingDeleteUserId) {
                setUserToDelete(null);
              }
            }}
          >
            <div
              aria-labelledby="delete-user-dialog-title"
              aria-modal="true"
              className="confirm-modal"
              id="delete-user-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <span className="pill">Подтверждение</span>
              <div className="confirm-modal-copy">
                <h3 id="delete-user-dialog-title">Удалить пользователя?</h3>
                <p>
                  Пользователь "{userToDelete.name}" будет удалён из системы вместе с
                  заявками и уведомлениями.
                </p>
              </div>
              <div className="inline-actions confirm-modal-actions">
                <button
                  className="button button-primary"
                  disabled={pendingDeleteUserId === userToDelete.id}
                  id="confirm-delete-user"
                  onClick={() => {
                    void confirmDeleteUser();
                  }}
                  type="button"
                >
                  {pendingDeleteUserId === userToDelete.id ? "Удаляем..." : "Удалить"}
                </button>
                <button
                  className="button button-secondary"
                  disabled={pendingDeleteUserId === userToDelete.id}
                  id="cancel-delete-user"
                  onClick={() => setUserToDelete(null)}
                  type="button"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
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
