"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  addPlayer,
  createApplication,
  listApplications,
  listPlayers,
  listTeams,
  listTournaments,
  listUsers,
  updateApplicationStatus,
  updateUserRole,
} from "@/components/mock-api";
import {
  ApplicationRecord,
  DemoUser,
  PlayerRecord,
  TeamRecord,
  Tournament,
  UserRole,
  roleLabels,
} from "@/components/mock-data";

type ApplicationForm = {
  city: string;
  coach: string;
  playersCount: string;
  team: string;
  tournament: string;
};

type PlayerForm = {
  firstName: string;
  lastName: string;
  number: string;
  teamId: string;
};

const emptyApplicationForm: ApplicationForm = {
  city: "",
  coach: "",
  playersCount: "18",
  team: "",
  tournament: "",
};

const emptyPlayerForm: PlayerForm = {
  firstName: "",
  lastName: "",
  number: "10",
  teamId: "",
};

export function TeamsClient() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"goals" | "team" | "name">("goals");
  const [form, setForm] = useState<ApplicationForm>(emptyApplicationForm);
  const [playerForm, setPlayerForm] = useState<PlayerForm>(emptyPlayerForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [playerErrors, setPlayerErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [playerSuccess, setPlayerSuccess] = useState("");

  useEffect(() => {
    void Promise.all([
      listApplications(),
      listPlayers(),
      listTeams(),
      listTournaments(),
      listUsers(),
    ]).then(([loadedApplications, loadedPlayers, loadedTeams, loadedTournaments, loadedUsers]) => {
      setApplications(loadedApplications);
      setPlayers(loadedPlayers);
      setTeams(loadedTeams);
      setTournaments(loadedTournaments);
      setUsers(loadedUsers);

      setForm((current) => ({
        ...current,
        coach: current.coach || user?.name || "",
        tournament: current.tournament || loadedTournaments[0]?.id || "",
      }));

      const preferredTeam =
        user?.role === "coach"
          ? loadedTeams.find((team) => team.coachName === user.name)
          : loadedTeams[0];

      setPlayerForm((current) => ({
        ...current,
        teamId: current.teamId || preferredTeam?.id || "",
      }));
    });
  }, [user]);

  const teamsFromPlayers = useMemo(
    () => Array.from(new Set(players.map((player) => player.team))),
    [players],
  );

  const editableTeams = useMemo(() => {
    if (user?.role === "coach") {
      return teams.filter((team) => team.coachName === user.name);
    }

    return teams;
  }, [teams, user]);

  const filteredPlayers = useMemo(() => {
    return [...players]
      .filter((player) => (teamFilter === "all" ? true : player.team === teamFilter))
      .filter((player) =>
        `${player.name} ${player.team}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((left, right) => {
        if (sortKey === "goals") {
          return right.goals - left.goals;
        }

        return String(left[sortKey]).localeCompare(String(right[sortKey]), "ru");
      });
  }, [players, query, sortKey, teamFilter]);

  function validateApplication() {
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

  function validatePlayer() {
    const nextErrors: Record<string, string> = {};
    const number = Number(playerForm.number);

    if (!playerForm.teamId) {
      nextErrors.teamId = "Выберите команду";
    }

    if (playerForm.firstName.trim().length < 2) {
      nextErrors.firstName = "Введите имя игрока";
    }

    if (playerForm.lastName.trim().length < 2) {
      nextErrors.lastName = "Введите фамилию игрока";
    }

    if (!Number.isInteger(number) || number < 1 || number > 99) {
      nextErrors.number = "Номер игрока должен быть от 1 до 99";
    }

    return nextErrors;
  }

  async function handleApplicationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateApplication();
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
    setForm({
      ...emptyApplicationForm,
      coach: user?.name ?? "",
      tournament: tournaments[0]?.id ?? "",
      playersCount: "18",
    });
    setSuccess(`Заявка команды "${created.team}" отправлена организатору`);
  }

  async function handlePlayerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validatePlayer();
    setPlayerErrors(validationErrors);
    setPlayerSuccess("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await addPlayer(playerForm.teamId, {
      firstName: playerForm.firstName.trim(),
      lastName: playerForm.lastName.trim(),
      number: Number(playerForm.number),
    });

    const [loadedPlayers, loadedTeams] = await Promise.all([listPlayers(), listTeams()]);
    setPlayers(loadedPlayers);
    setTeams(loadedTeams);
    setPlayerForm((current) => ({
      ...emptyPlayerForm,
      teamId: current.teamId,
      number: "10",
    }));
    setPlayerSuccess("Игрок успешно добавлен в состав команды");
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Команды и игроки</h1>
          <p className="page-subtitle">
            Статистика игроков, статусы заявок и работа с составами команд.
          </p>
        </div>
        <div className="toolbar">
          <input
            className="toolbar-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по игроку или команде"
            value={query}
          />
          <select onChange={(event) => setTeamFilter(event.target.value)} value={teamFilter}>
            <option value="all">Все команды</option>
            {teamsFromPlayers.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <select
            onChange={(event) => setSortKey(event.target.value as "goals" | "team" | "name")}
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
                  <td>{player.number ?? "-"}</td>
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
              Организатор управляет статусами, тренер отслеживает судьбу своей заявки.
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
                          const updated = await updateApplicationStatus(application.id, "Одобрена");
                          const [loadedTeams, loadedPlayers] = await Promise.all([listTeams(), listPlayers()]);
                          setApplications((current) =>
                            current.map((item) => (item.id === updated.id ? updated : item)),
                          );
                          setTeams(loadedTeams);
                          setPlayers(loadedPlayers);
                        }}
                        type="button"
                      >
                        Одобрить
                      </button>
                      <button
                        className="button button-secondary"
                        onClick={async () => {
                          const updated = await updateApplicationStatus(application.id, "Отклонена");
                          setApplications((current) =>
                            current.map((item) => (item.id === updated.id ? updated : item)),
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

        {(user?.role === "coach" || user?.role === "organizer" || user?.role === "admin") ? (
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Подать заявку команды</h2>
              <p className="section-subtitle">
                Форма тренера с клиентской валидацией и отправкой в backend.
              </p>
            </div>
            <form className="form-grid" onSubmit={handleApplicationSubmit}>
              <div className="field">
                <label htmlFor="team-name">Название команды</label>
                <input
                  id="team-name"
                  onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}
                  placeholder="Уралец"
                  value={form.team}
                />
                {errors.team ? <span className="field-error">{errors.team}</span> : null}
              </div>
              <div className="field">
                <label htmlFor="city">Город</label>
                <input
                  id="city"
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Екатеринбург"
                  value={form.city}
                />
                {errors.city ? <span className="field-error">{errors.city}</span> : null}
              </div>
              <div className="field">
                <label htmlFor="coach">Тренер</label>
                <input
                  id="coach"
                  onChange={(event) => setForm((current) => ({ ...current, coach: event.target.value }))}
                  placeholder="Андрей Смирнов"
                  value={form.coach}
                />
                {errors.coach ? <span className="field-error">{errors.coach}</span> : null}
              </div>
              <div className="field">
                <label htmlFor="players-count">Количество игроков</label>
                <input
                  id="players-count"
                  max="30"
                  min="7"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, playersCount: event.target.value }))
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
                    setForm((current) => ({ ...current, tournament: event.target.value }))
                  }
                  value={form.tournament}
                >
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                {errors.tournament ? <span className="field-error">{errors.tournament}</span> : null}
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
        ) : (
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Публичный просмотр</h2>
              <p className="section-subtitle">
                Для болельщика доступны составы, статистика игроков и текущие статусы команд.
              </p>
            </div>
            <ul className="list">
              {teams.map((team) => (
                <li className="list-item" key={team.id}>
                  <div>
                    <strong>{team.name}</strong>
                    {team.city ? `${team.city} · ` : ""}
                    Игроков в составе: {team.playersCount}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>

      {(user?.role === "admin" || user?.role === "organizer" || user?.role === "coach") && (
        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Добавить игрока</h2>
              <p className="section-subtitle">
                Состав команды можно пополнять прямо из веб-интерфейса.
              </p>
            </div>
            <form className="form-grid" onSubmit={handlePlayerSubmit}>
              <div className="field field-wide">
                <label htmlFor="team-id">Команда</label>
                <select
                  id="team-id"
                  onChange={(event) =>
                    setPlayerForm((current) => ({ ...current, teamId: event.target.value }))
                  }
                  value={playerForm.teamId}
                >
                  {editableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {playerErrors.teamId ? <span className="field-error">{playerErrors.teamId}</span> : null}
              </div>
              <div className="field">
                <label htmlFor="player-first-name">Имя</label>
                <input
                  id="player-first-name"
                  onChange={(event) =>
                    setPlayerForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  value={playerForm.firstName}
                />
                {playerErrors.firstName ? (
                  <span className="field-error">{playerErrors.firstName}</span>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="player-last-name">Фамилия</label>
                <input
                  id="player-last-name"
                  onChange={(event) =>
                    setPlayerForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  value={playerForm.lastName}
                />
                {playerErrors.lastName ? (
                  <span className="field-error">{playerErrors.lastName}</span>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="player-number">Номер</label>
                <input
                  id="player-number"
                  max="99"
                  min="1"
                  onChange={(event) =>
                    setPlayerForm((current) => ({ ...current, number: event.target.value }))
                  }
                  type="number"
                  value={playerForm.number}
                />
                {playerErrors.number ? <span className="field-error">{playerErrors.number}</span> : null}
              </div>
              {playerSuccess ? (
                <div className="field field-wide">
                  <div className="message-success">{playerSuccess}</div>
                </div>
              ) : null}
              <div className="field field-wide">
                <button className="button button-primary" type="submit">
                  Добавить игрока
                </button>
              </div>
            </form>
          </article>

          {(user?.role === "admin" || user?.role === "organizer") ? (
            <article className="card">
              <div className="section-head">
                <h2 className="section-title">Пользователи и роли</h2>
                <p className="section-subtitle">
                  Администратор и организатор управляют ролевой моделью доступа.
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
                                current.map((item) => (item.id === updated.id ? updated : item)),
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
            </article>
          ) : (
            <article className="card">
              <div className="section-head">
                <h2 className="section-title">Мои команды</h2>
                <p className="section-subtitle">
                  Тренер видит команды, за которые отвечает, и может пополнять состав.
                </p>
              </div>
              <ul className="list">
                {editableTeams.map((team) => (
                  <li className="list-item" key={team.id}>
                    <div>
                      <strong>{team.name}</strong>
                      {team.city ? `${team.city} · ` : ""}
                      Игроков в составе: {team.playersCount}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </section>
      )}
    </>
  );
}
