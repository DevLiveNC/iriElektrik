"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 72;

interface PhaseChapter {
  id: string;
  phase: string;
  frameRange: [number, number];
  title: string;
  partLabel: string;
  symptomNote: string;
  engineeringNote: string;
  calloutAnchor: { x0: number; y0: number; x1: number; y1: number; side: "top" | "bottom" };
}

const CHAPTERS: PhaseChapter[] = [
  {
    id: "faz-01",
    phase: "FAZ 01 // KARE 01–18",
    frameRange: [0, 17],
    title: "Tahrik kasnağı ve mekanik yük girişi",
    partLabel: "6-KANALLI V-KAYIŞ KASNAĞI & ÖN RULMAN",
    symptomNote:
      "Soğuk çalıştırmada kayış sesi, rölantide far titremesi veya devirle değişen uğultu.",
    engineeringNote:
      "Alternatör kasnağı, tek yönlü kavrama mekanizması ve ön rulman boşluğu kontrol edilir; kayış gerginliği ölçülerek mekanik kayıp elenir.",
    calloutAnchor: { x0: 0.31, y0: 0.50, x1: 0.14, y1: 0.52, side: "top" },
  },
  {
    id: "faz-02",
    phase: "FAZ 02 // KARE 19–36",
    frameRange: [18, 35],
    title: "Ön döküm gövde ayrımı ve soğutma türbini",
    partLabel: "ALÜMİNYUM GÖVDE & SANTRİFÜJ FAN",
    symptomNote:
      "Uzun yolda veya klima açıkken şarj performansının düşmesi, aşırı ısınma kokusu.",
    engineeringNote:
      "Hava kanalları, gövde şase teması ve iç soğutma kanatçıkları incelenir; gövde oksitlenmesinden kaynaklanan voltaj düşümü multimetreyle ölçülür.",
    calloutAnchor: { x0: 0.42, y0: 0.36, x1: 0.31, y1: 0.34, side: "top" },
  },
  {
    id: "faz-03",
    phase: "FAZ 03 // KARE 37–54",
    frameRange: [36, 53],
    title: "Pençe kutup rotor, bakır bilezikler ve stator sargısı",
    partLabel: "24-OLUK BAKIR STATOR & ROTOR KÖMÜR HATTI",
    symptomNote:
      "Gösterge panelinde akü lambasının yanması veya düzensiz yanıp sönmesi.",
    engineeringNote:
      "Rotor bilezik aşınması, kömür (fırça) basıncı ve 3-faz bakır stator sargılarının gövdeye kaçak / kısa devre direnci tek tek test edilir.",
    calloutAnchor: { x0: 0.52, y0: 0.46, x1: 0.55, y1: 0.45, side: "bottom" },
  },
  {
    id: "faz-04",
    phase: "FAZ 04 // KARE 55–72",
    frameRange: [54, 71],
    title: "Diyot köprüsü doğrultma ve 14.4V konjektör regülasyonu",
    partLabel: "6-DİYOT DOĞRULTUCU & KONJEKTÖR MODÜLÜ",
    symptomNote:
      "Sabaha karşı akünün boşalması, ampul patlatma veya yüksek/düşük şarj gerilimi.",
    engineeringNote:
      "Diyot köprüsü AC kaçak dalgalanması ve konjektör kesme gerilimi yük altında doğrulanır; 13.8V–14.4V kararlı şarj sağlandığında teslim edilir.",
    calloutAnchor: { x0: 0.64, y0: 0.44, x1: 0.72, y1: 0.42, side: "top" },
  },
];

function frameSrc(idx: number): string {
  return `/sequences/alternator/frame-${String(idx).padStart(2, "0")}.webp`;
}

