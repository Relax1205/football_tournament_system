import { LayoutShell } from "@/components/layout-shell";
import { AccessGuard } from "@/components/access-guard";
import { matches } from "@/components/mock-data";

export default function MatchesPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "referee"]}>
          <section className="card">
            <div className="page-head">
              <h1 className="page-title">Матчи и результаты</h1>
              <p className="page-subtitle">
                Экран судьи и организатора: расписание, статусы и ввод результата
                матча.
              </p>
            </div>
            <ul className="list">
              {matches.map((match) => (
                <li className="list-item" key={match.id}>
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
          </section>

          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Ввод результата матча</h2>
              <p className="section-subtitle">
                Сценарий: судья сохраняет результат, организатор затем
                подтверждает его.
              </p>
            </div>
            <form className="form-grid">
              <div className="field">
                <label htmlFor="match-id">Матч</label>
                <select id="match-id" defaultValue="M-101">
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.id} - {match.home} / {match.away}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="status">Статус</label>
                <select id="status" defaultValue="pending">
                  <option value="pending">Требует подтверждения</option>
                  <option value="confirmed">Подтверждён</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="home-score">Голы хозяев</label>
                <input id="home-score" type="number" min="0" defaultValue="2" />
              </div>
              <div className="field">
                <label htmlFor="away-score">Голы гостей</label>
                <input id="away-score" type="number" min="0" defaultValue="1" />
              </div>
              <div className="field">
                <label htmlFor="goal-minute">Минута события</label>
                <input
                  id="goal-minute"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="1-120"
                />
              </div>
              <div className="field">
                <label htmlFor="event-type">Событие</label>
                <select id="event-type" defaultValue="goal">
                  <option value="goal">Гол</option>
                  <option value="yellow">Жёлтая карточка</option>
                  <option value="red">Красная карточка</option>
                </select>
              </div>
              <div className="field field-wide">
                <label htmlFor="comment">Комментарий судьи</label>
                <input
                  id="comment"
                  placeholder="Например, данные проверены после матча"
                />
              </div>
              <div className="field field-wide">
                <button className="button button-primary" type="button">
                  Сохранить результат
                </button>
              </div>
            </form>
          </section>
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
