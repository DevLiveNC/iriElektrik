"use client";

import { useEffect, useRef, useState } from "react";
import { WORKFLOW_STEPS } from "@/data/landing-content";
import { loadGsap } from "./gsap-lazy";

interface Props {
  heading: string;
  eyebrow: string;
  intro: string;
}

/**
 * "Nasıl çalışıyoruz?" — metal ray dili.
 * GSAP yalnızca bölüm görünür olduğunda yüklenir.
 */
export default function WorkflowSection({ heading, eyebrow, intro }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = fillRef.current;
    if (!section || !fill) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { gsap } = await loadGsap();
      if (cancelled) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-flow-intro]",
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 84%" },
          },
        );

        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-flow-list]",
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.3,
              onUpdate: (self) => {
                const index = Math.min(
                  WORKFLOW_STEPS.length - 1,
                  Math.floor(self.progress * WORKFLOW_STEPS.length),
                );
                setActiveStep(index);
              },
            },
          },
        );

        const cards = gsap.utils.toArray<HTMLElement>("[data-flow-card]");
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, x: -14 },
            {
              opacity: 1,
              x: 0,
              duration: 0.34,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top 88%" },
            },
          );
        });
      }, section);

      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="is-akisi"
      ref={sectionRef}
      aria-labelledby="is-akisi-baslik"
      className="section section--paper"
    >
      <div className="section__inner flow__grid">
        <div className="flow__aside" data-flow-intro>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="is-akisi-baslik" className="section-title">
            {heading}
          </h2>
          <p className="section-intro">{intro}</p>
          <p className="flow__badge">
            <i aria-hidden="true" />
            <span>
              Adım 0{activeStep + 1} / 0{WORKFLOW_STEPS.length} — {WORKFLOW_STEPS[activeStep].tag}
            </span>
          </p>
        </div>

        <div className="flow__timeline" data-flow-list>
          <div aria-hidden="true" className="flow__rail">
            <div ref={fillRef} className="flow__rail-fill" />
          </div>

          <ol className="flow__list">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCurrent = index === activeStep;
              return (
                <li
                  key={step.num}
                  data-flow-card
                  className={
                    index === activeStep ? "flow-card flow-card--active" : "flow-card"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      isCurrent
                        ? "flow-card__marker flow-card__marker--lit"
                        : "flow-card__marker"
                    }
                  />
                  <div className="flow-card__head">
                    <span className="flow-card__num">{step.num}</span>
                    <span className="flow-card__tag">{step.tag}</span>
                  </div>
                  <h3 className="flow-card__title">{step.title}</h3>
                  <p className="flow-card__desc">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
