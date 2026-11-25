"use client";

import { useEffect, useState } from "react";

interface Props {
  phoneHref: string;
  mapsUrl: string;
  showPhone: boolean;
  showMaps: boolean;
}

/**
 * Mobil alt CTA çubuğu. Klavye açıkken (odak input/textarea/select'te)
 * ve sayfa sonunda gizlenir; safe-area içinde kalır, içeriği kapatmaz.
 */
export default function MobileCtaBar({ phoneHref, mapsUrl, showPhone, showMaps }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) {
        setHidden(true);
      }
    };
    const onFocusOut = () => setHidden(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (!showPhone && !showMaps) return null;
  if (hidden) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-petrol/15 bg-paper/97 px-4 pb-3 pt-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3">
        {showPhone ? (
          <a
            href={phoneHref}
            data-event="ara"
            className="rounded-full bg-lime px-4 py-3.5 text-center font-bold text-petrol transition-colors hover:bg-lime-deep"
          >
            Ara
          </a>
        ) : (
          <span className="rounded-full bg-paper-2 px-4 py-3.5 text-center font-bold text-petrol/50">
            Ara
          </span>
        )}
        {showMaps ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            data-event="yol_tarifi"
            className="rounded-full border-2 border-petrol px-4 py-3.5 text-center font-bold text-petrol transition-colors hover:bg-petrol hover:text-paper"
          >
            Yol tarifi
          </a>
        ) : (
          <span className="rounded-full border-2 border-petrol/20 px-4 py-3.5 text-center font-bold text-petrol/50">
            Yol tarifi
          </span>
        )}
      </div>
    </div>
  );
}
