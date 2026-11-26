"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function PrecisionCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = cursorRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xDot = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(".admin-shell")) {
        gsap.to([dot, ring], { opacity: 0, duration: 0.15 });
        visible = false;
        return;
      }
      const customCursor = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, input[type='range'], summary");

      if (customCursor) {
        const text = customCursor.dataset.cursor ?? "";
        setLabel(text);
        ring.dataset.active = "label";
      } else if (interactive) {
        setLabel("");
        ring.dataset.active = "hover";
      } else {
        setLabel("");
        delete ring.dataset.active;
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="precision-cursor-layer">
      <div ref={ringRef} className="precision-cursor__ring">
        {label && <span className="precision-cursor__tag">{label}</span>}
      </div>
      <div ref={cursorRef} className="precision-cursor__dot" />
    </div>
  );
}
