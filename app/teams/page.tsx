import { LayoutShell } from "@/components/layout-shell";
import { AccessGuard } from "@/components/access-guard";
import { applications, players } from "@/components/mock-data";

export default function TeamsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "coach", "fan"]}>
          <section className="card">
            <div className="page-head">
              <h1 className="page-title">Команды и игроки</h1>
              <p className="page-subtitle">
                Экран тренера и организатора: статистика игроков, заявки и
                регистрация команд.
              </p>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Игрок</th>
                    <th>№</th>
                    <th>Команда</th>
                    <th>Голы</th>
                    <th>ЖК</th>
                    <th>КК</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.name}>
                      <td>{player.name}</td>
                      <td>{player.number}</td>
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

          <section className="grid grid-2">
            <article className="card">
              <div className="section-head">
                <h2 className="section-title">Заявки на турнир</h2>
                <p className="section-subtitle">
                  Список активных заявок для тренера и организатора.
                </p>
              </div>
              <ul className="list">
                {applications.map((application) => (
                  <li className="list-item" key={application.id}>
                    <div>
                      <strong>{application.team}</strong>
                      {application.tournament}
                      <br />
                      Тренер: {application.coach}
                    </div>
                    <span className="pill">{application.status}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card">
              <div className="section-head">
                <h2 className="section-title">Подать заявку команды</h2>
                <p className="section-subtitle">
                  Сценарий тренера: заявка на участие с базовой валидацией полей.
                </p>
              </div>
              <form className="form-grid">
                <div className="field">
                  <label htmlFor="team-name">Название команды</label>
                  <input id="team-name" placeholder="Уралец" />
                </div>
                <div className="field">
                  <label htmlFor="city">Город</label>
                  <input id="city" placeholder="Екатеринбург" />
                </div>
                <div className="field">
                  <label htmlFor="coach">Тренер</label>
                  <input id="coach" placeholder="Андрей Смирнов" />
                </div>
                <div className="field">
                  <label htmlFor="players-count">Количество игроков</label>
                  <input
                    id="players-count"
                    type="number"
                    min="7"
                    max="30"
                    defaultValue="18"
                  />
                </div>
                <div className="field field-wide">
                  <label htmlFor="tournament-name">Турнир</label>
                  <input
                    id="tournament-name"
                    placeholder="Весенний кубок Екатеринбурга"
                  />
                </div>
                <div className="field field-wide">
                  <button className="button button-primary" type="button">
                    Отправить заявку
                  </button>
                </div>
              </form>
            </article>
          </section>
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
