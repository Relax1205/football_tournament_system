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
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<MatchForm>(initialForm);

  useEffect(() => {
    void Promise.all([listMatches(), listPlayers()]).then(([loadedMatches, loadedPlayers]) => {
      setItems(loadedMatches);
      setPlayers(loadedPlayers);

      const firstMatch = loadedMatches[0];
      if (firstMatch) {
        const firstPlayer = loadedPlayers.find(
          (player) =>
            player.teamId === firstMatch.homeTeamId || player.teamId === firstMatch.awayTeamId,
        );

        setForm((current) => ({
          ...current,
          matchId: firstMatch.id,
          homeScore: String(firstMatch.homeScore),
          awayScore: String(firstMatch.awayScore),
          playerId: firstPlayer?.id ?? "",
        }));
      }
    });
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...items]
      .filter((match) => (statusFilter === "all" ? true : match.status === statusFilter))
      .filter((match) =>
        `${match.home} ${match.away} ${match.venue}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => String(left[sortKey]).localeCompare(String(right[sortKey]), "ru"));
  }, [items, query, sortKey, statusFilter]);

  const currentMatch = useMemo(
    () => items.find((match) => match.id === form.matchId) ?? null,
    [form.matchId, items],
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
      playerId: form.playerId || undefined,
      status: user?.role === "organizer" || user?.role === "admin" ? "Подтверждён" : form.status,
    });

    setItems((current) => current.map((match) => (match.id === updated.id ? updated : match)));
    setSuccess(
      user?.role === "organizer" || user?.role === "admin"
        ? "Результат сохранён и подтверждён"
        : "Результат сохранён и отправлен организатору",
    );
  }

  return (
    <>
      <section className="card">
        <div className="page-head">
          <h1 className="page-title">Матчи и расписание</h1>
          <p className="page-subtitle">
            Раздел доступен всем ролям: болельщик и тренер просматривают календарь, судья и
            организатор работают с результатами.
          </p>
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
            <p className="section-subtitle">
              Судья отправляет результат и событие матча, организатор может сразу подтвердить итог.
            </p>
          </div>
          <form className="form-grid" noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="match-id">Матч</label>
              <select
                id="match-id"
                onChange={(event) => {
                  const nextMatch = items.find((match) => match.id === event.target.value);
                  const nextPlayer = players.find(
                    (player) =>
                      player.teamId === nextMatch?.homeTeamId ||
                      player.teamId === nextMatch?.awayTeamId,
                  );

                  setForm((current) => ({
                    ...current,
                    matchId: event.target.value,
                    homeScore: String(nextMatch?.homeScore ?? current.homeScore),
                    awayScore: String(nextMatch?.awayScore ?? current.awayScore),
                    playerId: nextPlayer?.id ?? "",
                  }));
                }}
                value={form.matchId}
              >
                {items.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.home} / {match.away}
                  </option>
                ))}
              </select>
              {errors.matchId ? <span className="field-error">{errors.matchId}</span> : null}
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
                <option value="Требует подтверждения">Требует подтверждения</option>
                {canConfirm ? <option value="Подтверждён">Подтверждён</option> : null}
              </select>
            </div>
            <div className="field">
              <label htmlFor="home-score">Голы хозяев</label>
              <input
                id="home-score"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({ ...current, homeScore: event.target.value }))
                }
                type="number"
                value={form.homeScore}
              />
              {errors.homeScore ? <span className="field-error">{errors.homeScore}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="away-score">Голы гостей</label>
              <input
                id="away-score"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({ ...current, awayScore: event.target.value }))
                }
                type="number"
                value={form.awayScore}
              />
              {errors.awayScore ? <span className="field-error">{errors.awayScore}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="event-player">Игрок</label>
              <select
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
                id="event-minute"
                max="120"
                min="1"
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventMinute: event.target.value }))
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
                <option value="substitution">Замена</option>
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
              {errors.comment ? <span className="field-error">{errors.comment}</span> : null}
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
      ) : (
        <section className="card">
          <div className="section-head">
            <h2 className="section-title">Режим просмотра</h2>
            <p className="section-subtitle">
              Для вашей роли доступен просмотр календаря, результатов и скачивание протокола без
              прав редактирования.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
