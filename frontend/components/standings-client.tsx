"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  calculateStandings,
  getStandingsExportUrl,
  listStandings,
  listTournaments,
} from "@/components/mock-api";
import { StandingRecord, Tournament } from "@/components/mock-data";

export function StandingsClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<StandingRecord[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"position" | "points" | "team">("position");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void listTournaments().then((loadedTournaments) => {
      setTournaments(loadedTournaments);

      const firstTournamentId = loadedTournaments[0]?.id ?? "";
      setSelectedTournamentId(firstTournamentId);

      if (firstTournamentId) {
        void listStandings(firstTournamentId).then(setItems);
      }
    });
  }, []);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) => item.team.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((left, right) => {
        if (sortKey === "points") {
          return right.points - left.points;
        }

        if (sortKey === "position") {
          return left.position - right.position;
        }

        return left.team.localeCompare(right.team, "ru");
      });
  }, [items, query, sortKey]);

  return (
    <section className="card">
      <div className="page-head">
        <h1 className="page-title">Турнирная таблица</h1>
        <p className="page-subtitle">
          Таблица строится по правилам ФИФА: очки, разница голов, забитые голы.
        </p>
      </div>
      <div className="meta">
        <span className="pill success">ФИФА: очки</span>
        <span className="pill success">Разница голов</span>
        <span className="pill success">Забитые голы</span>
      </div>
      <div className="toolbar" style={{ marginTop: 18 }}>
        <select
          onChange={async (event) => {
            setSelectedTournamentId(event.target.value);
            setItems(await listStandings(event.target.value));
            setSuccess("");
          }}
          value={selectedTournamentId}
        >
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
        <input
          className="toolbar-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти команду"
          value={query}
        />
        <select
          onChange={(event) => setSortKey(event.target.value as "position" | "points" | "team")}
          value={sortKey}
        >
          <option value="position">Сортировка: место</option>
          <option value="points">Сортировка: очки</option>
          <option value="team">Сортировка: команда</option>
        </select>
        {(user?.role === "admin" || user?.role === "organizer") && selectedTournamentId ? (
          <button
            className="button button-secondary"
            onClick={async () => {
              const recalculated = await calculateStandings(selectedTournamentId);
              setItems(recalculated);
              setSuccess("Турнирная таблица пересчитана");
            }}
            type="button"
          >
            Пересчитать
          </button>
        ) : null}
        {selectedTournamentId ? (
          <a className="button button-secondary" href={getStandingsExportUrl(selectedTournamentId)}>
            Excel
          </a>
        ) : null}
      </div>
      {success ? <div className="message-success">{success}</div> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Место</th>
              <th>Команда</th>
              <th>И</th>
              <th>В</th>
              <th>Н</th>
              <th>П</th>
              <th>Голы</th>
              <th>Разница</th>
              <th>Очки</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((team) => (
              <tr key={team.teamId}>
                <td>{team.position}</td>
                <td>{team.team}</td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.draw}</td>
                <td>{team.lost}</td>
                <td>{team.goals}</td>
                <td>{team.diff}</td>
                <td>{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
