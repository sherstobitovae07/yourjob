"use client";

import { FormEvent } from "react";
import "@/styles/components/pages/auth/authPage.css";

export default function AuthPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">Авторизация</h1>
        <p className="auth-subtitle">Войдите в аккаунт, чтобы продолжить</p>


        <form className="auth-form" onSubmit={handleSubmit}>
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
          />

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
          />

          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>
      </section>
    </main>
  );
}
