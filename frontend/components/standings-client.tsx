"use client";

import { useEffect, useMemo, useState } from "react";
import { listStandings } from "@/components/mock-api";
import { StandingRecord } from "@/components/mock-data";

export function StandingsClient() {
  const [items, setItems] = useState<StandingRecord[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"position" | "points" | "team">(
    "position",
  );

  useEffect(() => {
    listStandings().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) =>
        item.team.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        if (sortKey === "points") {
          return b.points - a.points;
        }

        if (sortKey === "position") {
          return a.position - b.position;
        }

        return a.team.localeCompare(b.team, "ru");
      });
  }, [items, query, sortKey]);

  return (
    <section className="card">
      <div className="page-head">
        <h1 className="page-title">Турнирная таблица</h1>
        <p className="page-subtitle">
          Поиск и сортировка для быстрого анализа текущего положения команд.
        </p>
      </div>
      <div className="meta">
        <span className="pill success">ФИФА: Очки</span>
        <span className="pill success">Разница голов</span>
        <span className="pill success">Забитые голы</span>
      </div>
      <div className="toolbar" style={{ marginTop: 18 }}>
        <input
          className="toolbar-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти команду"
          value={query}
        />
        <select
          onChange={(event) =>
            setSortKey(event.target.value as "position" | "points" | "team")
          }
          value={sortKey}
        >
          <option value="position">Сортировка: место</option>
          <option value="points">Сортировка: очки</option>
          <option value="team">Сортировка: команда</option>
        </select>
      </div>
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
              <tr key={team.team}>
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
