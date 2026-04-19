"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LayoutShell } from "@/components/layout-shell";
import { demoUsers, roleLabels } from "@/components/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("org@tournament.ru");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefilledEmail = params.get("email");
    setRegistered(params.get("registered") === "1");

    if (prefilledEmail) {
      setEmail(prefilledEmail);
      setPassword("");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await login(email, password);

    if (!result.ok) {
      setError(result.message ?? "Ошибка аутентификации");
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
              <p className="login-helper-copy">
                Авторизуйтесь, чтобы работать с турнирами, матчами, заявками и уведомлениями.
              </p>
            </div>

            {registered ? (
              <div className="message-success login-page-message">
                Аккаунт создан. После входа вы попадёте в систему как зритель, а администратор при
                необходимости выдаст расширенные права.
              </div>
            ) : null}

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
              <div className="field field-wide form-feedback-slot">
                {error ? (
                  <div className="message-error">{error}</div>
                ) : (
                  <div aria-hidden="true" className="message-placeholder" />
                )}
              </div>
              <div className="field field-wide">
                <button className="button button-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Проверяем..." : "Войти"}
                </button>
              </div>
            </form>

            <div className="auth-page-footer">
              <span className="table-muted">Нужен новый аккаунт?</span>
              <Link className="button button-secondary" href="/register">
                Открыть регистрацию
              </Link>
            </div>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Демо-аккаунты</h2>
              <p className="login-helper-copy">
                Можно быстро зайти под разными ролями и проверить поведение интерфейса.
              </p>
            </div>
            <ul className="list">
              {demoUsers.map((user) => (
                <li className="list-item" key={user.id}>
                  <div>
                    <strong>{roleLabels[user.role]}</strong>
                    <br />
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
