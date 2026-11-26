"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "./gsap-lazy";

interface Props {
  children: ReactNode;
  className?: string;
  /** "wipe" film-gate kırpma, "fade" sade opaklık. */
  variant?: "wipe" | "fade";
  /** Gecikme (saniye). */
  delay?: number;
}

/**
 * Kaydırmayla tetiklenen film-gate açılışı.
 *
 * - Hareket azaltılmışsa hiçbir şey gizlenmez, içerik doğrudan görünür.
 * - JS çalışmazsa içerik yine görünür (gizleme yalnızca animasyon anında olur).
 */
export default function Reveal({ children, className, variant = "wipe", delay = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { gsap } = await loadGsap();
      if (cancelled) return;

      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);
      if (targets.length === 0) return;

      const ctx = gsap.context(() => {
        targets.forEach((target, index) => {
          if (variant === "wipe") {
            gsap.fromTo(
              target,
              { clipPath: "inset(0% 100% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.42,
                delay: delay + index * 0.06,
                ease: "power2.out",
                scrollTrigger: { trigger: target, start: "top 88%" },
              },
            );
          } else {
            gsap.fromTo(
              target,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.32,
                delay: delay + index * 0.05,
                ease: "none",
                scrollTrigger: { trigger: target, start: "top 90%" },
              },
            );
          }
        });
      }, el);

      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [variant, delay]);

  return (
    <div ref={wrapRef} className={className}>
      {children}
    </div>
  );
}
