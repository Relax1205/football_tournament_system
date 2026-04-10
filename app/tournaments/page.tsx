import { LayoutShell } from "@/components/layout-shell";
import { AccessGuard } from "@/components/access-guard";
import { tournaments } from "@/components/mock-data";

export default function TournamentsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer"]}>
          <section className="card">
            <div className="page-head">
              <h1 className="page-title">Турниры</h1>
              <p className="page-subtitle">
                Экран организатора: список турниров, статусы и создание нового
                турнира.
              </p>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Формат</th>
                    <th>Даты</th>
                    <th>Команды</th>
                    <th>Матчи</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id}>
                      <td>{tournament.id}</td>
                      <td>{tournament.name}</td>
                      <td>{tournament.format}</td>
                      <td>{tournament.dates}</td>
                      <td>{tournament.teams}</td>
                      <td>{tournament.matches}</td>
                      <td>{tournament.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <h2 className="section-title">Создать турнир</h2>
              <p className="section-subtitle">
                Поля и сценарий соответствуют вашим функциональным требованиям.
              </p>
            </div>
            <form className="form-grid">
              <div className="field">
                <label htmlFor="title">Название турнира</label>
                <input id="title" placeholder="Например, Кубок весны 2026" />
              </div>
              <div className="field">
                <label htmlFor="type">Тип турнира</label>
                <select id="type" defaultValue="league">
                  <option value="league">Лиговый</option>
                  <option value="cup">Кубковый</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="start-date">Дата начала</label>
                <input id="start-date" type="date" />
              </div>
              <div className="field">
                <label htmlFor="end-date">Дата окончания</label>
                <input id="end-date" type="date" />
              </div>
              <div className="field">
                <label htmlFor="groups">Количество групп</label>
                <input id="groups" type="number" min="1" max="8" defaultValue="2" />
              </div>
              <div className="field">
                <label htmlFor="mode">Формат этапа</label>
                <select id="mode" defaultValue="mix">
                  <option value="mix">Группы + плей-офф</option>
                  <option value="round">Круговая система</option>
                  <option value="cup">Плей-офф</option>
                </select>
              </div>
              <div className="field field-wide">
                <button className="button button-primary" type="button">
                  Сохранить турнир
                </button>
              </div>
            </form>
          </section>
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
