"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Service } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  services: Service[];
}

function ServiceIcon({ index }: { index: number }) {
  const kind = index % 4;
  if (kind === 0) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-card__icon">
        <rect x="2.5" y="7" width="19" height="12.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.5 7V5h3v2M14.5 7V5h3v2M7.5 13.2h3M9 11.7v3M14 13.2h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 1) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-card__icon">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 2) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-card__icon">
        <path d="M4.5 9C4.5 6.5 6.5 4.5 9 4.5h3v15H9c-2.5 0-4.5-2-4.5-4.5V9Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 7.5h4.5M15 12h5.5M15 16.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="service-card__icon">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 12h2.2l1.7-3.2 2.2 6.4 1.7-3.2h1.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicesMatrix({ services }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-srv-head]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 84%",
          },
        },
      );

      gsap.fromTo(
        "[data-srv-card]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hizmetler"
      ref={sectionRef}
      aria-labelledby="hizmetler-baslik"
      className="section section--white"
    >
      <div className="section__inner">
        <div className="section-head" data-srv-head>
          <div className="eyebrow">
            <span aria-hidden="true" className="eyebrow__dot" />
            <span>Hizmetlerimiz</span>
          </div>
          <h2 id="hizmetler-baslik" className="section-title">
            Aracın verdiği belirtiden çözüme
          </h2>
          <p className="section-intro">
            Sürücünün yolda veya sabah ilk çalıştırmada karşılaştığı sorunları ve atölyede
            yaptığımız kontrolleri net başlıklarla listeliyoruz.
          </p>
        </div>

        <ul className="services-grid">
          {services.map((service, idx) => (
            <li key={service.id} data-srv-card className="service-card">
              <div className="service-card__top">
                <span className="service-card__index tabular">
                  0{idx + 1}
                </span>
                <span className="service-card__icon-wrap">
                  <ServiceIcon index={idx} />
                </span>
              </div>

              <h3 className="service-card__title">{service.title}</h3>

              <div className="service-card__rows">
                <div className="service-card__row">
                  <span className="service-card__label">Belirti</span>
                  <p className="service-card__text">{service.symptom}</p>
                </div>
                <div className="service-card__row">
                  <span className="service-card__label service-card__label--red">Yapılan iş</span>
                  <p className="service-card__text">{service.service}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
