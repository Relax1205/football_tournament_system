"use client";

import { useEffect, useMemo, useState } from "react";
import { listPlayers } from "@/components/mock-api";
import { PlayerRecord } from "@/components/mock-data";

export function TeamsClient() {
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"goals" | "name" | "red" | "team" | "yellow">("goals");

  useEffect(() => {
    void listPlayers().then(setPlayers);
  }, []);

  const teamsFromPlayers = useMemo(
    () => Array.from(new Set(players.map((player) => player.team))),
    [players],
  );

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

        if (sortKey === "yellow") {
          return right.yellow - left.yellow;
        }

        if (sortKey === "red") {
          return right.red - left.red;
        }

        return String(left[sortKey]).localeCompare(String(right[sortKey]), "ru");
      });
  }, [players, query, sortKey, teamFilter]);

  return (
    <section className="card">
      <div className="page-head">
        <h1 className="page-title">Команды и игроки</h1>
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
          onChange={(event) =>
            setSortKey(event.target.value as "goals" | "name" | "red" | "team" | "yellow")
          }
          value={sortKey}
        >
          <option value="goals">Сортировка: голы</option>
          <option value="yellow">Сортировка: жёлтые карточки</option>
          <option value="red">Сортировка: красные карточки</option>
          <option value="team">Сортировка: команда</option>
          <option value="name">Сортировка: имя</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Игрок</th>
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
  );
}
