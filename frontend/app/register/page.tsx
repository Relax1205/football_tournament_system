"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutShell } from "@/components/layout-shell";
import { registerUser } from "@/components/mock-api";

type RegisterForm = {
  acceptedPrivacy: boolean;
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
};

const initialForm: RegisterForm = {
  acceptedPrivacy: false,
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Введите имя минимум из 2 символов";
    }

    if (!form.email.includes("@")) {
      nextErrors.email = "Введите корректный email";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!form.acceptedPrivacy) {
      nextErrors.acceptedPrivacy =
        "Для регистрации нужно принять политику конфиденциальности";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.acceptedPrivacy,
      );

      router.push(
        `/login?registered=1&email=${encodeURIComponent(form.email.trim().toLowerCase())}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось завершить регистрацию",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <LayoutShell>
      <main className="page-layout">
        <section className="grid grid-2">
          <article className="card">
            <div className="page-head">
              <h1 className="page-title">Регистрация</h1>
              <p className="login-helper-copy">
                Новый пользователь всегда создаётся как зритель. Если позже понадобится роль
                организатора, судьи или тренера, администратор назначит её в своей панели.
              </p>
            </div>

            <form className="form-grid" noValidate onSubmit={handleSubmit}>
              <div className="field field-wide">
                <label htmlFor="register-name">Имя</label>
                <input
                  id="register-name"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  value={form.name}
                />
                <span className={`field-error${errors.name ? "" : " is-empty"}`}>
                  {errors.name || "\u00a0"}
                </span>
              </div>
              <div className="field field-wide">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  type="email"
                  value={form.email}
                />
                <span className={`field-error${errors.email ? "" : " is-empty"}`}>
                  {errors.email || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="register-password">Пароль</label>
                <input
                  id="register-password"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  type="password"
                  value={form.password}
                />
                <span className={`field-error${errors.password ? "" : " is-empty"}`}>
                  {errors.password || "\u00a0"}
                </span>
              </div>
              <div className="field">
                <label htmlFor="register-confirm-password">Повторите пароль</label>
                <input
                  id="register-confirm-password"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  type="password"
                  value={form.confirmPassword}
                />
                <span className={`field-error${errors.confirmPassword ? "" : " is-empty"}`}>
                  {errors.confirmPassword || "\u00a0"}
                </span>
              </div>
              <div className="field field-wide checkbox-field">
                <div className="checkbox-row">
                  <input
                    checked={form.acceptedPrivacy}
                    className="checkbox-control"
                    id="register-consent"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        acceptedPrivacy: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <label className="checkbox-copy" htmlFor="register-consent">
                    Я принимаю{" "}
                    <Link className="inline-link" href="/privacy">
                      политику конфиденциальности
                    </Link>{" "}
                    и согласен на обработку данных в рамках работы системы.
                  </label>
                </div>
                <span className={`field-error${errors.acceptedPrivacy ? "" : " is-empty"}`}>
                  {errors.acceptedPrivacy || "\u00a0"}
                </span>
              </div>
              <div className="field field-wide form-feedback-slot">
                {submitError ? (
                  <div className="message-error">{submitError}</div>
                ) : (
                  <div aria-hidden="true" className="message-placeholder" />
                )}
              </div>
              <div className="field field-wide">
                <button
                  className="button button-primary"
                  disabled={isSubmitting}
                  id="register-submit"
                  type="submit"
                >
                  {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
                </button>
              </div>
            </form>

            <div className="auth-page-footer">
              <span className="table-muted">Уже есть аккаунт?</span>
              <Link className="button button-secondary" href="/login">
                Перейти ко входу
              </Link>
            </div>
          </article>

          <article className="card">
            <div className="section-head">
              <h2 className="section-title">Что будет после регистрации</h2>
              <p className="login-helper-copy">
                Сразу после создания аккаунта вы получите роль зрителя и увидите приветственное
                уведомление в колокольчике.
              </p>
            </div>
            <ul className="list">
              <li className="list-item">
                <div>
                  <strong>Роль по умолчанию</strong>
                  Зритель может просматривать турниры, матчи, таблицу и команды без риска что-то
                  изменить.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Права расширяются администратором</strong>
                  Если аккаунту нужен доступ тренера, судьи или организатора, это делается из
                  панели ролей.
                </div>
              </li>
              <li className="list-item">
                <div>
                  <strong>Уведомления приходят сразу</strong>
                  В системе появится сообщение о регистрации, а администратор увидит новый запрос в
                  своём списке уведомлений.
                </div>
              </li>
            </ul>
          </article>
        </section>
      </main>
    </LayoutShell>
  );
}
