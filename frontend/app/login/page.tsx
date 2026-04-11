"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutShell } from "@/components/layout-shell";
import { demoUsers, roleLabels } from "@/components/mock-data";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("organizer@tournament.ru");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await login(email, password);

    if (!result.ok) {
      setError(result.message ?? "Ошибка авторизации");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="grid grid-2">
          <article className="card">
            <div className="page-head">
              <h1 className="page-title">Вход в систему</h1>
              <p className="page-subtitle">
                Демо-вход для защиты экранов и переключения ролей без backend.
              </p>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field field-wide">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </div>
              <div className="field field-wide">
                <label htmlFor="password">Пароль</label>
                <input
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </div>
              {error ? (
                <div className="field field-wide">
                  <div className="message-error">{error}</div>
                </div>
              ) : null}
              <div className="field field-wide">
                <button className="button button-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Проверяем..." : "Войти"}
                </button>
              </div>
            </form>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Демо-аккаунты</h2>
              <p className="section-subtitle">
                Можно быстро заходить под разными ролями и проверять поведение
                интерфейса.
              </p>
            </div>
            <ul className="list">
              {demoUsers.map((user) => (
                <li className="list-item" key={user.id}>
                  <div>
                    <strong>{roleLabels[user.role]}</strong>
                    {user.email}
                    <br />
                    Пароль: {user.password}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </LayoutShell>
  );
}
