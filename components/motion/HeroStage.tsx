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

const SUBSYSTEM_PILLARS = [
  { index: "01", code: "SYS-BAT", label: "Akü & Şarj Rejimi", spec: "12.6V → 14.4V DC", simIdx: 0 },
  { index: "02", code: "SYS-ALT", label: "Marş & Alternatör", spec: "3-Faz Doğrultma", simIdx: 1 },
  { index: "03", code: "SYS-OPT", label: "Aydınlatma & Optik", spec: "Röle & Hat Dengesi", simIdx: 2 },
  { index: "04", code: "SYS-ECU", label: "Tesisat & Arıza Tespiti", spec: "CAN-Bus & Soket", simIdx: 3 },
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
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
  const schematicCanvasRef = useRef<HTMLCanvasElement>(null);

  // GSAP Entrance Choreography, Scroll Parallax & Magnetic Buttons
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        "[data-hero-kicker]",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.65 },
        0,
      )
        .fromTo(
          "[data-hero-rule]",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.85, ease: "expo.out" },
          0.08,
        )
        .fromTo(
          "[data-hero-line]",
          { yPercent: 115, rotate: 1.5 },
          { yPercent: 0, rotate: 0, duration: 1.0, stagger: 0.09 },
          0.14,
        )
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
          0.42,
        )
        .fromTo(
          "[data-hero-pillar]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.06 },
          0.55,
        );

      const visualWrap = el.querySelector("[data-hero-visual]");
      if (visualWrap) {
        tl.fromTo(
          visualWrap,
          { clipPath: "inset(8% 0% 8% 8%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.15,
            ease: "expo.out",
            clearProps: "clipPath",
          },
          0.12,
        );
      }

      const parallaxImg = el.querySelector("[data-hero-parallax]");
      if (parallaxImg) {
        gsap.fromTo(
          parallaxImg,
          { scale: 1.09, yPercent: -3 },
          {
            scale: 1.02,
            yPercent: 5,
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

    // Magnetic hover micro-physics for hero buttons
    const magnetics = Array.from(el.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups = magnetics.map((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });
      const onMove = (ev: PointerEvent) => {
        if (ev.pointerType !== "mouse") return;
        const rect = btn.getBoundingClientRect();
        const dx = (ev.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (ev.clientY - (rect.top + rect.height / 2)) * 0.22;
        xTo(dx);
        yTo(dy);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener("pointermove", onMove);
      btn.addEventListener("pointerleave", onLeave);
      return () => {
        btn.removeEventListener("pointermove", onMove);
        btn.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  // Live 60fps Mini-Oscilloscope HUD Canvas (over photo) OR Full Oscilloscope Matrix (when no photo)
  useEffect(() => {
    const canvas = heroPhoto ? hudCanvasRef.current : schematicCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    let phase = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cw = rect.width;
      const ch = rect.height;

      ctx.clearRect(0, 0, cw, ch);

      if (heroPhoto) {
        // Sleek floating HUD waveform strip
        ctx.strokeStyle = "rgba(212, 218, 229, 0.14)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= cw; gx += 24) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, ch);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, ch * 0.5);
        ctx.lineTo(cw, ch * 0.5);
        ctx.stroke();

        // 3-phase rectified ripple + clean DC carrier
        ctx.beginPath();
        for (let x = 0; x <= cw; x += 2) {
          const u = x / cw;
          const ripple =
            Math.abs(Math.sin(u * Math.PI * 6 - phase * 2.2)) * 5.5 +
            Math.sin(u * 26 - phase * 4.5) * 1.4;
          const y = ch * 0.62 - ripple;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Copper reference line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, ch * 0.34);
        ctx.lineTo(cw, ch * 0.34);
        ctx.strokeStyle = "#e08b58";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Full-stage dark precision oscilloscope & circuit architecture frame (production clean hero)
        ctx.fillStyle = "#0a0f1c";
        ctx.fillRect(0, 0, cw, ch);

        // Blueprint grid
        const step = 36;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= cw; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ch);
          ctx.stroke();
        }
        for (let y = 0; y <= ch; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cw, y);
          ctx.stroke();
        }

        // Draw 3 synchronized automotive diagnostic channels (14.4V Charge, Cranking Load, CAN-Bus)
        const channels = [
          { yRatio: 0.27, color: "#3b82f6", label: "CH1 // ŞARJ HATTI · 14.40V DC", amp: 14, mode: "rectified" },
          { yRatio: 0.53, color: "#e08b58", label: "CH2 // MARŞ YÜK EĞRİSİ · 10.8V", amp: 22, mode: "crank" },
          { yRatio: 0.79, color: "#38bdf8", label: "CH3 // TESİSAT SİNYAL HATTI", amp: 12, mode: "can" },
        ] as const;

        channels.forEach((chItem) => {
          const baseY = ch * chItem.yRatio;
          ctx.fillStyle = "rgba(232, 237, 244, 0.68)";
          ctx.font = "600 11px 'Instrument Sans', system-ui, sans-serif";
          ctx.fillText(chItem.label, 24, baseY - 28);

          ctx.beginPath();
          for (let x = 24; x <= cw - 24; x += 2) {
            const u = (x - 24) / Math.max(1, cw - 48);
            let dy = 0;
            if (chItem.mode === "rectified") {
              dy = -Math.abs(Math.sin(u * Math.PI * 9 - phase * 2.4)) * chItem.amp * 0.55;
            } else if (chItem.mode === "crank") {
              const dip = Math.exp(-Math.pow((u - ((phase * 0.12) % 1)) * 7, 2));
              dy = dip * chItem.amp - Math.sin(u * 36 - phase * 3) * 2.5;
            } else {
              const bit = Math.sin(u * 28 - phase * 3.2) > 0 ? -1 : 1;
              dy = bit * chItem.amp * 0.55;
            }
            const py = baseY + dy;
            if (x === 24) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          ctx.strokeStyle = chItem.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      if (!reduced) {
        phase += 0.025;
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [heroPhoto]);

  const jumpToSubsystem = (simIdx: number) => {
    window.dispatchEvent(new CustomEvent("iri:select-subsystem", { detail: { index: simIdx } }));
    const target = document.getElementById("simulasyon") ?? document.getElementById("hizmetler");
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section aria-labelledby="hero-baslik" ref={sectionRef} className="hero-stage">
      <div className="hero-stage__grid">
        {/* Left Editorial & Telemetry Command Column */}
        <div className="hero-stage__content">
          <div data-hero-kicker className="hero-kicker">
            <span aria-hidden="true" className="hero-kicker__pulse" />
            <span>OTOMOTİV ELEKTRİK &amp; ÖLÇÜM ATÖLYESİ</span>
            {region && <span className="hero-kicker__region">{region}</span>}
          </div>

          <span aria-hidden="true" data-hero-rule className="hero__rule" />

          <h1 id="hero-baslik" aria-label={heroTitle} className="hero__title">
            {heroLines.map((line, index) => (
              <span key={`${line}-${index}`} className="hero__title-mask">
                <span data-hero-line className="hero__title-line">
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
              <a
                href={phoneHref}
                data-event="ara"
                data-magnetic
                data-cursor="ARA"
                className="button button--primary button--hero"
              >
                <span>Hemen ara</span>
                <span aria-hidden="true" className="button__arrow">
                  ↗
                </span>
              </a>
            )}
            {hasActions && hasMaps && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                data-event="yol_tarifi"
                data-magnetic
                data-cursor="ROTA"
                className="button button--secondary button--hero"
              >
                <span>Yol tarifi</span>
              </a>
            )}
            <a
              href="#anatomi"
              data-magnetic
              data-cursor="KESİT"
              className="button button--ghost-tech button--hero"
            >
              <span>3B Kesit &amp; Simülasyon</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div data-hero-fade className="hero-specs" aria-label="Ölçüm disiplinleri">
            <div className="hero-specs__item">
              <span className="hero-specs__code">01 // YÖNTEM</span>
              <strong className="hero-specs__val">Tahmin değil, multimetre &amp; yük testi</strong>
            </div>
            <div className="hero-specs__item">
              <span className="hero-specs__code">02 // İLETİŞİM</span>
              <strong className="hero-specs__val">Arızanın nedenini sade Türkçeyle anlatım</strong>
            </div>
          </div>
        </div>

        {/* Right Documentary Photo + Live Telemetry Stage (or Pure Oscilloscope Frame in Clean Prod) */}
        <div data-hero-visual className="hero-stage__visual">
          {heroPhoto ? (
            <figure className="hero__figure">
              <div data-hero-parallax className="hero__parallax-inner">
                <Image
                  src={heroPhoto.src}
                  alt={heroPhoto.alt}
                  fill
                  priority
                  quality={85}
                  sizes="(min-width: 961px) 56vw, 100vw"
                  className="hero__image"
                />
              </div>
              <div aria-hidden="true" className="hero__vignette" />
              <div aria-hidden="true" className="hero__hud-card">
                <div className="hero__hud-top">
                  <span className="hero__hud-dot" />
                  <span>CANLI ÖLÇÜM TELEMETRİSİ</span>
                  <strong className="tabular">12.65V → 14.40V</strong>
                </div>
                <canvas ref={hudCanvasRef} className="hero__hud-canvas" />
              </div>
              {heroPhoto.representative && (
                <figcaption className="hero__caption">
                  Temsili fotoğraf — yalnızca tasarım önizlemesi. Üretimde yayımlanmaz.
                </figcaption>
              )}
            </figure>
          ) : (
            <div
              className="hero__oscilloscope-stage"
              role="img"
              aria-label="Otomotiv şarj, marş ve sinyal hatlarını gösteren canlı teknik osiloskop ekranı"
            >
              <div className="hero__oscilloscope-bar">
                <span>TEKNİK SİNYAL MİMARİSİ // 3-KANAL İZLEME</span>
                <span className="tabular">ÖRNEKLEME: 60 FPS</span>
              </div>
              <canvas ref={schematicCanvasRef} className="hero__schematic-canvas" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom 4-Channel Subsystem Interactive Jump Strip */}
      <div className="hero-pillars" aria-label="Elektrik alt sistemleri hızlı geçiş">
        {SUBSYSTEM_PILLARS.map((item) => (
          <button
            key={item.code}
            type="button"
            data-hero-pillar
            data-cursor="SİMÜLE ET"
            onClick={() => jumpToSubsystem(item.simIdx)}
            className="hero-pillar"
          >
            <span className="hero-pillar__top">
              <span className="hero-pillar__idx tabular">{item.index}</span>
              <span className="hero-pillar__code">{item.code}</span>
            </span>
            <span className="hero-pillar__label">{item.label}</span>
            <span className="hero-pillar__spec tabular">{item.spec}</span>
          </button>
        ))}
        {hasServices && (
          <a href="#hizmetler" data-hero-pillar className="hero-pillar hero-pillar--cta">
            <span className="hero-pillar__top">
              <span className="hero-pillar__idx">→</span>
              <span className="hero-pillar__code">TÜM LİSTE</span>
            </span>
            <span className="hero-pillar__label">Onaylı Hizmetler</span>
            <span className="hero-pillar__spec">Belirti &amp; Yapılan İş</span>
          </a>
        )}
      </div>
    </section>
  );
}
