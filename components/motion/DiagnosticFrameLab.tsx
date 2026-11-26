"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SubsystemScenario {
  id: string;
  code: string;
  title: string;
  faultVoltage: string;
  healthyVoltage: string;
  faultMetric: string;
  healthyMetric: string;
  faultSummary: string;
  healthySummary: string;
  activeNodes: string[];
  faultNode: string;
  waveMode: "battery" | "starter" | "lighting" | "harness";
}

const SCENARIOS: SubsystemScenario[] = [
  {
    id: "aku-sarj",
    code: "01 // AKÜ & ŞARJ",
    title: "Akü kutup direnci ve şarj hattı analizi",
    faultVoltage: "11.65V",
    healthyVoltage: "14.38V",
    faultMetric: "Kutup oksit kaybı: 0.92V düşüm",
    healthyMetric: "Hat kaybı: < 0.05V · Kararlı şarj",
    faultSummary:
      "Kutup başı oksitlenmesi veya zayıf şarj dinamosu nedeniyle akü tam dolmuyor; sabah ilk marşta gerilim hızla çöküyor.",
    healthySummary:
      "Akü kapasite testi, kutup/şase temizliği ve alternatör çıkış doğrulaması sonrası 14.38V kararlı şarj hattı kuruldu.",
    activeNodes: ["BAT", "ALT", "FUS"],
    faultNode: "BAT",
    waveMode: "battery",
  },
  {
    id: "mars-alternator",
    code: "02 // MARŞ & ALTERNATÖR",
    title: "Marş anı akım çekişi ve selenoit tepkisi",
    faultVoltage: "8.40V",
    healthyVoltage: "10.85V",
    faultMetric: "Kontakta tek 'tık' · Kömür/selenoit kaybı",
    healthyMetric: "Marş yük altında ≥ 10.5V · Anında kavrama",
    faultSummary:
      "Marş motoru kömür aşınması veya selenoit kontak yanığı yüzünden akım iletilemiyor; kontakta yalnızca tık sesi duyuluyor.",
    healthySummary:
      "Marş selenoidi, kömür yuvası ve burç kontrolü tamamlandı; marş anı gerilim eğrisi sağlıklı eşiğe döndü.",
    activeNodes: ["BAT", "STR", "ALT"],
    faultNode: "STR",
    waveMode: "starter",
  },
  {
    id: "aydinlatma",
    code: "03 // OPTİK & AYDINLATMA",
    title: "Far, stop, röle ve duy soket gerilim dengesi",
    faultVoltage: "9.80V",
    healthyVoltage: "13.90V",
    faultMetric: "Gevşek şase / ısınan soket arkı",
    healthyMetric: "Dengeli sağ-sol far akımı · Sağlam soket",
    faultSummary:
      "Oksitli duy soketi veya zayıf şase bağlantısı lambanın sönük yanmasına, titremesine ya da sık ampul patlatmasına yol açıyor.",
    healthySummary:
      "Sigorta, röle, duy ve şase noktaları yenilendi; her iki optik hatta tam gerilim ve güvenli kontak sağlandı.",
    activeNodes: ["BAT", "FUS", "OPT_L", "OPT_R", "REAR_L", "REAR_R"],
    faultNode: "OPT_R",
    waveMode: "lighting",
  },
  {
    id: "tesisat-ariza",
    code: "04 // TESİSAT & ECU TARAMA",
    title: "Kablo demeti sürekliliği ve kontrol ünitesi taraması",
    faultVoltage: "KESİNTİLİ",
    healthyVoltage: "5.00V / CAN",
    faultMetric: "Rastgele arıza lambası · Temassızlık",
    healthyMetric: "0 hata kodu · Temiz sinyal bütünlüğü",
    faultSummary:
      "Kapı geçişi veya motor içi tesisatta ezilen/oksitlenen hatlar gösterge ışıklarının rastgele yanmasına ve kilit/cam kesintilerine neden oluyor.",
    healthySummary:
      "Cihaz taraması ve hat-hat multimetre takibiyle sorunlu soket/kablo onarıldı; tüm modül haberleşmesi kararlı hale geldi.",
    activeNodes: ["BAT", "FUS", "ECU", "REAR_L", "REAR_R"],
    faultNode: "ECU",
    waveMode: "harness",
  },
];

