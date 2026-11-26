"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface WorkflowStep {
  num: string;
  tag: string;
  title: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    num: "01",
    tag: "İlk kontrol",
    title: "Şikâyeti dinleme ve ön inceleme",
    description:
      "Aracın sorunu sabah ilk marşta mı, yolda giderken mi yoksa aralıklı olarak mı yaptığını dinler; akü başları, sigortalar ve ana soketleri gözden geçiririz.",
  },
  {
    num: "02",
    tag: "Ölçüm & teşhis",
    title: "Ölçümle nokta arıza tespiti",
    description:
      "Deneme-yanılma ile sağlam parçayı değiştirmeyiz. Multimetre, yük testi ve arıza tespit cihazıyla sorunun gerçek kaynağını net olarak belirleriz.",
  },
  {
    num: "03",
    tag: "Onay & uygulama",
    title: "Açık bilgilendirme ve temiz işçilik",
    description:
      "Arızanın nedenini ve yapılacak işlemi anlaşılır biçimde paylaşırız. Onayının ardından tesisat düzenini bozmadan, sağlam bağlantı ve izolasyonla onarımı yaparız.",
  },
  {
    num: "04",
    tag: "Son kontrol",
    title: "Yük altında test ve teslim",
    description:
      "Teslimden önce marş, şarj gerilimi, aydınlatma ve gösterge kontrollerini tekrar yapar; sorunun tamamen giderildiğinden emin olduktan sonra aracı teslim ederiz.",
  },
];

export default function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    const fill = progressFillRef.current;
    if (!el || !fill) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-wf-intro]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        },
      );

      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-wf-list]",
            start: "top 68%",
            end: "bottom 58%",
            scrub: 0.35,
            onUpdate: (self) => {
              const idx = Math.min(
                WORKFLOW_STEPS.length - 1,
                Math.floor(self.progress * WORKFLOW_STEPS.length),
              );
              setActiveStep(idx);
            },
          },
        },
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-wf-card]");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="is-akisi"
      ref={sectionRef}
      aria-labelledby="is-akisi-baslik"
      className="section workflow"
    >
      <div className="section__inner workflow__grid">
        {/* Left Sticky Intro */}
        <div className="workflow__aside" data-wf-intro>
          <div className="eyebrow">
            <span aria-hidden="true" className="eyebrow__dot" />
            <span>İş akışı</span>
          </div>
          <h2 id="is-akisi-baslik" className="section-title">
            Nasıl çalışıyoruz?
          </h2>
          <p className="section-intro">
            Aracını atölyeye getirdiğinde hangi sırayla kontrol yapılacağını baştan bilirsin.
            Ölçüm yapmadan karar vermiyor, onay almadan işlem başlatmıyoruz.
          </p>

          <div className="workflow__progress-badge tabular" aria-hidden="true">
            <span className="workflow__progress-dot" />
            <span>
              Adım 0{activeStep + 1} / 0{WORKFLOW_STEPS.length} —{" "}
              {WORKFLOW_STEPS[activeStep].tag}
            </span>
          </div>
        </div>

        {/* Right 4-Step Timeline */}
        <div className="workflow__timeline" data-wf-list>
          <div aria-hidden="true" className="workflow__rail">
            <div ref={progressFillRef} className="workflow__rail-fill" />
          </div>

          <ol className="workflow__list">
            {WORKFLOW_STEPS.map((step, index) => {
              const isCurrent = index <= activeStep;
              return (
                <li
                  key={step.num}
                  data-wf-card
                  className={
                    index === activeStep
                      ? "workflow-card workflow-card--active"
                      : "workflow-card"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      isCurrent
                        ? "workflow-card__marker workflow-card__marker--lit"
                        : "workflow-card__marker"
                    }
                  />
                  <div className="workflow-card__head">
                    <span className="workflow-card__num tabular">{step.num}</span>
                    <span className="workflow-card__tag">{step.tag}</span>
                  </div>
                  <h3 className="workflow-card__title">{step.title}</h3>
                  <p className="workflow-card__desc">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
