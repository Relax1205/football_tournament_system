import Link from "next/link";
import { LayoutShell } from "@/components/layout-shell";

const privacyPrinciples = [
  "Нам нужны только те данные, которые нужны для аккаунта, ролей, заявок, команд и уведомлений.",
  "Доступ к данным ограничивается ролями: администраторам, организаторам, судьям, тренерам и зрителям.",
  "Вы можете запросить обновление или удаление своей учётной записи через администратора системы.",
];

const processedData = [
  "имя, email и роль пользователя",
  "данные команд, игроков, заявок и расписания",
  "результаты матчей, события и служебные уведомления",
];

export default function PrivacyPage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="grid grid-2">
          <article className="card">
            <div className="page-head">
              <h1 className="page-title">Политика конфиденциальности</h1>
              <p className="login-helper-copy">
                Эта страница объясняет, как система учёта турниров обрабатывает данные аккаунтов,
                команд, игроков и служебных уведомлений.
              </p>
            </div>
            <ul className="list">
              {privacyPrinciples.map((item) => (
                <li className="list-item" key={item}>
                  <div>{item}</div>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Какие данные обрабатываются</h2>
              <p className="login-helper-copy">
                Система использует данные только для организации турниров и управления доступом.
              </p>
            </div>
            <ul className="list">
              {processedData.map((item) => (
                <li className="list-item" key={item}>
                  <div>{item}</div>
                </li>
              ))}
            </ul>
            <div className="auth-page-footer">
              <Link className="button button-secondary" href="/register">
                Вернуться к регистрации
              </Link>
              <Link className="button button-secondary" href="/login">
                Перейти ко входу
              </Link>
            </div>
          </article>
        </section>
      </main>
    </LayoutShell>
  );
}
