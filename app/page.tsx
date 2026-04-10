import Link from "next/link";
import { LayoutShell } from "@/components/layout-shell";
import { frontendScope, matches, tournaments } from "@/components/mock-data";

export default function HomePage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <span className="pill">Frontend next level</span>
            <h1>Фронтенд с авторизацией и ролями для системы турниров</h1>
            <p>
              Теперь это уже не просто витрина, а демо-приложение с входом в
              систему, доступами по ролям, кабинетом пользователя и защищёнными
              разделами под реальные сценарии проекта.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/login">
                Войти в систему
              </Link>
              <Link className="button button-secondary" href="/dashboard">
                Открыть кабинет
              </Link>
            </div>
          </div>
          <div className="hero-side">
            <div className="stat-card">
              <span>Сценарии фронтенда</span>
              <strong>8+</strong>
            </div>
            <div className="stat-card">
              <span>Роли доступа</span>
              <strong>5</strong>
            </div>
            <div className="stat-card">
              <span>Авторизация</span>
              <strong>Mock Auth</strong>
            </div>
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что нужно делать по фронтенду</h2>
              <p className="section-subtitle">
                Это следует из ваших отчётов и теперь уже отражено в структуре
                демо-приложения.
              </p>
            </div>
            <ul className="list">
              {frontendScope.map((item) => (
                <li key={item} className="list-item">
                  <span className="pill success">UI</span>
                  <div>{item}</div>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что я уже заложил в MVP</h2>
              <p className="section-subtitle">
                Основа, которую можно дальше подключать к реальному backend.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Авторизация и роли</strong>
                  Вход по демо-аккаунтам и разделение доступа по ролям.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Личный кабинет</strong>
                  Быстрые действия и дашборд под администратора, организатора,
                  судью, тренера и болельщика.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Защищённые страницы</strong>
                  Турниры, матчи, таблица и команды с проверкой доступа.
                </div>
              </li>
            </ul>
          </article>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Активные турниры</h2>
            </div>
            <ul className="list">
              {tournaments.map((tournament) => (
                <li key={tournament.id} className="list-item">
                  <div>
                    <strong>{tournament.name}</strong>
                    {tournament.format} · {tournament.teams} команд
                    <br />
                    {tournament.dates}
                  </div>
                  <span className="pill warning">{tournament.status}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Ближайшие матчи</h2>
            </div>
            <ul className="list">
              {matches.map((match) => (
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
