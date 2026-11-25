"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      if (res.status === 503) setNotConfigured(true);
      setError(data?.error ?? "Giriş başarısız. Tekrar deneyin.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="font-display text-5xl font-bold text-petrol">Yönetici girişi</h1>
      <p className="mt-2 text-graphite/80">Kayıt ekranı yoktur; tek yönetici girişi kullanılır.</p>

      {notConfigured && (
        <div className="mt-6 rounded-xl border border-petrol/20 bg-paper-2 px-5 py-4 text-sm leading-relaxed">
          <p className="font-bold text-petrol">Giriş henüz yapılandırılmadı.</p>
          <p className="mt-1">
            README’deki “Güvenli ilk yönetici kurulumu” adımlarını izleyip ortam değişkenlerini tanımlayın:
            ADMIN_EMAIL, ADMIN_PASSWORD_HASH (veya yerel geliştirme için ADMIN_PASSWORD) ve AUTH_SECRET.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate={false}>
        <div>
          <label htmlFor="email" className="mb-1 block font-semibold text-petrol">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            spellCheck={false}
            required
            className="w-full rounded-lg border border-petrol/30 bg-white px-4 py-3 text-graphite"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block font-semibold text-petrol">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-petrol/30 bg-white px-4 py-3 text-graphite"
          />
        </div>
        {error && (
          <p role="alert" aria-live="polite" className="rounded-lg border border-red-700/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-lime px-6 py-3.5 font-bold text-petrol transition-colors hover:bg-lime-deep disabled:opacity-60"
        >
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}
