"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Props {
  name: string;
  phoneHref: string;
  phoneLabel: string;
  showPhone: boolean;
  hasServices: boolean;
}

export default function SiteHeader({
  name,
  phoneHref,
  phoneLabel,
  showPhone,
  hasServices,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const items = [
    ...(hasServices ? [{ href: "/#hizmetler", label: "Hizmetler" }] : []),
    { href: "/#is-akisi", label: "Nasıl çalışıyoruz" },
    { href: "/yapilan-isler", label: "Yapılan işler" },
    { href: "/#konum", label: "İletişim" },
  ];

  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current) return;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      progressRef.current.style.transform = `scaleX(${ratio})`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const navEl = mobileNavRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (navEl && !reduced) {
      gsap.fromTo(
        navEl,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
      );
      gsap.fromTo(
        navEl.querySelectorAll("[data-mnav-item]"),
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.26, stagger: 0.04, ease: "power2.out" },
      );
    }

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
          {showPhone && (
            <a
              href={phoneHref}
              className="button button--primary button--small site-nav__cta"
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

      <div aria-hidden="true" className="site-header__progress">
        <div ref={progressRef} className="site-header__progress-fill" />
      </div>

      {open && (
        <nav
          id="mobil-menu"
          ref={mobileNavRef}
          aria-label="Mobil gezinme"
          className="mobile-nav"
        >
          <ul className="mobile-nav__list">
            {items.map((item) => (
              <li key={item.href} data-mnav-item>
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
              <li data-mnav-item>
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
