"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROTOCOL_STEPS = [
  {
    code: "ADIM 01",
    title: "Belirtiyi dinleme",
    detail:
      "Arızanın ne zaman, hangi hava veya sürüş koşulunda ortaya çıktığını sürücüden dinleyip ilk kontrol sırasını kuruyoruz.",
  },
  {
    code: "ADIM 02",
    title: "Ölçümle nokta tespit",
    detail:
      "Deneme-yanılma parça değişimi yerine multimetre, yük testi ve arıza tespit cihazıyla sorunun gerçek kaynağını ölçüyoruz.",
  },
  {
    code: "ADIM 03",
    title: "Temiz onarım ve açıklama",
    detail:
      "Yapılacak işlemi sade bir dille paylaşıyor; soket, tesisat, marş veya şarj onarımını fabrika hat düzenine sadık uyguluyoruz.",
  },
  {
    code: "ADIM 04",
    title: "Yük altında doğrulama",
    detail:
      "Teslimden önce farlar, klima ve marş yükü altında şarj/gerilim değerlerini tekrar ölçüp kararlılığı doğruluyoruz.",
  },
] as const;

export default function ProtocolTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    const line = progressLineRef.current;
    if (!el || !line) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 72%",
            end: "bottom 55%",
            scrub: 0.4,
          },
        },
      );

      gsap.fromTo(
        "[data-proto-card]",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
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
      ref={sectionRef}
      aria-labelledby="protokol-baslik"
      className="section protocol-stage"
    >
      <div className="section__inner">
        <div className="section-head">
          <span aria-hidden="true" className="section-rule" />
          <h2 id="protokol-baslik" className="section-title">
            Dört adımda ölçüm ve onarım disiplini
          </h2>
          <p className="section-intro">
            Her araçta aynı net sırayı izliyoruz: belirti, ölçümle teşhis, temiz uygulama ve
            teslim öncesi yük kontrolü.
          </p>
        </div>

        <div className="protocol-track-wrap" aria-hidden="true">
          <svg viewBox="0 0 1000 16" preserveAspectRatio="none" className="protocol-svg">
            <line
              x1="0"
              y1="8"
              x2="1000"
              y2="8"
              stroke="rgba(21, 29, 46, 0.14)"
              strokeWidth="3"
            />
            <line
              ref={progressLineRef}
              x1="0"
              y1="8"
              x2="1000"
              y2="8"
              stroke="url(#protoGrad)"
              strokeWidth="4"
              strokeDasharray="1000"
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="protoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b86b45" />
                <stop offset="55%" stopColor="#2452cc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <ol className="protocol-grid">
          {PROTOCOL_STEPS.map((step, index) => (
            <li key={step.code} data-proto-card className="protocol-card">
              <div className="protocol-card__top">
                <span className="protocol-card__code tabular">{step.code}</span>
                <span aria-hidden="true" className="protocol-card__node">
                  0{index + 1}
                </span>
              </div>
              <h3 className="protocol-card__title">{step.title}</h3>
              <p className="protocol-card__detail">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
