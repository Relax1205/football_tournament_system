"use client";

import { useEffect, useState } from "react";
import { HeroActions } from "@/components/hero-actions";
import { LayoutShell } from "@/components/layout-shell";
import { listMatches, listTournaments } from "@/components/mock-api";
import { MatchRecord, Tournament } from "@/components/mock-data";

export default function HomePage() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    void Promise.all([listTournaments(), listMatches()]).then(([loadedTournaments, loadedMatches]) => {
      setTournaments(loadedTournaments);
      setMatches(loadedMatches);
    });
  }, []);

  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <span className="pill hero-pill">Football Tournament System</span>
            <h1>Система учёта футбольных турниров для организаторов, судей и команд</h1>
            <p>
              Платформа объединяет регистрацию команд, календарь матчей, ввод результатов,
              подтверждение протоколов, турнирную таблицу, статистику игроков и экспорт отчётов
              в одном интерфейсе.
            </p>
            <HeroActions />
          </div>
          <div className="hero-side">
            <div className="stat-card">
              <span>Турниры</span>
              <strong>{tournaments.length}</strong>
              <span>регистрация, статусы, команды, расписание и управление соревнованиями</span>
            </div>
            <div className="stat-card">
              <span>Пользовательские роли</span>
              <strong>5</strong>
              <span>администратор, организатор, судья, тренер и болельщик</span>
            </div>
            <div className="stat-card">
              <span>Матчи</span>
              <strong>{matches.length}</strong>
              <span>календарь игр, результаты, подтверждение и экспорт протоколов</span>
            </div>
          </div>
        </section>

        <section className="hero-band">
          <div className="hero-band-card">
            <span>Для организатора</span>
            <strong>Создание турниров, генерация расписания, заявки команд и подтверждение результатов</strong>
          </div>
          <div className="hero-band-card">
            <span>Для судьи</span>
            <strong>Ввод счёта, событий матча и передача результата на подтверждение</strong>
          </div>
          <div className="hero-band-card">
            <span>Для команды и зрителей</span>
            <strong>Таблица, календарь, статистика игроков и актуальный статус турнира</strong>
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что умеет система</h2>
              <p className="section-subtitle">
                Функции, которые напрямую соответствуют техническому заданию и практическим работам.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Управление турнирами</strong>
                  Создание турниров, выбор формата, статусы проведения и контроль состава участников.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Работа с командами</strong>
                  Заявки, одобрение организатором, добавление игроков и просмотр составов.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Матчи и результаты</strong>
                  Автоматическая генерация расписания, ручное добавление матча, ввод счёта и событий.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Таблица и отчёты</strong>
                  Пересчёт турнирной таблицы по правилам ФИФА, PDF-протокол матча и Excel-экспорт.
                </div>
              </li>
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Для кого подходит интерфейс</h2>
              <p className="section-subtitle">
                Роли и пользовательские сценарии из отчётов по предметной области.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Организатор турнира</strong>
                  Создаёт турнир, рассматривает заявки, формирует календарь и подтверждает итоги матчей.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Судья матча</strong>
                  Вносит результат, игровые события и отправляет встречу на подтверждение.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Тренер команды</strong>
                  Подаёт заявку на участие, добавляет игроков и отслеживает статистику состава.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Игрок и болельщик</strong>
                  Просматривает таблицу, расписание матчей и текущую форму турнира.
                </div>
              </li>
            </ul>
          </article>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Активные турниры</h2>
              <p className="section-subtitle">
                Данные загружаются из backend и отражают текущее состояние системы.
              </p>
            </div>
            <ul className="list">
              {tournaments.map((tournament) => (
                <li key={tournament.id} className="list-item">
                  <div>
                    <strong>{tournament.name}</strong>
                    {tournament.format} · {tournament.teams} команд
                    <br />
                    {tournament.startDate} - {tournament.endDate}
                  </div>
                  <span className="pill warning">{tournament.status}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Ближайшие матчи</h2>
              <p className="section-subtitle">
                Быстрый обзор для судьи, тренера и болельщика.
              </p>
            </div>
            <ul className="list">
              {matches.slice(0, 5).map((match) => (
                <li key={match.id} className="list-item">
                  <div>
                    <strong>
                      {match.home} - {match.away}
                    </strong>
                    {match.date}, {match.time}
                    <br />
                    {match.venue} · Судья: {match.referee}
                  </div>
                  <span className="pill">{match.status}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </LayoutShell>
  );
}
