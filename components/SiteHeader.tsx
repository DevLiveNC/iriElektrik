"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  name: string;
  phoneHref: string;
  phoneLabel: string;
  showPhone: boolean;
  hasServices: boolean;
}

export default function SiteHeader({ name, phoneHref, phoneLabel, showPhone, hasServices }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items = [
    ...(hasServices ? [{ href: "/#hizmetler", label: "Hizmetler" }] : []),
    { href: "/yapilan-isler", label: "Yapılan işler" },
    { href: "/#konum", label: "Konum" },
  ];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header on-dark">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span aria-hidden="true" className="brand__mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 2 5 13h5l-2 9 9-12h-5l1.5-8Z" />
            </svg>
          </span>
          <span translate="no">{name}</span>
        </Link>

        <nav aria-label="Ana gezinme" className="site-nav">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
          {showPhone && (
            <a
              href={phoneHref}
              className="site-nav__cta"
              data-event="ara"
              aria-label={`Hemen ara — ${phoneLabel}`}
            >
              Hemen ara
            </a>
          )}
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobil-menu"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Kapat" : "Menü"}
        </button>
      </div>

      {open && (
        <nav id="mobil-menu" aria-label="Mobil gezinme" className="mobile-nav">
          <ul className="mobile-nav__list">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mobile-nav__link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {showPhone && (
              <li>
                <a
                  href={phoneHref}
                  data-event="ara"
                  className="button button--primary mobile-nav__cta"
                  onClick={() => setOpen(false)}
                  aria-label={`Hemen ara — ${phoneLabel}`}
                >
                  Hemen ara
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