interface NodeCoord {
  id: string;
  label: string;
  nx: number;
  ny: number;
}

const CHASSIS_NODES: NodeCoord[] = [
  { id: "OPT_L", label: "SOL FAR", nx: 0.13, ny: 0.25 },
  { id: "OPT_R", label: "SAĞ FAR", nx: 0.13, ny: 0.75 },
  { id: "ALT", label: "ALTERNATÖR", nx: 0.24, ny: 0.34 },
  { id: "BAT", label: "12V AKÜ", nx: 0.27, ny: 0.68 },
  { id: "STR", label: "MARŞ", nx: 0.35, ny: 0.48 },
  { id: "FUS", label: "RÖLE / SİGORTA", nx: 0.46, ny: 0.66 },
  { id: "ECU", label: "ECU / TESİSAT", nx: 0.56, ny: 0.36 },
  { id: "REAR_L", label: "SOL STOP", nx: 0.87, ny: 0.27 },
  { id: "REAR_R", label: "SAĞ STOP", nx: 0.87, ny: 0.73 },
];

const HARNESS_EDGES: [string, string][] = [
  ["BAT", "ALT"],
  ["BAT", "STR"],
  ["BAT", "FUS"],
  ["FUS", "OPT_L"],
  ["FUS", "OPT_R"],
  ["FUS", "ECU"],
  ["ECU", "REAR_L"],
  ["ECU", "REAR_R"],
  ["ALT", "STR"],
];

