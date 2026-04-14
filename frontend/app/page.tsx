import Link from "next/link";
import { LayoutShell } from "@/components/layout-shell";
import {
  frontendScope,
  initialMatches,
  initialTournaments,
} from "@/components/mock-data";

export default function HomePage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <span className="pill hero-pill">Football Tournament System</span>
            <h1>Фронтенд с авторизацией и ролями для системы турниров</h1>
            <p>
              Это уже не просто набор страниц, а спортивный интерфейс учебного
              веб-приложения: роли, кабинет, маршруты, формы, таблицы,
              адаптивность и готовая база под подключение backend.
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
              <span>от кабинета до матчей и заявок</span>
            </div>
            <div className="stat-card">
              <span>Роли доступа</span>
              <strong>5</strong>
              <span>admin, organizer, referee, coach, fan</span>
            </div>
            <div className="stat-card">
              <span>Авторизация</span>
              <strong>Mock Auth</strong>
              <span>готово к замене на реальный backend</span>
            </div>
          </div>
        </section>

        <section className="hero-band">
          <div className="hero-band-card">
            <span>UI-компоненты</span>
            <strong>Карточки, формы, таблицы</strong>
          </div>
          <div className="hero-band-card">
            <span>Валидация</span>
            <strong>Турнир, заявка, результат матча</strong>
          </div>
          <div className="hero-band-card">
            <span>Адаптивность</span>
            <strong>От мобильного судьи до десктопа организатора</strong>
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
              <p className="section-subtitle">
                Карточки главного экрана с ключевой информацией по текущим
                соревнованиям.
              </p>
            </div>
            <ul className="list">
              {initialTournaments.map((tournament) => (
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
              {initialMatches.map((match) => (
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
