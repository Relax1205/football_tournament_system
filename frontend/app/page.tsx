"use client";

import { HeroActions } from "@/components/hero-actions";
import { LayoutShell } from "@/components/layout-shell";

const audienceValueCards = [
  {
    eyebrow: "Для организатора",
    title: "Контроль над турниром без лишней рутины",
  },
  {
    eyebrow: "Для судьи",
    title: "Быстрый путь от результата матча до подтверждения",
  },
  {
    eyebrow: "Для команды",
    title: "Понятный статус заявки и прозрачный ход турнира",
  },
];

const userBenefits = [
  {
    title: "Ясность",
    description: "Пользователь сразу понимает, что происходит сейчас и какой следующий шаг нужен именно ему.",
  },
  {
    title: "Скорость",
    description: "Меньше ручных согласований, переписки и поиска актуальной информации по разным источникам.",
  },
  {
    title: "Уверенность",
    description: "Статусы, результаты и ключевые решения фиксируются в одном месте и остаются прозрачными для участников.",
  },
  {
    title: "Удобство по ролям",
    description: "Каждый видит только те действия и данные, которые действительно нужны ему в работе.",
  },
];

const useCases = [
  "Когда турнир ведут сразу несколько людей и важно не терять контекст.",
  "Когда командам нужен понятный ответ, что с заявкой, расписанием и итогами матчей.",
  "Когда судье важно быстро передать результат без лишних сообщений и пересылок.",
  "Когда организатору нужен единый процесс вместо таблиц, чатов и ручного контроля.",
];

export default function HomePage() {
  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <span className="pill hero-pill">Football Tournament System</span>
            <h1>Проводите турнир спокойно, когда каждому участнику понятно, что делать дальше.</h1>
            <p>
              Платформа помогает организатору держать процесс под контролем, судьям быстрее
              передавать результаты, а командам без лишних звонков видеть актуальный статус и
              ориентироваться в ходе турнира.
            </p>
            <HeroActions />
          </div>

          <div className="hero-side">
            <div className="stat-card">
              <span>Меньше ручной работы</span>
              <strong>Один рабочий контур вместо таблиц и чатов</strong>
              <span>Ключевые действия и статусы собраны в одной системе и не теряются по дороге.</span>
            </div>
            <div className="stat-card">
              <span>Прозрачность для участников</span>
              <strong>Каждый видит актуальную картину турнира</strong>
              <span>Это снижает количество уточнений и помогает быстрее принимать решения.</span>
            </div>
            <div className="stat-card">
              <span>Больше доверия к процессу</span>
              <strong>Результаты и решения фиксируются в системе</strong>
              <span>Проще объяснить, что уже сделано, что подтверждено и что будет происходить дальше.</span>
            </div>
          </div>
        </section>

        <section className="hero-band">
          {audienceValueCards.map((card) => (
            <div className="hero-band-card" key={card.eyebrow}>
              <span>{card.eyebrow}</span>
              <strong>{card.title}</strong>
            </div>
          ))}
        </section>

        <section className="grid grid-2">
          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что получает пользователь</h2>
              <p className="section-subtitle">
                Не набор разрозненных экранов, а понятный рабочий процесс для каждой роли.
              </p>
            </div>
            <ul className="list">
              {userBenefits.map((benefit) => (
                <li className="list-item" key={benefit.title}>
                  <div>
                    <strong>{benefit.title}</strong>
                    {benefit.description}
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Когда это особенно полезно</h2>
              <p className="section-subtitle">
                Сервис лучше всего раскрывается там, где важны согласованность, скорость и понятные
                роли участников.
              </p>
            </div>
            <ul className="list">
              {useCases.map((item) => (
                <li className="list-item" key={item}>
                  <div>{item}</div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </LayoutShell>
  );
}