export default function DiagnosticFrameLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const chassisCanvasRef = useRef<HTMLCanvasElement>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [resolvedMode, setResolvedMode] = useState(false);

  const scenario = SCENARIOS[activeIdx];

  // Listen to quick-jump custom event from Hero or Services
  useEffect(() => {
    const onSelect = (ev: Event) => {
      const custom = ev as CustomEvent<{ index?: number }>;
      if (typeof custom.detail?.index === "number") {
        const clamped = Math.max(0, Math.min(SCENARIOS.length - 1, custom.detail.index));
        setActiveIdx(clamped);
        setResolvedMode(false);
      }
    };
    window.addEventListener("iri:select-subsystem", onSelect);
    return () => window.removeEventListener("iri:select-subsystem", onSelect);
  }, []);

  // GSAP Entrance Reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-lab-reveal]",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // 60fps Synchronized Chassis X-Ray Frame Animator + Digital Oscilloscope
  useEffect(() => {
    const chassisCanvas = chassisCanvasRef.current;
    const scopeCanvas = scopeCanvasRef.current;
    if (!chassisCanvas || !scopeCanvas) return;

    const cCtx = chassisCanvas.getContext("2d");
    const sCtx = scopeCanvas.getContext("2d");
    if (!cCtx || !sCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let tick = 0;

    const nodeMap = new Map(CHASSIS_NODES.map((n) => [n.id, n]));
    const activeSet = new Set(scenario.activeNodes);

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // 1. CHASSIS X-RAY CANVAS
      const cRect = chassisCanvas.getBoundingClientRect();
      if (cRect.width > 10 && cRect.height > 10) {
        const cw = cRect.width;
        const ch = cRect.height;
        if (chassisCanvas.width !== Math.round(cw * dpr) || chassisCanvas.height !== Math.round(ch * dpr)) {
          chassisCanvas.width = Math.round(cw * dpr);
          chassisCanvas.height = Math.round(ch * dpr);
        }
        cCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cCtx.fillStyle = "#090e1a";
        cCtx.fillRect(0, 0, cw, ch);

        // Blueprint grid
        cCtx.strokeStyle = "rgba(148, 163, 184, 0.06)";
        cCtx.lineWidth = 1;
        for (let x = 0; x <= cw; x += 32) {
          cCtx.beginPath();
          cCtx.moveTo(x, 0);
          cCtx.lineTo(x, ch);
          cCtx.stroke();
        }
        for (let y = 0; y <= ch; y += 32) {
          cCtx.beginPath();
          cCtx.moveTo(0, y);
          cCtx.lineTo(cw, y);
          cCtx.stroke();
        }

        // Architectural Top-Down Vehicle Silhouette Contour
        cCtx.save();
        cCtx.strokeStyle = "rgba(212, 218, 229, 0.22)";
        cCtx.lineWidth = 1.6;
        cCtx.beginPath();
        const padX = cw * 0.07;
        const padY = ch * 0.12;
        const vw = cw - padX * 2;
        const vh = ch - padY * 2;
        cCtx.roundRect(padX, padY, vw, vh, [38, 28, 28, 38]);
        cCtx.stroke();

        // Inner cabin glasshouse & hood crease blueprint lines
        cCtx.strokeStyle = "rgba(212, 218, 229, 0.11)";
        cCtx.lineWidth = 1;
        cCtx.beginPath();
        cCtx.roundRect(padX + vw * 0.34, padY + vh * 0.12, vw * 0.44, vh * 0.76, 18);
        cCtx.stroke();
        cCtx.beginPath();
        cCtx.moveTo(padX + vw * 0.31, padY + 6);
        cCtx.lineTo(padX + vw * 0.31, padY + vh - 6);
        cCtx.stroke();
        cCtx.restore();

        // Draw Harness Edges & Animated Electron Frame Packets
        for (const [aId, bId] of HARNESS_EDGES) {
          const nA = nodeMap.get(aId);
          const nB = nodeMap.get(bId);
          if (!nA || !nB) continue;

          const x1 = nA.nx * cw;
          const y1 = nA.ny * ch;
          const x2 = nB.nx * cw;
          const y2 = nB.ny * ch;
          const midX = (x1 + x2) * 0.5;

          const isEdgeActive = activeSet.has(aId) && activeSet.has(bId);
          const touchesFault = !resolvedMode && (aId === scenario.faultNode || bId === scenario.faultNode);

          cCtx.beginPath();
          cCtx.moveTo(x1, y1);
          cCtx.lineTo(midX, y1);
          cCtx.lineTo(midX, y2);
          cCtx.lineTo(x2, y2);

          if (!isEdgeActive) {
            cCtx.strokeStyle = "rgba(148, 163, 184, 0.16)";
            cCtx.lineWidth = 1.2;
          } else if (touchesFault) {
            cCtx.strokeStyle = "rgba(224, 139, 88, 0.85)";
            cCtx.lineWidth = 2.2;
          } else {
            cCtx.strokeStyle = resolvedMode ? "rgba(56, 189, 248, 0.9)" : "rgba(59, 130, 246, 0.85)";
            cCtx.lineWidth = 2.2;
          }
          cCtx.stroke();

          // Moving current packets along active orthogonal path
          if (isEdgeActive) {
            const seg1 = Math.abs(midX - x1);
            const seg2 = Math.abs(y2 - y1);
            const seg3 = Math.abs(x2 - midX);
            const totalLen = seg1 + seg2 + seg3 || 1;

            for (let p = 0; p < 3; p++) {
              const speed = touchesFault ? 0.0045 : 0.011;
              let u = ((tick * speed + p / 3) % 1 + 1) % 1;
              if (touchesFault && Math.sin(tick * 0.22 + p) > 0.35) {
                // Intermittent hesitation in fault state
                u = Math.min(0.85, u);
              }
              const d = u * totalLen;
              let px = x1;
              let py = y1;
              if (d <= seg1) {
                px = x1 + Math.sign(midX - x1) * d;
              } else if (d <= seg1 + seg2) {
                px = midX;
                py = y1 + Math.sign(y2 - y1) * (d - seg1);
              } else {
                px = midX + Math.sign(x2 - midX) * (d - seg1 - seg2);
                py = y2;
              }

              cCtx.beginPath();
              cCtx.arc(px, py, 3.2, 0, Math.PI * 2);
              cCtx.fillStyle = touchesFault ? "#f59e0b" : "#7dd3fc";
              cCtx.fill();
            }
          }
        }

        // Draw Nodes
        for (const node of CHASSIS_NODES) {
          const x = node.nx * cw;
          const y = node.ny * ch;
          const isNodeActive = activeSet.has(node.id);
          const isFault = !resolvedMode && node.id === scenario.faultNode;

          if (isFault) {
            const pulseR = 12 + ((tick * 0.35) % 14);
            const alpha = Math.max(0, 1 - (pulseR - 12) / 14);
            cCtx.beginPath();
            cCtx.arc(x, y, pulseR, 0, Math.PI * 2);
            cCtx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.85})`;
            cCtx.lineWidth = 1.8;
            cCtx.stroke();
          }

          cCtx.beginPath();
          cCtx.arc(x, y, isNodeActive ? 6.5 : 4.2, 0, Math.PI * 2);
          cCtx.fillStyle = isFault
            ? "#e08b58"
            : isNodeActive
              ? resolvedMode
                ? "#38bdf8"
                : "#3b82f6"
              : "#334155";
          cCtx.fill();
          cCtx.strokeStyle = "#090e1a";
          cCtx.lineWidth = 1.5;
          cCtx.stroke();

          if (cw >= 420) {
            cCtx.font = "600 10px 'Instrument Sans', system-ui, sans-serif";
            cCtx.fillStyle = isFault
              ? "#fbbf24"
              : isNodeActive
                ? "#f8fafc"
                : "rgba(203, 213, 225, 0.48)";
            cCtx.fillText(node.label, x + 10, y + 3.5);
          }
        }
      }

      // 2. SYNCHRONIZED OSCILLOSCOPE WAVEFORM CANVAS
      const sRect = scopeCanvas.getBoundingClientRect();
      if (sRect.width > 10 && sRect.height > 10) {
        const sw = sRect.width;
        const sh = sRect.height;
        if (scopeCanvas.width !== Math.round(sw * dpr) || scopeCanvas.height !== Math.round(sh * dpr)) {
          scopeCanvas.width = Math.round(sw * dpr);
          scopeCanvas.height = Math.round(sh * dpr);
        }
        sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        sCtx.fillStyle = "#090e1a";
        sCtx.fillRect(0, 0, sw, sh);

        // Scope divisions
        sCtx.strokeStyle = "rgba(148, 163, 184, 0.1)";
        sCtx.lineWidth = 1;
        for (let x = 0; x <= sw; x += 36) {
          sCtx.beginPath();
          sCtx.moveTo(x, 0);
          sCtx.lineTo(x, sh);
          sCtx.stroke();
        }
        for (let y = 0; y <= sh; y += 28) {
          sCtx.beginPath();
          sCtx.moveTo(0, y);
          sCtx.lineTo(sw, y);
          sCtx.stroke();
        }

        // Reference threshold dashed line
        sCtx.beginPath();
        sCtx.setLineDash([5, 5]);
        sCtx.moveTo(0, sh * 0.34);
        sCtx.lineTo(sw, sh * 0.34);
        sCtx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        sCtx.stroke();
        sCtx.setLineDash([]);

        // Signal trace
        sCtx.beginPath();
        for (let x = 0; x <= sw; x += 2) {
          const u = x / sw;
          const ph = tick * 0.045;
          let yNorm = 0.5;

          if (scenario.waveMode === "battery") {
            if (resolvedMode) {
              yNorm = 0.32 + Math.sin(u * 28 - ph * 2) * 0.025;
            } else {
              yNorm = 0.64 + Math.sin(u * 14 - ph) * 0.08 + Math.sin(u * 55 + ph * 3) * 0.05;
            }
          } else if (scenario.waveMode === "starter") {
            const crankWindow = Math.exp(-Math.pow((u - 0.42) * 5.5, 2));
            if (resolvedMode) {
              yNorm = 0.34 + crankWindow * 0.24 + Math.sin(u * 40 - ph * 2.5) * 0.018;
            } else {
              yNorm = 0.48 + crankWindow * 0.40 + Math.sin(u * 65 - ph * 4) * 0.07 * crankWindow;
            }
          } else if (scenario.waveMode === "lighting") {
            if (resolvedMode) {
              yNorm = 0.33 + Math.sin(u * 18 - ph) * 0.015;
            } else {
              const drop = Math.sin(u * 19 - ph * 2.2) > 0.35 ? 0.34 : 0;
              yNorm = 0.42 + drop + Math.sin(u * 90 + ph * 5) * 0.04;
            }
          } else {
            // harness / CAN square frames
            const sq = Math.sin(u * 34 - ph * 2.4) > 0 ? -0.16 : 0.16;
            if (resolvedMode) {
              yNorm = 0.5 + sq;
            } else {
              const glitch = Math.sin(u * 11 + ph * 1.7) > 0.25 ? 0.22 * Math.sin(u * 130) : 0;
              yNorm = 0.5 + sq * 0.55 + glitch;
            }
          }

          const py = Math.max(10, Math.min(sh - 10, yNorm * sh));
          if (x === 0) sCtx.moveTo(x, py);
          else sCtx.lineTo(x, py);
        }
        sCtx.strokeStyle = resolvedMode ? "#38bdf8" : "#e08b58";
        sCtx.lineWidth = 2.2;
        sCtx.stroke();
      }

      if (!reduced) {
        tick += 1;
        raf = window.requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scenario, resolvedMode]);

  return (
    <section
      id="simulasyon"
      ref={sectionRef}
      aria-labelledby="simulasyon-baslik"
      className="section diag-lab"
    >
      <div className="section__inner">
        <div className="diag-lab__header" data-lab-reveal>
          <div>
            <span aria-hidden="true" className="section-rule" />
            <h2 id="simulasyon-baslik" className="section-title">
              Canlı arıza ve sinyal simülatörü
            </h2>
            <p className="section-intro">
              Aracındaki belirti hangi elektrik hattından kaynaklanıyor? Alt sistemi seçip arıza
              anı ile onarım sonrası kararlı akışı karşılaştır.
            </p>
          </div>

          {/* State Toggle: Fault vs Repaired */}
          <div className="diag-mode-switch" role="group" aria-label="Simülasyon durumu">
            <button
              type="button"
              onClick={() => setResolvedMode(false)}
              aria-pressed={!resolvedMode}
              className={
                !resolvedMode
                  ? "diag-mode-switch__btn diag-mode-switch__btn--fault"
                  : "diag-mode-switch__btn"
              }
            >
              Arıza Belirtisi
            </button>
            <button
              type="button"
              onClick={() => setResolvedMode(true)}
              aria-pressed={resolvedMode}
              className={
                resolvedMode
                  ? "diag-mode-switch__btn diag-mode-switch__btn--healthy"
                  : "diag-mode-switch__btn"
              }
            >
              Onarım Sonrası
            </button>
          </div>
        </div>

        {/* 4 Subsystem Selector Tabs */}
        <div
          className="diag-tabs"
          role="tablist"
          aria-label="Araç elektrik alt sistemleri"
          data-lab-reveal
        >
          {SCENARIOS.map((item, idx) => {
            const selected = idx === activeIdx;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveIdx(idx);
                }}
                className={selected ? "diag-tab diag-tab--active" : "diag-tab"}
              >
                <span className="diag-tab__code">{item.code}</span>
                <span className="diag-tab__name">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Bento Grid: Vehicle X-Ray Frame Animator + Oscilloscope & Explanation */}
        <div className="diag-bento" data-lab-reveal>
          <div className="diag-bento__xray">
            <div className="diag-panel-bar">
              <span>ŞASİ TESİSAT RÖNTGENİ // AKIM YÖNÜ</span>
              <span
                className={
                  resolvedMode
                    ? "diag-status-pill diag-status-pill--ok"
                    : "diag-status-pill diag-status-pill--warn"
                }
              >
                {resolvedMode ? "HAT KARARLI" : "ARIZA NOKTASI AKTİF"}
              </span>
            </div>
            <canvas
              ref={chassisCanvasRef}
              role="img"
              aria-label={`${scenario.title} için şasi kablo tesisatı ve akım akışı simülasyonu`}
              className="diag-xray-canvas"
            />
          </div>

          <div className="diag-bento__right">
            <div className="diag-scope-card">
              <div className="diag-panel-bar">
                <span>OSİLOSKOP EĞRİSİ</span>
                <strong className="tabular diag-scope-card__volt">
                  {resolvedMode ? scenario.healthyVoltage : scenario.faultVoltage}
                </strong>
              </div>
              <canvas
                ref={scopeCanvasRef}
                role="img"
                aria-label={`${scenario.title} gerilim dalga formu`}
                className="diag-scope-canvas"
              />
              <p className="diag-scope-card__metric tabular">
                {resolvedMode ? scenario.healthyMetric : scenario.faultMetric}
              </p>
            </div>

            <div className="diag-explain-card" aria-live="polite">
              <p className="diag-explain-card__kicker">
                {resolvedMode ? "ONARIM & DOĞRULAMA SONUCU" : "NEDEN BU BELİRTİ OLUŞUR?"}
              </p>
              <h3 className="diag-explain-card__title">{scenario.title}</h3>
              <p className="diag-explain-card__body">
                {resolvedMode ? scenario.healthySummary : scenario.faultSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
