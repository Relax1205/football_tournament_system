"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { confirmMatch, listMatches, saveMatchResult } from "@/components/mock-api";
import { MatchEventType, MatchRecord, MatchStatus } from "@/components/mock-data";

type MatchForm = {
  awayScore: string;
  comment: string;
  eventMinute: string;
  eventType: MatchEventType;
  homeScore: string;
  matchId: string;
  status: MatchStatus;
};

export function MatchesClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<MatchRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"date" | "status" | "home">("date");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<MatchForm>({
    awayScore: "0",
    comment: "",
    eventMinute: "",
    eventType: "goal",
    homeScore: "0",
    matchId: "M-101",
    status: "Требует подтверждения",
  });

  useEffect(() => {
    listMatches().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((match) =>
        statusFilter === "all" ? true : match.status === statusFilter,
      )
      .filter((match) =>
        `${match.home} ${match.away} ${match.venue}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), "ru"));
  }, [items, query, sortKey, statusFilter]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    const homeScore = Number(form.homeScore);
    const awayScore = Number(form.awayScore);
    const eventMinute = Number(form.eventMinute);

    if (!form.matchId) {
      nextErrors.matchId = "Выберите матч";
    }

    if (!Number.isInteger(homeScore) || homeScore < 0) {
      nextErrors.homeScore = "Счёт должен быть целым и неотрицательным";
    }

    if (!Number.isInteger(awayScore) || awayScore < 0) {
      nextErrors.awayScore = "Счёт должен быть целым и неотрицательным";
    }

    if (!Number.isInteger(eventMinute) || eventMinute < 1 || eventMinute > 120) {
      nextErrors.eventMinute = "Минута события должна быть от 1 до 120";
    }

    if (form.comment.trim().length < 6) {
      nextErrors.comment = "Добавьте короткий комментарий минимум из 6 символов";
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

    const updated = await saveMatchResult({
      awayScore: Number(form.awayScore),
      comment: form.comment.trim(),
      eventMinute: Number(form.eventMinute),
      eventType: form.eventType,
      homeScore: Number(form.homeScore),
      matchId: form.matchId,
      status: user?.role === "organizer" ? "Подтверждён" : form.status,
    });

    setItems((current) =>
      current.map((match) => (match.id === updated.id ? updated : match)),
    );
    setSuccess(
      user?.role === "organizer"
        ? "Результат сохранён и подтверждён"
        : "Результат сохранён и отправлен организатору",
    );
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Матчи и результаты</h1>
          <p className="page-subtitle">
            Рабочая таблица с поиском, фильтрацией и статусными действиями.
          </p>
        </div>
        <div className="toolbar">
          <input
            className="toolbar-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по команде или стадиону"
            value={query}
          />
          <select
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="all">Все статусы</option>
            <option value="Запланирован">Запланирован</option>
            <option value="Черновик">Черновик</option>
            <option value="Требует подтверждения">Требует подтверждения</option>
            <option value="Подтверждён">Подтверждён</option>
          </select>
          <select
            onChange={(event) =>
              setSortKey(event.target.value as "date" | "status" | "home")
            }
            value={sortKey}
          >
            <option value="date">Сортировка: дата</option>
            <option value="status">Сортировка: статус</option>
            <option value="home">Сортировка: команда</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Матч</th>
                <th>Дата</th>
                <th>Счёт</th>
                <th>Стадион</th>
                <th>Судья</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((match) => (
                <tr key={match.id}>
                  <td>
                    {match.home} - {match.away}
                  </td>
                  <td>
                    {match.date} · {match.time}
                  </td>
                  <td>
                    {match.homeScore}:{match.awayScore}
                  </td>
                  <td>{match.venue}</td>
                  <td>{match.referee}</td>
                  <td>{match.status}</td>
                  <td>
                    {user?.role === "organizer" &&
                    match.status === "Требует подтверждения" ? (
                      <button
                        className="button button-secondary"
                        onClick={async () => {
                          const updated = await confirmMatch(match.id);
                          setItems((current) =>
                            current.map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
                          );
                        }}
                        type="button"
                      >
                        Подтвердить
                      </button>
                    ) : (
                      <span className="table-muted">Просмотр</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2 className="section-title">Ввод результата матча</h2>
          <p className="section-subtitle">
            Судья отправляет результат, организатор может сразу подтвердить.
          </p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="match-id">Матч</label>
            <select
              id="match-id"
              onChange={(event) =>
                setForm((current) => ({ ...current, matchId: event.target.value }))
              }
              value={form.matchId}
            >
              {items.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.id} - {match.home} / {match.away}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Статус</label>
            <select
              id="status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as MatchStatus,
                }))
              }
              value={form.status}
            >
              <option value="Черновик">Черновик</option>
              <option value="Требует подтверждения">Требует подтверждения</option>
              {user?.role === "organizer" ? (
                <option value="Подтверждён">Подтверждён</option>
              ) : null}
            </select>
          </div>
          <div className="field">
            <label htmlFor="home-score">Голы хозяев</label>
            <input
              id="home-score"
              min="0"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  homeScore: event.target.value,
                }))
              }
              type="number"
              value={form.homeScore}
            />
            {errors.homeScore ? (
              <span className="field-error">{errors.homeScore}</span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="away-score">Голы гостей</label>
            <input
              id="away-score"
              min="0"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  awayScore: event.target.value,
                }))
              }
              type="number"
              value={form.awayScore}
            />
            {errors.awayScore ? (
              <span className="field-error">{errors.awayScore}</span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="event-minute">Минута события</label>
            <input
              id="event-minute"
              max="120"
              min="1"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  eventMinute: event.target.value,
                }))
              }
              type="number"
              value={form.eventMinute}
            />
            {errors.eventMinute ? (
              <span className="field-error">{errors.eventMinute}</span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="event-type">Событие</label>
            <select
              id="event-type"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  eventType: event.target.value as MatchEventType,
                }))
              }
              value={form.eventType}
            >
              <option value="goal">Гол</option>
              <option value="yellow">Жёлтая карточка</option>
              <option value="red">Красная карточка</option>
            </select>
          </div>
          <div className="field field-wide">
            <label htmlFor="comment">Комментарий судьи</label>
            <input
              id="comment"
              onChange={(event) =>
                setForm((current) => ({ ...current, comment: event.target.value }))
              }
              placeholder="Например, данные проверены после матча"
              value={form.comment}
            />
            {errors.comment ? (
              <span className="field-error">{errors.comment}</span>
            ) : null}
          </div>
          {success ? (
            <div className="field field-wide">
              <div className="message-success">{success}</div>
            </div>
          ) : null}
          <div className="field field-wide">
            <button className="button button-primary" type="submit">
              Сохранить результат
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
