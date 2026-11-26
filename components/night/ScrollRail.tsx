"use client";

import { useEffect, useState } from "react";

export interface ScrollMark {
  id: string;
  label: string;
}

interface Props {
  marks: ScrollMark[];
}

/**
 * Sol kenardaki bakır işaretli bölüm rayı.
 * Küçük ekranlarda gizlenir; hareket azaltılmışsa yalnızca statik konum gösterir.
 */
export default function ScrollRail({ marks }: Props) {
  const [active, setActive] = useState(marks[0]?.id ?? "");

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.38;
      let current = marks[0]?.id ?? "";
      for (const mark of marks) {
        const element = document.getElementById(mark.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= line) current = mark.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [marks]);

  return (
    <nav aria-label="Bölüm göstergesi" className="scroll-rail">
      {marks.map((mark) => (
        <span
          key={mark.id}
          className={
            mark.id === active ? "scroll-rail__item scroll-rail__item--active" : "scroll-rail__item"
          }
        >
          <span className="scroll-rail__tick" aria-hidden="true" />
          <span>{mark.label}</span>
        </span>
      ))}
    </nav>
  );
}
