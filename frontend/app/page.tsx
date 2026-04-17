import { LayoutShell } from "@/components/layout-shell";
import { initialMatches, initialTournaments } from "@/components/mock-data";
import { HeroActions } from "@/components/hero-actions";

export default function HomePage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <span className="pill hero-pill">Football Tournament System</span>
            <h1>Система учёта футбольных турниров для организаторов, судей и команд</h1>
            <p>
              Платформа помогает вести турнир в одном месте: публиковать
              расписание, фиксировать результаты матчей, считать таблицу и
              работать с заявками команд без ручных Excel-файлов и переписок.
            </p>
            <HeroActions />
          </div>
          <div className="hero-side">
            <div className="stat-card">
              <span>Турниры</span>
              <strong>{initialTournaments.length}</strong>
              <span>регистрация, группы, матчи и статусы соревнований</span>
            </div>
            <div className="stat-card">
              <span>Пользовательские роли</span>
              <strong>5</strong>
              <span>администратор, организатор, судья, тренер и зритель</span>
            </div>
            <div className="stat-card">
              <span>Ближайшие матчи</span>
              <strong>{initialMatches.length}</strong>
              <span>календарь игр, результаты и подтверждение судейских данных</span>
            </div>
          </div>
        </section>

        <section className="hero-band">
          <div className="hero-band-card">
            <span>Для организатора</span>
            <strong>Создание турниров, заявки команд и контроль результатов</strong>
          </div>
          <div className="hero-band-card">
            <span>Для судьи</span>
            <strong>Ввод счёта, событий матча и отправка результата на подтверждение</strong>
          </div>
          <div className="hero-band-card">
            <span>Для команды и зрителей</span>
            <strong>Таблица, расписание, статистика игроков и текущий статус турнира</strong>
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что умеет система</h2>
              <p className="section-subtitle">
                Ключевые задачи, ради которых создаётся система учёта турниров.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Управление турнирами</strong>
                  Создание соревнований, настройка формата, дат и этапов.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Работа с командами</strong>
                  Заявки на участие, просмотр состава и контроль статуса допуска.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Матчи и результаты</strong>
                  Расписание игр, ввод счёта и подтверждение итогов матча.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Таблица и статистика</strong>
                  Положение команд, голы, карточки и сводная турнирная информация.
                </div>
              </li>
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Для кого подходит интерфейс</h2>
              <p className="section-subtitle">
                Основные сценарии для разных участников турнира.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Организатор турнира</strong>
                  Создаёт турнир, рассматривает заявки и подтверждает результаты.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Судья матча</strong>
                  Быстро вносит результат, счёт и ключевые события встречи.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Тренер команды</strong>
                  Следит за статистикой игроков и отправляет заявку на участие.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Зритель и участник</strong>
                  Смотрит календарь матчей, турнирную таблицу и текущее состояние турнира.
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
