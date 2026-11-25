"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/giris");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="rounded-full border-2 border-petrol/25 px-4 py-2 font-semibold text-petrol transition-colors hover:border-petrol disabled:opacity-50"
    >
      {pending ? "Çıkılıyor…" : "Çıkış"}
    </button>
  );
}
