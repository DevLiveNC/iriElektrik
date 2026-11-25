import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-petrol/15 bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-display text-2xl font-bold text-petrol">
            Yönetim
          </Link>
          <nav aria-label="Yönetim gezinme" className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/admin" className="rounded-full px-3 py-2 text-petrol hover:bg-paper-2">
              Yapılan işler
            </Link>
            <Link href="/admin/ayarlar" className="rounded-full px-3 py-2 text-petrol hover:bg-paper-2">
              İşletme ayarları
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
