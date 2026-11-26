"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Service } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  services: Service[];
}

function ServiceGlyph({ index }: { index: number }) {
  const kind = index % 4;
  if (kind === 0) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-arch__svg">
        <rect x="2" y="7" width="20" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 7V5h3v2M15 7V5h3v2M7.5 13.5h3M9 12v3M14 13.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 1) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-arch__svg">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 2) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="service-arch__svg">
        <path d="M4 8.5C4 6 6.2 4 9 4h3v16H9c-2.8 0-5-2-5-4.5v-7Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M15 7h5M15 12h6M15 17h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="service-arch__svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 12h2.5l1.8-3.5 2.4 7 1.8-3.5H17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        },
      );

      const rows = gsap.utils.toArray<HTMLElement>("[data-srv-row]");
      rows.forEach((row) => {
        const line = row.querySelector("[data-srv-line]");
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: row,
                start: "top 86%",
              },
            },
          );
        }

        gsap.fromTo(
          row.querySelectorAll("[data-srv-col]"),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 86%",
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const openInSimulator = (idx: number) => {
    window.dispatchEvent(new CustomEvent("iri:select-subsystem", { detail: { index: idx % 4 } }));
    document.getElementById("simulasyon")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hizmetler"
      ref={sectionRef}
      aria-labelledby="hizmetler-baslik"
      className="section services-arch"
    >
      <div className="section__inner">
        <div className="services-arch__header" data-srv-head>
          <div>
            <span aria-hidden="true" className="section-rule" />
            <h2 id="hizmetler-baslik" className="section-title">
              Hizmetler
            </h2>
          </div>
          <p className="section-intro">
            Aracın verdiği belirtiden başlıyoruz. Her kalemde sürücünün fark ettiği sorun ve
            atölyede yapılan ölçüm/onarım birlikte açıkça yazılı.
          </p>
        </div>

        <ul className="services-arch__list">
          {services.map((service, idx) => (
            <li key={service.id} data-srv-row className="service-arch">
              <span aria-hidden="true" data-srv-line className="service-arch__hairline" />

              <div className="service-arch__grid">
                {/* Column 1: Index + Title + Icon */}
                <div data-srv-col className="service-arch__lead">
                  <div className="service-arch__meta">
                    <span className="service-arch__num tabular">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="service-arch__glyph">
                      <ServiceGlyph index={idx} />
                    </span>
                  </div>
                  <h3 className="service-arch__title">{service.title}</h3>
                  <button
                    type="button"
                    onClick={() => openInSimulator(idx)}
                    data-cursor="SİMÜLE ET"
                    className="service-arch__sim-btn"
                  >
                    <span>Sinyal simülatöründe gör</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>

                {/* Column 2: Driver Symptom */}
                <div data-srv-col className="service-arch__panel service-arch__panel--symptom">
                  <div className="service-arch__panel-head">
                    <span aria-hidden="true" className="service-arch__dot service-arch__dot--copper" />
                    <p className="service-arch__label">Belirti</p>
                  </div>
                  <p className="service-arch__text">{service.symptom}</p>
                </div>

                {/* Column 3: Workshop Action */}
                <div data-srv-col className="service-arch__panel service-arch__panel--work">
                  <div className="service-arch__panel-head">
                    <span aria-hidden="true" className="service-arch__dot service-arch__dot--cobalt" />
                    <p className="service-arch__label">Yapılan iş</p>
                  </div>
                  <p className="service-arch__text">{service.service}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
