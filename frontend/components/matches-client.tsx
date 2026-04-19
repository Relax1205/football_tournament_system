"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  confirmMatch,
  getMatchReportUrl,
  listMatches,
  listPlayers,
  saveMatchResult,
} from "@/components/mock-api";
import { MatchEventType, MatchRecord, MatchStatus, PlayerRecord } from "@/components/mock-data";

type MatchForm = {
  awayScore: string;
  comment: string;
  eventMinute: string;
  eventType: MatchEventType;
  homeScore: string;
  matchId: string;
  playerId: string;
  status: MatchStatus;
};

const initialForm: MatchForm = {
  awayScore: "0",
  comment: "",
  eventMinute: "1",
  eventType: "goal",
  homeScore: "0",
  matchId: "",
  playerId: "",
  status: "Требует подтверждения",
};

function isEditableMatch(match: MatchRecord) {
  return match.apiStatus !== "CONFIRMED" && match.apiStatus !== "CANCELLED";
}

function getFirstAvailablePlayer(match: MatchRecord | null, players: PlayerRecord[]) {
  if (!match) {
    return "";
  }

  return (
    players.find(
      (player) =>
        player.teamId === match.homeTeamId || player.teamId === match.awayTeamId,
    )?.id ?? ""
  );
}

function formatSaveError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Не удалось сохранить результат матча";
  }

  if (error.message.includes("Confirmed matches cannot be edited")) {
    return "Подтверждённый матч нельзя редактировать";
  }

  if (error.message.includes("Request failed")) {
    return "Не удалось сохранить результат матча";
  }

  return error.message;
}

