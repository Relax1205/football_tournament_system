"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createTournament, generateSchedule, listTournaments } from "@/components/mock-api";
import { Tournament, TournamentStatus } from "@/components/mock-data";

type TournamentForm = {
  endDate: string;
  format: string;
  groups: string;
  name: string;
  startDate: string;
  status: TournamentStatus;
};

type ScheduleForm = {
  daysBetweenRounds: string;
  startDate: string;
  tournamentId: string;
};

const initialForm: TournamentForm = {
  endDate: "",
  format: "Групповой этап + плей-офф",
  groups: "2",
  name: "",
  startDate: "",
  status: "Идёт регистрация",
};

export function TournamentsClient() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "organizer";
  const [items, setItems] = useState<Tournament[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "teams" | "status">("name");
  const [form, setForm] = useState<TournamentForm>(initialForm);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    daysBetweenRounds: "7",
    startDate: "",
    tournamentId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void listTournaments().then((loaded) => {
      setItems(loaded);
      setScheduleForm((current) => ({
        ...current,
        tournamentId: current.tournamentId || loaded[0]?.id || "",
      }));
    });
  }, []);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) => (statusFilter === "all" ? true : item.status === statusFilter))
      .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        if (sortKey === "teams") {
          return b.teams - a.teams;
        }

        return String(a[sortKey]).localeCompare(String(b[sortKey]), "ru");
      });
  }, [items, query, sortKey, statusFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Всего турниров",
        value: String(items.length),
        tone: "neutral",
      },
      {
        label: "Идёт регистрация",
        value: String(items.filter((item) => item.status === "Идёт регистрация").length),
        tone: "warm",
      },
      {
        label: "Активные матчи",
        value: String(items.reduce((total, item) => total + item.matches, 0)),
        tone: "accent",
      },
    ],
    [items],
  );

  function validate() {
    const nextErrors: Record<string, string> = {};
    const groups = Number(form.groups);

    if (form.name.trim().length < 4) {
      nextErrors.name = "Введите название минимум из 4 символов";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Укажите дату начала";
    }

    if (!form.endDate) {
      nextErrors.endDate = "Укажите дату окончания";
    }

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "Дата окончания не может быть раньше даты начала";
    }

    if (!Number.isInteger(groups) || groups < 1 || groups > 8) {
      nextErrors.groups = "Количество групп должно быть от 1 до 8";
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

    const created = await createTournament({
      endDate: form.endDate,
      format: form.format,
      groups: Number(form.groups),
      name: form.name.trim(),
      startDate: form.startDate,
      status: form.status,
    });

    setItems((current) => [created, ...current]);
    setForm(initialForm);
    setSuccess(`Турнир "${created.name}" успешно создан`);
    setScheduleForm((current) => ({
      ...current,
      tournamentId: created.id,
      startDate: form.startDate,
    }));
  }

  function validateSchedule() {
    const nextErrors: Record<string, string> = {};
    const days = Number(scheduleForm.daysBetweenRounds);

    if (!scheduleForm.tournamentId) {
      nextErrors.tournamentId = "Выберите турнир";
    }

    if (!scheduleForm.startDate) {
      nextErrors.startDate = "Укажите дату первого тура";
    }

    if (!Number.isInteger(days) || days < 1 || days > 30) {
      nextErrors.daysBetweenRounds = "Интервал должен быть от 1 до 30 дней";
    }

    return nextErrors;
  }

  async function handleGenerateSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSchedule();
    setScheduleErrors(validationErrors);
    setSuccess("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await generateSchedule({
      tournamentId: scheduleForm.tournamentId,
      startDate: scheduleForm.startDate,
      daysBetweenRounds: Number(scheduleForm.daysBetweenRounds),
    });

    const refreshed = await listTournaments();
    setItems(refreshed);
    setSuccess("Расписание успешно сгенерировано");
  }

  return (
    <>
      <section className="card tournaments-showcase">
        <div className="page-head">
          <h1 className="page-title">Турниры</h1>
        </div>
        <div className="tournaments-stats">
          {stats.map((item) => (
            <article
              className={`tournament-stat tournament-stat-${item.tone}`}
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
        <div className="tournaments-toolbar">
          <div className="toolbar">
            <input
              className="toolbar-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию"
              value={query}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Все статусы</option>
              <option value="Идёт регистрация">Идёт регистрация</option>
              <option value="Матчи опубликованы">Матчи опубликованы</option>
              <option value="Активен">Активен</option>
              <option value="Завершён">Завершён</option>
            </select>
            <select
              onChange={(event) =>
                setSortKey(event.target.value as "name" | "teams" | "status")
              }
              value={sortKey}
            >
              <option value="name">Сортировка: название</option>
              <option value="teams">Сортировка: команды</option>
              <option value="status">Сортировка: статус</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Формат</th>
                <th>Период</th>
                <th>Группы</th>
                <th>Команды</th>
                <th>Матчи</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((tournament) => (
                <tr key={tournament.id}>
                  <td className="tournament-name-cell">
                    <strong>{tournament.name}</strong>
                    <span>
                      {tournament.teams} команд • {tournament.matches} матчей
                    </span>
                  </td>
                  <td>{tournament.format}</td>
                  <td>
                    {tournament.startDate} - {tournament.endDate}
                  </td>
                  <td>{tournament.groups}</td>
                  <td>{tournament.teams}</td>
                  <td>{tournament.matches}</td>
                  <td>
                    <span className="pill">{tournament.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canManage ? (
        <>
          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Создать турнир</h2>
              <p className="section-subtitle">
                Форма организатора покрывает основные обязательные поля из тест-кейсов.
              </p>
            </div>
            <form className="form-grid" noValidate onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="title">Название турнира</label>
                <input
                  id="title"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Например, Кубок весны 2026"
                  value={form.name}
                />
                <span className={`field-error${errors.name ? "" : " is-empty"}`}>
                  {errors.name || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="format">Формат этапа</label>
                <select
                  id="format"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, format: event.target.value }))
                  }
                  value={form.format}
                >
                  <option value="Групповой этап + плей-офф">Группы + плей-офф</option>
                  <option value="Круговая система">Круговая система</option>
                  <option value="Плей-офф">Плей-офф</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="start-date">Дата начала</label>
                <input
                  id="start-date"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                  type="date"
                  value={form.startDate}
                />
                <span className={`field-error${errors.startDate ? "" : " is-empty"}`}>
                  {errors.startDate || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="end-date">Дата окончания</label>
                <input
                  id="end-date"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                  type="date"
                  value={form.endDate}
                />
                <span className={`field-error${errors.endDate ? "" : " is-empty"}`}>
                  {errors.endDate || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="groups">Количество групп</label>
                <input
                  id="groups"
                  max="8"
                  min="1"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, groups: event.target.value }))
                  }
                  type="number"
                  value={form.groups}
                />
                <span className={`field-error${errors.groups ? "" : " is-empty"}`}>
                  {errors.groups || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="status">Стартовый статус</label>
                <select
                  id="status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as TournamentStatus,
                    }))
                  }
                  value={form.status}
                >
                  <option value="Идёт регистрация">Идёт регистрация</option>
                  <option value="Матчи опубликованы">Матчи опубликованы</option>
                  <option value="Активен">Активен</option>
                </select>
              </div>
              <div className="field field-wide form-feedback-slot">
                {success ? (
                  <div className="message-success">{success}</div>
                ) : (
                  <div aria-hidden="true" className="message-placeholder" />
                )}
              </div>
              <div className="field field-wide">
                <button className="button button-primary" type="submit">
                  Создать турнир
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Сформировать календарь</h2>
              <p className="section-subtitle">
                Автоматическая круговая генерация матчей для выбранного турнира.
              </p>
            </div>
            <form className="form-grid" noValidate onSubmit={handleGenerateSchedule}>
              <div className="field">
                <label htmlFor="schedule-tournament">Турнир</label>
                <select
                  id="schedule-tournament"
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      tournamentId: event.target.value,
                    }))
                  }
                  value={scheduleForm.tournamentId}
                >
                  {items.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                <span className={`field-error${scheduleErrors.tournamentId ? "" : " is-empty"}`}>
                  {scheduleErrors.tournamentId || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="schedule-start-date">Дата первого тура</label>
                <input
                  id="schedule-start-date"
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                  type="date"
                  value={scheduleForm.startDate}
                />
                <span className={`field-error${scheduleErrors.startDate ? "" : " is-empty"}`}>
                  {scheduleErrors.startDate || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="schedule-days">Дней между турами</label>
                <input
                  id="schedule-days"
                  max="30"
                  min="1"
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      daysBetweenRounds: event.target.value,
                    }))
                  }
                  type="number"
                  value={scheduleForm.daysBetweenRounds}
                />
                <span
                  className={`field-error${scheduleErrors.daysBetweenRounds ? "" : " is-empty"}`}
                >
                  {scheduleErrors.daysBetweenRounds || "\u00a0"}
                </span>
              </div>
              <div className="field field-wide">
                <button className="button button-primary" type="submit">
                  Сгенерировать расписание
                </button>
              </div>
            </form>
          </section>
        </>
      ) : null}
    </>
  );
}
