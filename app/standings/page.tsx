import { LayoutShell } from "@/components/layout-shell";
import { AccessGuard } from "@/components/access-guard";
import { standings } from "@/components/mock-data";

export default function StandingsPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <AccessGuard roles={["admin", "organizer", "referee", "coach", "fan"]}>
          <section className="card">
            <div className="page-head">
              <h1 className="page-title">Турнирная таблица</h1>
              <p className="page-subtitle">
                Экран просмотра таблицы с сортировкой по очкам, разнице голов и
                забитым мячам.
              </p>
            </div>
            <div className="meta">
              <span className="pill success">ФИФА: Очки</span>
              <span className="pill success">Разница голов</span>
              <span className="pill success">Забитые голы</span>
            </div>
            <div className="table-wrap" style={{ marginTop: 18 }}>
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
                  {standings.map((team) => (
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
        </AccessGuard>
      </main>
    </LayoutShell>
  );
}
