"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  name: string;
  phoneHref: string;
  phoneLabel: string;
  showPhone: boolean;
  whatsappHref: string;
  hasServices: boolean;
}

export default function SiteHeader({
  name,
  phoneHref,
  phoneLabel,
  showPhone,
  whatsappHref,
  hasServices,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const items = [
    ...(hasServices ? [{ href: "/#hizmetler", label: "Hizmetler" }] : []),
    { href: "/#is-akisi", label: "Nasıl çalışıyoruz" },
    { href: "/yapilan-isler", label: "Yapılan işler" },
    { href: "/#konum", label: "İletişim" },
  ];

  useEffect(() => {
    const onScroll = () => {
      const fill = progressRef.current;
      if (!fill) return;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      fill.style.transform = `scaleX(${ratio})`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span aria-hidden="true" className="brand__mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 2 5 13h5l-2 9 9-12h-5l1.5-8Z" />
            </svg>
          </span>
          <span translate="no" className="brand__name">
            {name}
          </span>
        </Link>

        <nav aria-label="Ana gezinme" className="site-nav">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
          <div className="site-nav__actions">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-event="whatsapp"
                className="button button--primary button--small"
              >
                WhatsApp
              </a>
            ) : null}
            {showPhone ? (
              <a
                href={phoneHref}
                className="button button--metal button--small"
                data-event="ara"
                aria-label={`Hemen ara — ${phoneLabel}`}
              >
                Hemen ara
              </a>
            ) : null}
          </div>
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

      <div aria-hidden="true" className="site-header__progress">
        <div ref={progressRef} className="site-header__progress-fill" />
      </div>

      {open ? (
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
            {whatsappHref || showPhone ? (
              <li className="mobile-nav__actions">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    data-event="whatsapp"
                    className="button button--primary"
                    onClick={() => setOpen(false)}
                  >
                    WhatsApp
                  </a>
                ) : null}
                {showPhone ? (
                  <a
                    href={phoneHref}
                    data-event="ara"
                    className="button button--metal"
                    onClick={() => setOpen(false)}
                    aria-label={`Hemen ara — ${phoneLabel}`}
                  >
                    Hemen ara
                  </a>
                ) : null}
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
