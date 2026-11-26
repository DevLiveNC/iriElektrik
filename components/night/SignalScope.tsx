"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Web Audio modülü yalnızca bölüm görünür alana yaklaştığında yüklenir.
 * İlk JS yükünde Web Audio bulunmaz.
 */
const SignalScopeEngine = dynamic(() => import("./SignalScopeEngine"), {
  ssr: false,
  loading: () => (
    <div className="scope">
      <div className="scope__canvas-wrap" style={{ aspectRatio: "16 / 9" }} />
      <p className="scope__caption">Örnek sinyal, ürün sesi değildir.</p>
    </div>
  ),
});

export default function SignalScope() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "260px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef}>
      {ready ? (
        <SignalScopeEngine />
      ) : (
        <div className="scope">
          <div className="scope__canvas-wrap" style={{ aspectRatio: "16 / 9" }} />
          <p className="scope__caption">Örnek sinyal, ürün sesi değildir.</p>
        </div>
      )}
    </div>
  );
}
