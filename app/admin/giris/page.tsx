"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!response.ok) {
      if (response.status === 503) setNotConfigured(true);
      setError(data?.error ?? "Giriş başarısız. Tekrar deneyin.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="login-shell">
      <h1 className="login-title">Yönetici girişi</h1>
      <p className="login-intro">Kayıt ekranı yoktur; tek yönetici girişi kullanılır.</p>

      {notConfigured && (
        <div className="login-notice">
          <p className="field-label">Giriş henüz yapılandırılmadı.</p>
          <p>
            README’deki ilk kurulum adımlarını izleyip ADMIN_EMAIL, ADMIN_PASSWORD_HASH ve
            AUTH_SECRET ortam değişkenlerini tanımlayın.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="admin-form">
        <div className="field">
          <label htmlFor="email" className="field-label">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            spellCheck={false}
            required
            className="field-input"
          />
        </div>
        <div className="field">
          <label htmlFor="password" className="field-label">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="field-input"
          />
        </div>
        {error && (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="polite"
            className="form-error"
          >
            {error}
          </p>
        )}
        <div className="admin-form__actions">
          <button
            type="submit"
            disabled={pending}
            className="button button--primary"
          >
            {pending ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </div>
      </form>
    </div>
  );
}
