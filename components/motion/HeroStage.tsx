"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HeroPhoto } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

interface HeroStageProps {
  heroTitle: string;
  heroLines: string[];
  heroSubtitle: string;
  region: string;
  hasActions: boolean;
  hasPhone: boolean;
  phoneHref: string;
  hasMaps: boolean;
  mapsUrl: string;
  heroPhoto: HeroPhoto | null;
  hasServices: boolean;
}

const SHOP_PILLARS = [
  { title: "Ölçümle tespit", desc: "Tahminle parça değişimi yerine cihaz ve multimetre kontrolü" },
  { title: "Açık anlatım", desc: "Arızanın nedenini ve yapılacak işlemi sade dille paylaşım" },
  { title: "Kontrollü teslim", desc: "İşlem sonrası şarj, marş ve aydınlatma yük kontrolü" },
] as const;

export default function HeroStage({
  heroTitle,
  heroLines,
  heroSubtitle,
  region,
  hasActions,
  hasPhone,
  phoneHref,
  hasMaps,
  mapsUrl,
  heroPhoto,
  hasServices,
}: HeroStageProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        "[data-hero-eyebrow]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 },
        0,
      )
        .fromTo(
          "[data-hero-line]",
          { yPercent: 105 },
          { yPercent: 0, duration: 0.75, stagger: 0.07 },
          0.08,
        )
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 },
          0.28,
        );

      const frame = el.querySelector("[data-hero-frame]");
      if (frame) {
        tl.fromTo(
          frame,
          { opacity: 0, y: 18, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
          0.16,
        );
      }

      const parallaxImg = el.querySelector("[data-hero-img]");
      if (parallaxImg) {
        gsap.fromTo(
          parallaxImg,
          { scale: 1.05, yPercent: -2 },
          {
            scale: 1.0,
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-baslik"
      className={heroPhoto ? "hero" : "hero hero--clean"}
    >
      <div className="section__inner">
        <div className={heroPhoto ? "hero__grid" : "hero__grid hero__grid--single"}>
          <div className="hero__content">
            <div data-hero-eyebrow className="eyebrow">
              <span aria-hidden="true" className="eyebrow__dot" />
              <span>Oto Elektrik Atölyesi</span>
              {region && <span className="eyebrow__sep">·</span>}
              {region && <span>{region}</span>}
            </div>

            <h1 id="hero-baslik" aria-label={heroTitle} className="hero__title">
              {heroLines.map((line, index) => (
                <span key={`${line}-${index}`} className="hero__line-mask">
                  <span data-hero-line className="hero__line">
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p data-hero-fade className="hero__summary">
              {heroSubtitle}
            </p>

            <div data-hero-fade className="hero__actions">
              {hasActions && hasPhone && (
                <a href={phoneHref} data-event="ara" className="button button--primary">
                  Hemen ara
                </a>
              )}
              {hasActions && hasMaps && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-event="yol_tarifi"
                  className="button button--secondary"
                >
                  Yol tarifi al
                </a>
              )}
              {!hasActions && hasServices && (
                <a href="#hizmetler" className="button button--dark">
                  Hizmetleri incele
                </a>
              )}
              <a href="#is-akisi" className="button button--secondary">
                Nasıl çalışıyoruz?
              </a>
            </div>
          </div>

          {heroPhoto && (
            <figure data-hero-frame className="hero__figure">
              <div className="hero__image-wrap">
                <div data-hero-img className="hero__image-inner">
                  <Image
                    src={heroPhoto.src}
                    alt={heroPhoto.alt}
                    fill
                    priority
                    quality={85}
                    sizes="(min-width: 961px) 540px, 100vw"
                    className="hero__image"
                  />
                </div>
              </div>
              {heroPhoto.representative && (
                <figcaption className="hero__caption">
                  Temsili fotoğraf — yalnızca tasarım önizlemesi. Üretimde yayımlanmaz.
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <dl data-hero-fade className="hero-principles">
          {SHOP_PILLARS.map((item) => (
            <div key={item.title} className="hero-principles__item">
              <dt className="hero-principles__title">{item.title}</dt>
              <dd className="hero-principles__desc">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