export default function AlternatorFrameStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterCardRef = useRef<HTMLElement>(null);
  const dragStateRef = useRef<{ active: boolean; startX: number; startFrame: number }>({
    active: false,
    startX: 0,
    startFrame: 0,
  });
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);

  const [frameIndex, setFrameIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeChapterIdx = CHAPTERS.findIndex(
    (ch) => frameIndex >= ch.frameRange[0] && frameIndex <= ch.frameRange[1],
  );
  const safeChapterIdx = activeChapterIdx === -1 ? 0 : activeChapterIdx;
  const activeChapter = CHAPTERS[safeChapterIdx];

  const renderCanvas = useCallback((targetIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;

    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = rect.width;
    const ch = rect.height;

    ctx.fillStyle = "#060911";
    ctx.fillRect(0, 0, cw, ch);

    // Find exact frame or closest already-loaded frame so canvas is NEVER blank
    const imgs = imagesRef.current;
    let img = imgs[targetIdx];
    if (!img) {
      for (let dist = 1; dist < TOTAL_FRAMES; dist++) {
        if (targetIdx - dist >= 0 && imgs[targetIdx - dist]) {
          img = imgs[targetIdx - dist];
          break;
        }
        if (targetIdx + dist < TOTAL_FRAMES && imgs[targetIdx + dist]) {
          img = imgs[targetIdx + dist];
          break;
        }
      }
    }

    // Subtle CAD millimeter grid behind studio render
    ctx.strokeStyle = "rgba(148, 163, 184, 0.055)";
    ctx.lineWidth = 1;
    const grid = 44;
    for (let x = 0; x <= cw; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ch);
      ctx.stroke();
    }
    for (let y = 0; y <= ch; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
    }

    let drawX = 0;
    let drawY = 0;
    let drawW = cw;
    let drawH = ch;

    if (img && img.naturalWidth > 0) {
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = cw / ch;
      if (boxAspect > imgAspect) {
        drawH = ch * 0.96;
        drawW = drawH * imgAspect;
      } else {
        drawW = cw * 0.98;
        drawH = drawW / imgAspect;
      }
      drawX = (cw - drawW) * 0.5;
      drawY = (ch - drawH) * 0.5;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Synchronized Retina Vector CAD Callout Leader Line & Target Reticle
    const u = targetIdx / (TOTAL_FRAMES - 1);
    const chIdx = CHAPTERS.findIndex(
      (item) => targetIdx >= item.frameRange[0] && targetIdx <= item.frameRange[1],
    );
    const chData = CHAPTERS[chIdx === -1 ? 0 : chIdx];

    if (cw >= 460) {
      const ax = drawX + drawW * (chData.calloutAnchor.x0 + (chData.calloutAnchor.x1 - chData.calloutAnchor.x0) * u);
      const ay = drawY + drawH * (chData.calloutAnchor.y0 + (chData.calloutAnchor.y1 - chData.calloutAnchor.y0) * u);
      const elbowY = chData.calloutAnchor.side === "top" ? Math.max(28, ay - 68) : Math.min(ch - 32, ay + 68);
      const dir = ax > cw * 0.52 ? -1 : 1;
      const elbowX = ax + dir * 36;
      const endX = Math.max(20, Math.min(cw - 20, elbowX + dir * 165));

      // Glowing target reticle
      ctx.beginPath();
      ctx.arc(ax, ay, 11, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(224, 139, 88, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ax, ay, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#e08b58";
      ctx.fill();

      // Leader path
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(endX, elbowY);
      ctx.strokeStyle = "rgba(224, 139, 88, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Callout label text
      ctx.font = "600 11px 'Instrument Sans', system-ui, sans-serif";
      ctx.fillStyle = "#f7f6f2";
      ctx.textAlign = dir > 0 ? "left" : "right";
      ctx.fillText(chData.partLabel, elbowX + dir * 6, elbowY - 7);
      ctx.textAlign = "left";
    }

    // Corner CAD registration crosshairs
    const m = 16;
    const arm = 10;
    ctx.strokeStyle = "rgba(224, 139, 88, 0.55)";
    ctx.lineWidth = 1.2;
    for (const [cx, cy] of [
      [m, m],
      [cw - m, m],
      [m, ch - m],
      [cw - m, ch - m],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
      ctx.stroke();
    }

    // Live 3-Phase -> Rectified DC Mini-Waveform in bottom-right corner
    if (cw >= 520) {
      const boxW = 168;
      const boxH = 54;
      const bx = cw - boxW - 24;
      const by = ch - boxH - 22;

      ctx.fillStyle = "rgba(9, 13, 22, 0.78)";
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = "rgba(232, 237, 244, 0.72)";
      ctx.font = "600 9.5px 'Instrument Sans', system-ui, sans-serif";
      ctx.fillText(u > 0.72 ? "DOĞRULTULMUŞ 14.4V DC" : "3-FAZ STATOR AC DALGASI", bx + 8, by + 13);

      const rectify = Math.max(0, Math.min(1, (u - 0.55) / 0.35));
      for (let p = 0; p < 3; p++) {
        ctx.beginPath();
        for (let sx = 8; sx <= boxW - 8; sx += 2) {
          const su = (sx - 8) / (boxW - 16);
          const ac = Math.sin(su * Math.PI * 4 - u * 18 + (p * Math.PI * 2) / 3);
          const dc = -0.55 - Math.abs(ac) * 0.18;
          const val = ac * (1 - rectify) + dc * rectify;
          const py = by + 35 + val * 12;
          if (sx === 8) ctx.moveTo(bx + sx, py);
          else ctx.lineTo(bx + sx, py);
        }
        ctx.strokeStyle =
          p === 0
            ? "rgba(56, 189, 248, 0.9)"
            : p === 1
              ? "rgba(224, 139, 88, 0.75)"
              : "rgba(59, 130, 246, 0.75)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }, []);

  // Progressive Priority Frame Preloader
  useEffect(() => {
    let cancelled = false;
    const priorityOrder: number[] = [];
    const seen = new Set<number>();

    // Pass 1: Keyframes (0, 18, 36, 54, 71)
    [0, 18, 36, 54, 71].forEach((i) => {
      seen.add(i);
      priorityOrder.push(i);
    });
    // Pass 2: Stride-4 frames for instant smooth scrubbing
    for (let i = 0; i < TOTAL_FRAMES; i += 4) {
      if (!seen.has(i)) {
        seen.add(i);
        priorityOrder.push(i);
      }
    }
    // Pass 3: Every remaining frame
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!seen.has(i)) {
        seen.add(i);
        priorityOrder.push(i);
      }
    }

    let pointer = 0;
    let done = 0;
    const concurrency = 6;

    const loadNext = () => {
      if (cancelled || pointer >= priorityOrder.length) return;
      const idx = priorityOrder[pointer++];
      const img = new window.Image();
      img.decoding = "async";
      img.src = frameSrc(idx);
      img.onload = () => {
        if (cancelled) return;
        imagesRef.current[idx] = img;
        done += 1;
        setLoadedCount(done);
        if (idx === currentFrameRef.current || done <= 6) {
          renderCanvas(currentFrameRef.current);
        }
        loadNext();
      };
      img.onerror = () => {
        if (!cancelled) loadNext();
      };
    };

    for (let c = 0; c < concurrency; c++) {
      loadNext();
    }

    const onResize = () => renderCanvas(currentFrameRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [renderCanvas]);

  // Keep canvas synced whenever frameIndex updates
  useEffect(() => {
    currentFrameRef.current = frameIndex;
    renderCanvas(frameIndex);
  }, [frameIndex, renderCanvas]);

  // Subtle GSAP transition when active 3D cutaway chapter changes
  useEffect(() => {
    const card = chapterCardRef.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      card,
      { opacity: 0.45, y: 8 },
      { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
    );
  }, [safeChapterIdx]);

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPlaying(false);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startFrame: currentFrameRef.current,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const deltaRatio = (e.clientX - dragStateRef.current.startX) / Math.max(180, rect.width * 0.75);
    const next = Math.max(
      0,
      Math.min(
        TOTAL_FRAMES - 1,
        Math.round(dragStateRef.current.startFrame + deltaRatio * (TOTAL_FRAMES - 1)),
      ),
    );
    if (next !== currentFrameRef.current) {
      currentFrameRef.current = next;
      setFrameIndex(next);
    }
  };

  const onCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Optional manual 60fps Play / Pause loop
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      if (now - last >= 36) {
        last = now;
        setFrameIndex((prev) => (prev + 1) % TOTAL_FRAMES);
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [isPlaying]);

  // GSAP ScrollTrigger Pinned Scrollytelling
  useEffect(() => {
    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    if (!section || !pinWrap) return;

    const mm = gsap.matchMedia();

    // Desktop Pinned Scrollytelling
    mm.add("(min-width: 961px) and (prefers-reduced-motion: no-preference)", () => {
      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: pinWrap,
          start: "top top+=72",
          end: "+=230%",
          scrub: 0.45,
          anticipatePin: 1,
          onUpdate: () => {
            const next = Math.round(proxy.frame);
            if (next !== currentFrameRef.current) {
              setIsPlaying(false);
              currentFrameRef.current = next;
              setFrameIndex(next);
            }
          },
        },
      });
    });

    // Tablet/Mobile smooth non-trapping scroll scrub
    mm.add("(max-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom-=15%",
          end: "bottom top+=20%",
          scrub: 0.35,
          onUpdate: () => {
            const next = Math.round(proxy.frame);
            if (next !== currentFrameRef.current) {
              currentFrameRef.current = next;
              setFrameIndex(next);
            }
          },
        },
      });
    });

    return () => mm.revert();
  }, []);

  const progressRatio = frameIndex / (TOTAL_FRAMES - 1);
  const explodePct = Math.round(
    Math.max(0, Math.min(1, (progressRatio - 0.08) / 0.66)) * 100,
  );
  const voltageVal = (12.6 + progressRatio * 1.82).toFixed(2);
  const rippleMv = Math.round(165 - progressRatio * 143);

  return (
    <section
      id="anatomi"
      ref={sectionRef}
      aria-labelledby="anatomi-baslik"
      className="frame-stage on-dark"
    >
      <div ref={pinWrapRef} className="frame-stage__pin">
        <div className="section__inner frame-stage__inner">
          {/* Top Engineering Header */}
          <div className="frame-stage__top">
            <div>
              <div className="tech-eyebrow">
                <span aria-hidden="true" className="tech-eyebrow__bar" />
                <span>72-KARE 3B KESİT ANALİZİ // KAYDIRMALI SİMÜLASYON</span>
              </div>
              <h2 id="anatomi-baslik" className="frame-stage__heading">
                Şarj ve marş mimarisini kare kare açıyoruz.
              </h2>
            </div>

            <div className="frame-stage__metrics" aria-label="Canlı kesit telemetrisi">
              <div className="frame-metric">
                <span className="frame-metric__label">AKTİF KARE</span>
                <strong className="frame-metric__value tabular">
                  {String(frameIndex + 1).padStart(2, "0")} / {TOTAL_FRAMES}
                </strong>
              </div>
              <div className="frame-metric">
                <span className="frame-metric__label">KESİT AÇILIMI</span>
                <strong className="frame-metric__value tabular">%{explodePct}</strong>
              </div>
              <div className="frame-metric">
                <span className="frame-metric__label">HAT GERİLİMİ</span>
                <strong className="frame-metric__value frame-metric__value--accent tabular">
                  {voltageVal}V
                </strong>
              </div>
              <div className="frame-metric">
                <span className="frame-metric__label">AC DALGALANMA</span>
                <strong className="frame-metric__value tabular">{rippleMv} mV</strong>
              </div>
            </div>
          </div>

          {/* Main Asymmetric Cutaway Viewport + Synchronized Chapter Deck */}
          <div className="frame-stage__body">
            <div
              className="frame-stage__viewport"
              data-cursor="SÜRÜKLE / KAYDIR"
            >
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Otomotiv alternatör ve bakır stator patlatılmış 3 boyutlu kesit animasyonu — ${activeChapter.title}`}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
                className="frame-stage__canvas"
              />

              {/* Subtle Preload Indicator */}
              {loadedCount < 16 && (
                <div className="frame-stage__loader" aria-live="polite">
                  3B kare dizisi hazırlanıyor ({Math.round((loadedCount / TOTAL_FRAMES) * 100)}%)
                </div>
              )}

              {/* Interactive Bottom Frame Scrubber Console */}
              <div className="frame-scrubber">
                <button
                  type="button"
                  onClick={() => setIsPlaying((v) => !v)}
                  className="frame-scrubber__play"
                  aria-label={isPlaying ? "Kare animasyonunu duraklat" : "Kare animasyonunu oynat"}
                >
                  {isPlaying ? "❚❚ Duraklat" : "▶ Oynat"}
                </button>

                <div className="frame-scrubber__track-wrap">
                  <input
                    type="range"
                    min={0}
                    max={TOTAL_FRAMES - 1}
                    value={frameIndex}
                    aria-label="72 karelik 3 boyutlu kesit zaman çubuğu"
                    onChange={(e) => {
                      setIsPlaying(false);
                      setFrameIndex(Number(e.target.value));
                    }}
                    className="frame-scrubber__range"
                  />
                  <div
                    aria-hidden="true"
                    className="frame-scrubber__fill"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>

                <span className="frame-scrubber__readout tabular">
                  KARE {String(frameIndex + 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Right Synchronized 4-Phase Diagnostic Deck */}
            <div className="frame-stage__sidebar">
              <div className="frame-phase-tabs" role="tablist" aria-label="Kesit aşamaları">
                {CHAPTERS.map((ch, idx) => {
                  const isActive = idx === safeChapterIdx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setIsPlaying(false);
                        setFrameIndex(Math.round((ch.frameRange[0] + ch.frameRange[1]) / 2));
                      }}
                      className={
                        isActive
                          ? "frame-phase-tab frame-phase-tab--active"
                          : "frame-phase-tab"
                      }
                    >
                      <span className="tabular">0{idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              <article ref={chapterCardRef} className="frame-chapter-card" aria-live="polite">
                <p className="frame-chapter-card__phase">{activeChapter.phase}</p>
                <h3 className="frame-chapter-card__title">{activeChapter.title}</h3>

                <div className="frame-chapter-card__block">
                  <span className="frame-chapter-card__tag frame-chapter-card__tag--copper">
                    Sürücüde Görülen Belirti
                  </span>
                  <p className="frame-chapter-card__text">{activeChapter.symptomNote}</p>
                </div>

                <div className="frame-chapter-card__block">
                  <span className="frame-chapter-card__tag frame-chapter-card__tag--cobalt">
                    Atölye Ölçüm Karşılığı
                  </span>
                  <p className="frame-chapter-card__text">{activeChapter.engineeringNote}</p>
                </div>
              </article>

              <p className="frame-stage__hint">
                Sayfayı aşağı kaydırarak veya zaman çubuğunu sürükleyerek 72 karelik iç yapıyı
                inceleyebilirsin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
