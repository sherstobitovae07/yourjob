"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyEmail, login, getAuthErrorMessage } from "../../../services/authService";
import { studentProfileService } from "../../../services/studentProfileService";
import "@/styles/components/pages/auth/authPage.css";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pending = localStorage.getItem('pending_verification_email') || '';
    setEmail(pending);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(email, code);
      // after verification, try to login automatically using provided password
      const user = await login({ email, password });
      // if there is a pending resume saved during registration, upload it now (upload requires auth)
      const pendingData = sessionStorage.getItem('pending_resume_data');
      const pendingName = sessionStorage.getItem('pending_resume_name');
      if (user && pendingData && pendingName) {
        try {
          const resp = await fetch(pendingData);
          const blob = await resp.blob();
          const file = new File([blob], pendingName, { type: blob.type });
          await studentProfileService.uploadResume(file);
        } catch (uploadErr) {
          console.error('Resume upload failed after verification/login:', uploadErr);
        } finally {
          sessionStorage.removeItem('pending_resume_data');
          sessionStorage.removeItem('pending_resume_name');
        }
      }
      if (user) {
        const dashboardRole = user.role ?? localStorage.getItem("user_role");
        const dashboardPath =
          dashboardRole === "STUDENT"
            ? "/dashboard/student"
            : dashboardRole === "EMPLOYER"
            ? "/dashboard/employer"
            : dashboardRole === "ADMIN"
            ? "/dashboard/admin"
            : "/auth";
        localStorage.removeItem('pending_verification_email');
        router.push(dashboardPath);
        router.refresh();
      } else {
        setError('Верификация прошла, но автоматический вход не удался. Войдите вручную.');
      }
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
            <h1>Подтверждение Email</h1>
            <p>Введите код, отправленный на вашу почту.</p>
          </aside>
          <div className="auth-card-side auth-card-side--right">
            <h1 className="auth-title">Подтвердить Email</h1>
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="full-width">
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="full-width">
                <label className="auth-label" htmlFor="code">Код подтверждения</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  className="auth-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите 6-значный код"
                  required
                  maxLength={6}
                />
              </div>
              <div className="full-width">
                <label className="auth-label" htmlFor="password">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль для входа"
                  required
                />
              </div>
              <button type="submit" className="auth-button full-width" disabled={loading}>
                {loading ? 'Проверка…' : 'Подтвердить'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