export function MatchesClient() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "organizer" || user?.role === "referee";
  const canConfirm = user?.role === "admin" || user?.role === "organizer";
  const [items, setItems] = useState<MatchRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"date" | "status" | "home">("date");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<MatchForm>(initialForm);

  const editableMatches = useMemo(
    () => items.filter((match) => isEditableMatch(match)),
    [items],
  );

  const currentMatch = useMemo(
    () => editableMatches.find((match) => match.id === form.matchId) ?? null,
    [editableMatches, form.matchId],
  );

  const availablePlayers = useMemo(() => {
    if (!currentMatch) {
      return [];
    }

    return players.filter(
      (player) =>
        player.teamId === currentMatch.homeTeamId || player.teamId === currentMatch.awayTeamId,
    );
  }, [currentMatch, players]);

  useEffect(() => {
    void Promise.all([listMatches(), listPlayers()]).then(([loadedMatches, loadedPlayers]) => {
      setItems(loadedMatches);
      setPlayers(loadedPlayers);

      const firstEditableMatch = loadedMatches.find((match) => isEditableMatch(match)) ?? null;
      const firstPlayer = getFirstAvailablePlayer(firstEditableMatch, loadedPlayers);

      if (firstEditableMatch) {
        setForm((current) => ({
          ...current,
          matchId: firstEditableMatch.id,
          homeScore: String(firstEditableMatch.homeScore),
          awayScore: String(firstEditableMatch.awayScore),
          playerId: firstPlayer,
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (!canEdit) {
      return;
    }

    const selectedMatch = editableMatches.find((match) => match.id === form.matchId) ?? null;
    if (!selectedMatch) {
      const fallbackMatch = editableMatches[0] ?? null;
      if (!fallbackMatch) {
        setForm((current) => ({
          ...current,
          matchId: "",
          playerId: "",
        }));
        return;
      }

      setForm((current) => ({
        ...current,
        matchId: fallbackMatch.id,
        homeScore: String(fallbackMatch.homeScore),
        awayScore: String(fallbackMatch.awayScore),
        playerId: getFirstAvailablePlayer(fallbackMatch, players),
      }));
      return;
    }

    const selectedPlayerAvailable = availablePlayers.some((player) => player.id === form.playerId);
    if (!selectedPlayerAvailable) {
      setForm((current) => ({
        ...current,
        playerId: getFirstAvailablePlayer(selectedMatch, players),
      }));
    }
  }, [availablePlayers, canEdit, editableMatches, form.matchId, form.playerId, players]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((match) => (statusFilter === "all" ? true : match.status === statusFilter))
      .filter((match) =>
        `${match.home} ${match.away} ${match.venue}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => String(left[sortKey]).localeCompare(String(right[sortKey]), "ru"));
  }, [items, query, sortKey, statusFilter]);

  function handleMatchChange(matchId: string) {
    const nextMatch = editableMatches.find((match) => match.id === matchId) ?? null;
    const nextPlayerId = getFirstAvailablePlayer(nextMatch, players);

    setForm((current) => ({
      ...current,
      matchId,
      homeScore: String(nextMatch?.homeScore ?? current.homeScore),
      awayScore: String(nextMatch?.awayScore ?? current.awayScore),
      playerId: nextPlayerId,
    }));
  }

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

    if (
      form.eventMinute &&
      (!Number.isInteger(eventMinute) || eventMinute < 1 || eventMinute > 120)
    ) {
      nextErrors.eventMinute = "Минута гола должна быть от 1 до 120";
    }

    if (form.comment.trim().length < 6) {
      nextErrors.comment = "Добавьте комментарий минимум из 6 символов";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess("");
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!currentMatch) {
      setSubmitError("Нет матча, доступного для ввода результата");
      return;
    }

    try {
      const updated = await saveMatchResult({
        awayScore: Number(form.awayScore),
        comment: form.comment.trim(),
        eventMinute: Number(form.eventMinute),
        eventType: form.eventType,
        homeScore: Number(form.homeScore),
        matchId: form.matchId,
        playerId: form.playerId || undefined,
        status:
          user?.role === "organizer" || user?.role === "admin"
            ? "Подтверждён"
            : form.status,
      });

      setItems((current) => current.map((match) => (match.id === updated.id ? updated : match)));
      setSuccess(
        user?.role === "organizer" || user?.role === "admin"
          ? "Результат сохранён и подтверждён"
          : "Результат сохранён и отправлен организатору",
      );
    } catch (error) {
      setSubmitError(formatSaveError(error));
    }
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Матчи и расписание</h1>
        </div>
        <div className="toolbar">
          <input
            className="toolbar-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по команде или стадиону"
            value={query}
          />
          <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="all">Все статусы</option>
            <option value="Запланирован">Запланирован</option>
            <option value="Требует подтверждения">Требует подтверждения</option>
            <option value="Подтверждён">Подтверждён</option>
            <option value="Отменён">Отменён</option>
          </select>
          <select
            onChange={(event) => setSortKey(event.target.value as "date" | "status" | "home")}
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
                    <div className="inline-actions">
                      {canConfirm && match.status === "Требует подтверждения" ? (
                        <button
                          className="button button-secondary"
                          onClick={async () => {
                            const updated = await confirmMatch(match.id);
                            setItems((current) =>
                              current.map((item) => (item.id === updated.id ? updated : item)),
                            );
                          }}
                          type="button"
                        >
                          Подтвердить
                        </button>
                      ) : null}
                      <a className="button button-secondary" href={getMatchReportUrl(match.id)}>
                        Сгенерировать протокол
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canEdit ? (
        <section className="card">
          <div className="section-head">
            <h2 className="section-title">Ввод результата матча</h2>
          </div>
          {!currentMatch ? (
            <div className="message-error">Нет матчей, доступных для ввода результата.</div>
          ) : null}
          <form className="form-grid" noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="match-id">Матч</label>
              <select
                disabled={!currentMatch}
                id="match-id"
                onChange={(event) => handleMatchChange(event.target.value)}
                value={form.matchId}
              >
                {editableMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.home} / {match.away}
                  </option>
                ))}
              </select>
              <span className={`field-error${errors.matchId ? "" : " is-empty"}`}>
                {errors.matchId || "\u00a0"}
              </span>
            </div>
            <div className="field">
              <label htmlFor="status">Статус</label>
              <select
                disabled={!currentMatch}
                id="status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as MatchStatus,
                  }))
                }
                value={form.status}
              >
                <option value="Требует подтверждения">Требует подтверждения</option>
                {canConfirm ? <option value="Подтверждён">Подтверждён</option> : null}
              </select>
            </div>
            <div className="field">
              <label htmlFor="home-score">Голы хозяев</label>
              <input
                disabled={!currentMatch}
                id="home-score"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({ ...current, homeScore: event.target.value }))
                }
                type="number"
                value={form.homeScore}
              />
              <span className={`field-error${errors.homeScore ? "" : " is-empty"}`}>
                {errors.homeScore || "\u00a0"}
              </span>
            </div>
            <div className="field">
              <label htmlFor="away-score">Голы гостей</label>
              <input
                disabled={!currentMatch}
                id="away-score"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({ ...current, awayScore: event.target.value }))
                }
                type="number"
                value={form.awayScore}
              />
              <span className={`field-error${errors.awayScore ? "" : " is-empty"}`}>
                {errors.awayScore || "\u00a0"}
              </span>
            </div>
            <div className="field">
              <label htmlFor="event-player">Игрок</label>
              <select
                disabled={!currentMatch}
                id="event-player"
                onChange={(event) =>
                  setForm((current) => ({ ...current, playerId: event.target.value }))
                }
                value={form.playerId}
              >
                {availablePlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} · {player.team}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="event-minute">Минута гола</label>
              <input
                disabled={!currentMatch}
                id="event-minute"
                max="120"
                min="1"
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventMinute: event.target.value }))
                }
                type="number"
                value={form.eventMinute}
              />
              <span className={`field-error${errors.eventMinute ? "" : " is-empty"}`}>
                {errors.eventMinute || "\u00a0"}
              </span>
            </div>
            <div className="field">
              <label htmlFor="event-type">Событие</label>
              <select
                disabled={!currentMatch}
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
                <option value="substitution">Замена</option>
              </select>
            </div>
            <div className="field field-wide">
              <label htmlFor="comment">Комментарий судьи</label>
              <input
                disabled={!currentMatch}
                id="comment"
                onChange={(event) =>
                  setForm((current) => ({ ...current, comment: event.target.value }))
                }
                placeholder="Например, данные проверены после матча"
                value={form.comment}
              />
              <span className={`field-error${errors.comment ? "" : " is-empty"}`}>
                {errors.comment || "\u00a0"}
              </span>
            </div>
            <div className="field field-wide form-feedback-slot">
              {submitError ? (
                <div className="message-error">{submitError}</div>
              ) : success ? (
                <div className="message-success">{success}</div>
              ) : (
                <div aria-hidden="true" className="message-placeholder" />
              )}
            </div>
            <div className="field field-wide">
              <button className="button button-primary" disabled={!currentMatch} type="submit">
                Сохранить результат
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}
