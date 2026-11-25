"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  name: string;
  phoneHref: string;
  phoneLabel: string;
  showPhone: boolean;
}

const NAV = [
  { href: "/#hizmetler", label: "Hizmetler" },
  { href: "/yapilan-isler", label: "Yapılan işler" },
  { href: "/#konum", label: "Konum" },
];

export default function SiteHeader({ name, phoneHref, phoneLabel, showPhone }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-petrol/15 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-petrol">
          <span aria-hidden="true" className="inline-block h-8 w-8 rounded-md bg-petrol p-1">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="#D9F34A" aria-hidden="true">
              <path d="M13 2 5 13h5l-2 9 9-12h-5l1-8z" />
            </svg>
          </span>
          <span translate="no">{name}</span>
        </Link>

        <nav aria-label="Ana gezinme" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-petrol transition-colors hover:text-petrol-2 hover:underline hover:underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
          {showPhone && (
            <a
              href={phoneHref}
              className="rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-petrol transition-colors hover:bg-lime-deep"
            >
              Hemen ara
            </a>
          )}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobil-menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-petrol/25 px-4 py-2 text-sm font-bold text-petrol md:hidden"
        >
          {open ? "Kapat" : "Menü"}
        </button>
      </div>

      {open && (
        <nav id="mobil-menu" aria-label="Mobil gezinme" className="border-t border-petrol/15 bg-paper px-4 py-4 md:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-display text-2xl font-semibold text-petrol hover:bg-paper-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {showPhone && (
              <li>
                <a
                  href={phoneHref}
                  onClick={() => setOpen(false)}
                  className="mt-2 block rounded-full bg-lime px-5 py-3 text-center font-bold text-petrol"
                >
                  Hemen ara — {phoneLabel}
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
