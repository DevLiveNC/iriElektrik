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
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__inner">
          <Link href="/admin" className="brand">
            <span aria-hidden="true" className="brand__mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 2 5 13h5l-2 9 9-12h-5l1.5-8Z" />
              </svg>
            </span>
            <span>Yönetim</span>
          </Link>
          <nav aria-label="Yönetim gezinme" className="admin-nav">
            <Link href="/admin">Yapılan işler</Link>
            <Link href="/admin/ayarlar">İşletme ayarları</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
