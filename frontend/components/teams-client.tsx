"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  createApplication,
  listApplications,
  listPlayers,
  listUsers,
  updateApplicationStatus,
  updateUserRole,
} from "@/components/mock-api";
import {
  ApplicationRecord,
  DemoUser,
  PlayerRecord,
  UserRole,
  initialTournaments,
  roleLabels,
} from "@/components/mock-data";

type ApplicationForm = {
  city: string;
  coach: string;
  playersCount: string;
  team: string;
  tournament: string;
};

const defaultForm: ApplicationForm = {
  city: "",
  coach: "",
  playersCount: "18",
  team: "",
  tournament: initialTournaments[0]?.name ?? "",
};

export function TeamsClient() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"goals" | "team" | "name">("goals");
  const [form, setForm] = useState<ApplicationForm>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    listApplications().then(setApplications);
    listPlayers().then(setPlayers);
    listUsers().then(setUsers);
  }, []);

  const teams = useMemo(
    () => Array.from(new Set(players.map((player) => player.team))),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    return [...players]
      .filter((player) =>
        teamFilter === "all" ? true : player.team === teamFilter,
      )
      .filter((player) =>
        `${player.name} ${player.team}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        if (sortKey === "goals") {
          return b.goals - a.goals;
        }

        return String(a[sortKey]).localeCompare(String(b[sortKey]), "ru");
      });
  }, [players, query, sortKey, teamFilter]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    const playersCount = Number(form.playersCount);

    if (form.team.trim().length < 2) {
      nextErrors.team = "Введите название команды";
    }

    if (form.city.trim().length < 2) {
      nextErrors.city = "Введите город";
    }

    if (form.coach.trim().length < 4) {
      nextErrors.coach = "Введите ФИО тренера";
    }

    if (!Number.isInteger(playersCount) || playersCount < 7 || playersCount > 30) {
      nextErrors.playersCount = "Количество игроков должно быть от 7 до 30";
    }

    if (!form.tournament.trim()) {
      nextErrors.tournament = "Выберите турнир";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const created = await createApplication({
      city: form.city.trim(),
      coach: form.coach.trim(),
      playersCount: Number(form.playersCount),
      team: form.team.trim(),
      tournament: form.tournament,
    });

    setApplications((current) => [created, ...current]);
    setForm(defaultForm);
    setSuccess(`Заявка команды "${created.team}" отправлена организатору`);
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Команды и игроки</h1>
          <p className="page-subtitle">
            Статистика игроков с фильтрацией по командам и сортировкой.
          </p>
        </div>
        <div className="toolbar">
          <input
            className="toolbar-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по игроку или команде"
            value={query}
          />
          <select
            onChange={(event) => setTeamFilter(event.target.value)}
            value={teamFilter}
          >
            <option value="all">Все команды</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <select
            onChange={(event) =>
              setSortKey(event.target.value as "goals" | "team" | "name")
            }
            value={sortKey}
          >
            <option value="goals">Сортировка: голы</option>
            <option value="team">Сортировка: команда</option>
            <option value="name">Сортировка: имя</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Игрок</th>
                <th>№</th>
                <th>Команда</th>
                <th>Голы</th>
                <th>ЖК</th>
                <th>КК</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{player.number}</td>
                  <td>{player.team}</td>
                  <td>{player.goals}</td>
                  <td>{player.yellow}</td>
                  <td>{player.red}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <div className="section-head">
            <h2 className="section-title">Заявки на турнир</h2>
            <p className="section-subtitle">
              Организатор может менять статус, тренер видит свою заявку.
            </p>
          </div>
          <ul className="list">
            {applications.map((application) => (
              <li className="list-item list-item-spread" key={application.id}>
                <div>
                  <strong>{application.team}</strong>
                  {application.tournament} · {application.city}
                  <br />
                  Тренер: {application.coach} · Игроков: {application.playersCount}
                </div>
                <div className="inline-actions">
                  <span className="pill">{application.status}</span>
                  {user?.role === "organizer" || user?.role === "admin" ? (
                    <>
                      <button
                        className="button button-secondary"
                        onClick={async () => {
                          const updated = await updateApplicationStatus(
                            application.id,
                            "Одобрена",
                          );

                          setApplications((current) =>
                            current.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
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

                          setApplications((current) =>
                            current.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
                          );
                        }}
                        type="button"
                      >
                        Отклонить
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="section-head">
            <h2 className="section-title">Подать заявку команды</h2>
            <p className="section-subtitle">
              Рабочая форма тренера с клиентской валидацией.
            </p>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="team-name">Название команды</label>
              <input
                id="team-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, team: event.target.value }))
                }
                placeholder="Уралец"
                value={form.team}
              />
              {errors.team ? <span className="field-error">{errors.team}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="city">Город</label>
              <input
                id="city"
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Екатеринбург"
                value={form.city}
              />
              {errors.city ? <span className="field-error">{errors.city}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="coach">Тренер</label>
              <input
                id="coach"
                onChange={(event) =>
                  setForm((current) => ({ ...current, coach: event.target.value }))
                }
                placeholder="Андрей Смирнов"
                value={form.coach}
              />
              {errors.coach ? (
                <span className="field-error">{errors.coach}</span>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="players-count">Количество игроков</label>
              <input
                id="players-count"
                max="30"
                min="7"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    playersCount: event.target.value,
                  }))
                }
                type="number"
                value={form.playersCount}
              />
              {errors.playersCount ? (
                <span className="field-error">{errors.playersCount}</span>
              ) : null}
            </div>
            <div className="field field-wide">
              <label htmlFor="tournament-name">Турнир</label>
              <select
                id="tournament-name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tournament: event.target.value,
                  }))
                }
                value={form.tournament}
              >
                {initialTournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.name}>
                    {tournament.name}
                  </option>
                ))}
              </select>
              {errors.tournament ? (
                <span className="field-error">{errors.tournament}</span>
              ) : null}
            </div>
            {success ? (
              <div className="field field-wide">
                <div className="message-success">{success}</div>
              </div>
            ) : null}
            <div className="field field-wide">
              <button className="button button-primary" type="submit">
                Отправить заявку
              </button>
            </div>
          </form>
        </article>
      </section>

      {(user?.role === "admin" || user?.role === "organizer") && (
        <section className="card">
          <div className="section-head">
            <h2 className="section-title">Пользователи и роли</h2>
            <p className="section-subtitle">
              Демо-flow администратора и организатора по управлению ролями.
            </p>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Текущая роль</th>
                  <th>Изменить роль</th>
                </tr>
              </thead>
              <tbody>
                {users.map((currentUser) => (
                  <tr key={currentUser.id}>
                    <td>{currentUser.name}</td>
                    <td>{currentUser.email}</td>
                    <td>{roleLabels[currentUser.role]}</td>
                    <td>
                      <select
                        defaultValue={currentUser.role}
                        onChange={async (event) => {
                          const updated = await updateUserRole(
                            currentUser.id,
                            event.target.value as UserRole,
                          );
                          setUsers((current) =>
                            current.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
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
      )}
    </>
  );
}
