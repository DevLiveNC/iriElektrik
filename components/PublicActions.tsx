"use client";

import { useEffect, useState } from "react";

interface Props {
  phoneHref: string;
  phoneLabel: string;
  whatsappHref: string;
  mapsUrl: string;
  showPhone: boolean;
  showMaps: boolean;
}

const EVENT_NAMES = new Set(["ara", "yol_tarifi", "whatsapp"]);

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select") || target.isContentEditable)
  );
}

/**
 * Tek istemci adası: tüm CTA tıklamalarını document üzerinde ölçer,
 * yalnızca doğrulanmış eylemler için mobil çubuğu render eder. Form alanına
 * veya görselleştirme kontrollerine odaklanıldığında çubuk kalkar; safe-area
 * ve alt boşluk CSS tarafından korunur.
 */
export default function PublicActions({
  phoneHref,
  phoneLabel,
  whatsappHref,
  mapsUrl,
  showPhone,
  showMaps,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const hasPrimary = showPhone || Boolean(whatsappHref);
  const hasActions = hasPrimary || showMaps;

  useEffect(() => {
    if (!hasActions) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[data-event]");
      const eventName = link?.dataset.event;
      if (!eventName || !EVENT_NAMES.has(eventName)) return;
      try {
        const payload = new Blob(
          [JSON.stringify({ event: eventName, at: new Date().toISOString() })],
          { type: "application/json" },
        );
        navigator.sendBeacon("/api/event", payload);
      } catch {
        /* Ölçüm başarısızlığı kullanıcı akışını etkilemez. */
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      const insideControl =
        target instanceof HTMLElement && target.closest("[data-mobile-cta-hide]") !== null;
      setHidden(isEditable(target) || insideControl);
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        const insideControl =
          active instanceof HTMLElement && active.closest("[data-mobile-cta-hide]") !== null;
        setHidden(isEditable(active) || insideControl);
      }, 0);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [hasActions]);

  useEffect(() => {
    if (hasActions && !hidden) {
      document.body.dataset.mobileCta = "true";
      return () => {
        delete document.body.dataset.mobileCta;
      };
    }
    delete document.body.dataset.mobileCta;
  }, [hasActions, hidden]);

  if (!hasActions || hidden) return null;

  return (
    <nav className="mobile-cta" aria-label="Hızlı iletişim">
      <div className="mobile-cta__inner">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp"
            className="button button--primary"
          >
            WhatsApp
          </a>
        ) : null}
        {showPhone ? (
          <a
            href={phoneHref}
            data-event="ara"
            className={whatsappHref ? "button button--metal" : "button button--primary"}
            aria-label={`Hemen ara — ${phoneLabel}`}
          >
            Hemen ara
          </a>
        ) : null}
        {!hasPrimary && showMaps ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            data-event="yol_tarifi"
            className="button button--metal"
          >
            Yol tarifi
          </a>
        ) : null}
      </div>
    </nav>
  );
}
