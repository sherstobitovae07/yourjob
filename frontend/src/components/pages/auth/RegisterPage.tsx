"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { login, getAuthErrorMessage, registerEmployer, registerStudent } from "@/services/authService";
import type { EmployerRegisterRequest, StudentRegisterRequest, UserRole } from "@/types/auth";

import "@/styles/components/pages/auth/authRegisterPage.css";

const PASSWORD_MAX_LENGTH = 60; // bcrypt ограничивает 72 байт; лучше ограничить короче

function normalizeOptional(value: FormDataEntryValue): string | undefined {
  const s = String(value ?? "").trim();
  return s === "" ? undefined : s;
}

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const fd = new FormData(form);

    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const first_name = normalizeOptional(fd.get("first_name") ?? "");
    const last_name = normalizeOptional(fd.get("last_name") ?? "");

    try {
      setLoading(true);

      if (role === "STUDENT") {
        const payload: StudentRegisterRequest = {
          email,
          password,
          first_name,
          last_name,
          university: normalizeOptional(fd.get("university") ?? ""),
          faculty: normalizeOptional(fd.get("faculty") ?? ""),
          specialty: normalizeOptional(fd.get("specialty") ?? ""),
          resume_path: normalizeOptional(fd.get("resume_path") ?? ""),
        };

        await registerStudent(payload);
      } else {
        const payload: EmployerRegisterRequest = {
          email,
          password,
          first_name,
          last_name,
          company_name: normalizeOptional(fd.get("company_name") ?? ""),
          description: normalizeOptional(fd.get("description") ?? ""),
          website: normalizeOptional(fd.get("website") ?? ""),
        };

        await registerEmployer(payload);
      }

      // После регистрации сразу логинимся (чтобы пользователь попал в авторизованную зону).
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
            <p>Создайте аккаунт и подключайтесь к лучшим стажировкам.</p>
          </aside>

          <div className="auth-card-side auth-card-side--right">
            <h1 className="auth-title">Регистрация</h1>
            <p className="auth-subtitle">Создайте аккаунт, чтобы начать пользоваться сервисом</p>

            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="register-role">
          <button
            type="button"
            className={role === "STUDENT" ? "register-role-btn active" : "register-role-btn"}
            onClick={() => setRole("STUDENT")}
            disabled={loading}
          >
            Студент
          </button>
          <button
            type="button"
            className={role === "EMPLOYER" ? "register-role-btn active" : "register-role-btn"}
            onClick={() => setRole("EMPLOYER")}
            disabled={loading}
          >
            Работодатель
          </button>
        </div>

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
              placeholder="Придумайте пароль"
              minLength={6}
              maxLength={PASSWORD_MAX_LENGTH}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="first_name">
              Имя
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="auth-input"
              placeholder="Необязательно"
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="last_name">
              Фамилия
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="auth-input"
              placeholder="Необязательно"
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          {role === "STUDENT" ? (
            <>
              <div className="full-width">
                <label className="auth-label" htmlFor="university">
                  Университет
                </label>
                <input
                  id="university"
                  name="university"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="auth-label" htmlFor="faculty">
                  Факультет
                </label>
                <input
                  id="faculty"
                  name="faculty"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="auth-label" htmlFor="specialty">
                  Специальность
                </label>
                <input
                  id="specialty"
                  name="specialty"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>

              <div className="full-width">
                <label className="auth-label" htmlFor="resume_path">
                  Резюме 
                </label>
                <input
                  id="resume_path"
                  name="resume_path"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="auth-label" htmlFor="company_name">
                  Название компании
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="auth-label" htmlFor="description">
                  Описание
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>

              <div className="full-width">
                <label className="auth-label" htmlFor="website">
                  Сайт
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  className="auth-input"
                  placeholder="Необязательно"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" className="auth-button full-width" disabled={loading}>
            {loading ? "Создание..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{" "}
          <Link href="/auth" className="auth-switch-link">
            Войти
          </Link>
        </p>
      </div>
    </div>
  </section>
</main>
  );
}

