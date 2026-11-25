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
      className="admin-action"
    >
      {pending ? "Çıkılıyor…" : "Çıkış"}
    </button>
  );
}
