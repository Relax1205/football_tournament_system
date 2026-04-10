"use client";

import { useEffect, useMemo, useState } from "react";
import { createTournament, listTournaments } from "@/components/mock-api";
import { Tournament, TournamentStatus } from "@/components/mock-data";

type TournamentForm = {
  endDate: string;
  format: string;
  groups: string;
  name: string;
  startDate: string;
  status: TournamentStatus;
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
  const [items, setItems] = useState<Tournament[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "teams" | "status">("name");
  const [form, setForm] = useState<TournamentForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    listTournaments().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) =>
        statusFilter === "all" ? true : item.status === statusFilter,
      )
      .filter((item) =>
        item.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        if (sortKey === "teams") {
          return b.teams - a.teams;
        }

        return String(a[sortKey]).localeCompare(String(b[sortKey]), "ru");
      });
  }, [items, query, sortKey, statusFilter]);

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
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Турниры</h1>
          <p className="page-subtitle">
            Список турниров с фильтрацией, сортировкой и рабочей формой
            создания.
          </p>
        </div>
        <div className="toolbar">
          <input
            className="toolbar-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию"
            value={query}
          />
          <select
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
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
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
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
                  <td>{tournament.id}</td>
                  <td>{tournament.name}</td>
                  <td>{tournament.format}</td>
                  <td>
                    {tournament.startDate} - {tournament.endDate}
                  </td>
                  <td>{tournament.groups}</td>
                  <td>{tournament.teams}</td>
                  <td>{tournament.matches}</td>
                  <td>{tournament.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Создать турнир</h2>
          <p className="section-subtitle">
            Клиентская валидация покрывает основные ограничения из требований.
          </p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
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
            {errors.name ? <span className="field-error">{errors.name}</span> : null}
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
                setForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              type="date"
              value={form.startDate}
            />
            {errors.startDate ? (
              <span className="field-error">{errors.startDate}</span>
            ) : null}
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
            {errors.endDate ? (
              <span className="field-error">{errors.endDate}</span>
            ) : null}
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
            {errors.groups ? (
              <span className="field-error">{errors.groups}</span>
            ) : null}
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
          {success ? (
            <div className="field field-wide">
              <div className="message-success">{success}</div>
            </div>
          ) : null}
          <div className="field field-wide">
            <button className="button button-primary" type="submit">
              Сохранить турнир
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
