"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getAuthErrorMessage, login } from "@/services/authService";
import "@/styles/components/pages/auth/authPage.css";

export default function AuthPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    try {
      await login({ email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-split">
          <aside className="auth-card-side auth-card-side--left">
            <h1>Добро пожаловать</h1>
            <p>Войдите в аккаунт для доступа к возможностям платформы.</p>
          </aside>

          <div className="auth-card-side auth-card-side--right">
            <h1 className="auth-title">Авторизация</h1>
            <p className="auth-subtitle">Войдите в аккаунт, чтобы продолжить</p>

            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="full-width">
                <label className="auth-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="full-width">
                <label className="auth-label" htmlFor="password">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="auth-input"
                  placeholder="Введите пароль"
                  minLength={6}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="auth-button full-width" disabled={loading}>
                {loading ? "Вход…" : "Войти"}
              </button>
            </form>

            <p className="auth-switch">
              Нет аккаунта?{" "}
              <Link href="/auth/register" className="auth-switch-link">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
