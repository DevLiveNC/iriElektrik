"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
}

export default function ScrollRevealSection({ children, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-gsap-item]");
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 84%",
            },
          },
        );
      }

      const masks = el.querySelectorAll("[data-gsap-mask]");
      masks.forEach((mask) => {
        gsap.fromTo(
          mask,
          { clipPath: "inset(10% 0% 10% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.0,
            ease: "expo.out",
            clearProps: "clipPath",
            scrollTrigger: {
              trigger: mask,
              start: "top 85%",
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      {children}
    </div>
  );
}
