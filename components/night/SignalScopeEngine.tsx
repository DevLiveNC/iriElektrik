"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BAND_COUNT = 16;
const FFT_SIZE = 1024;

const ICE = "#f3f6f8";
const COPPER = "#a95a32";
const GRAPHITE = "#16181c";
const ASPHALT = "#2a2d33";

/** Sabit, tekrarlanabilir örnek desen (ses yokken gösterilen ölçer). */
const STATIC_PATTERN = [
  0.18, 0.24, 0.31, 0.42, 0.55, 0.68, 0.74, 0.63, 0.52, 0.44, 0.36, 0.29, 0.22, 0.17, 0.12, 0.08,
];

function createSignalBuffer(context: AudioContext): AudioBuffer {
  const duration = 2.6;
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  let seed = 20260211;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  };

  let lowpass = 0;
  for (let i = 0; i < length; i += 1) {
    const t = i / context.sampleRate;
    const attack = Math.min(1, t / 0.04);
    const release = Math.min(1, (duration - t) / 0.4);
    const envelope = attack * release;

    const base = 88 + 26 * Math.sin(t * 1.7);
    const tone = Math.sin(2 * Math.PI * base * t) * 0.34;
    const harmonic = Math.sin(2 * Math.PI * base * 2.02 * t) * 0.13;
    const sweep = Math.sin(2 * Math.PI * (220 + 1400 * t) * t) * 0.08 * Math.sin(t * 2.2);

    lowpass = lowpass * 0.88 + noise() * 0.12;
    const grain = lowpass * 0.22;

    const beatPhase = (t * 3.5) % 1;
    const tick = beatPhase < 0.05 ? 0.16 : 0;

    data[i] = (tone + harmonic + sweep + grain + tick) * envelope * 0.72;
  }

  return buffer;
}

export default function SignalScopeEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const [announcement, setAnnouncement] = useState("Örnek sinyal durduruldu.");

  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number>(0);
  const peaksRef = useRef<Float32Array>(new Float32Array(BAND_COUNT));
  const reducedRef = useRef(false);

  const paint = useCallback((values: ArrayLike<number>, peaks: ArrayLike<number>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    context.fillStyle = GRAPHITE;
    context.fillRect(0, 0, width, height);

    const paddingX = 14;
    const paddingTop = 16;
    const paddingBottom = 22;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingTop - paddingBottom;

    context.strokeStyle = ASPHALT;
    context.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const y = paddingTop + (plotHeight / 4) * i;
      context.beginPath();
      context.moveTo(paddingX, Math.round(y) + 0.5);
      context.lineTo(paddingX + plotWidth, Math.round(y) + 0.5);
      context.stroke();
    }

    const slot = plotWidth / BAND_COUNT;
    const barWidth = Math.max(3, slot - 6);

    for (let i = 0; i < BAND_COUNT; i += 1) {
      const value = Math.max(0, Math.min(1, values[i] ?? 0));
      const barHeight = value * plotHeight;
      const x = paddingX + slot * i + (slot - barWidth) / 2;
      const y = paddingTop + plotHeight - barHeight;

      const gradient = context.createLinearGradient(0, y, 0, paddingTop + plotHeight);
      gradient.addColorStop(0, ICE);
      gradient.addColorStop(1, "rgba(243, 246, 248, 0.32)");
      context.fillStyle = gradient;
      context.fillRect(x, y, barWidth, barHeight);

      const peak = Math.max(0, Math.min(1, peaks[i] ?? 0));
      const peakY = paddingTop + plotHeight - peak * plotHeight;
      context.fillStyle = COPPER;
      context.fillRect(x, Math.max(paddingTop - 4, peakY - 2), barWidth, 2);
    }

    context.fillStyle = "rgba(139, 134, 128, 0.9)";
    context.font = "10px 'IBM Plex Mono', ui-monospace, monospace";
    context.textBaseline = "alphabetic";
    for (let i = 0; i < BAND_COUNT; i += 4) {
      const label = String(60 * Math.pow(2, (i / BAND_COUNT) * 6)).padStart(4, " ");
      context.fillText(`${label}Hz`, paddingX + slot * i, height - 8);
    }
    context.fillText("16 BAND", paddingX + plotWidth - 52, height - 8);
  }, []);

  const paintStatic = useCallback(() => {
    const peaks = STATIC_PATTERN.map((value) => Math.min(1, value + 0.12));
    paint(STATIC_PATTERN, peaks);
  }, [paint]);

  const stop = useCallback(() => {
    const source = sourceRef.current;
    if (source) {
      try {
        source.stop();
      } catch {
        /* Zaten durmuş olabilir. */
      }
      source.disconnect();
      sourceRef.current = null;
    }
    window.cancelAnimationFrame(frameRef.current);
    analyserRef.current = null;
    setPlaying(false);
    setAnnouncement("Örnek sinyal durduruldu.");
  }, []);

  const play = useCallback(async () => {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      setSupported(false);
      setAnnouncement("Tarayıcı ses analizini desteklemiyor. Statik ölçer gösteriliyor.");
      paintStatic();
      return;
    }

    try {
      if (!contextRef.current) {
        contextRef.current = new AudioContextCtor();
      }
      const context = contextRef.current;
      if (context.state === "suspended") await context.resume();

      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.72;

      const gain = context.createGain();
      gain.gain.value = 0.6;

      const source = context.createBufferSource();
      source.buffer = createSignalBuffer(context);
      source.loop = true;
      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(context.destination);
      source.start();

      sourceRef.current = source;
      analyserRef.current = analyser;
      setPlaying(true);
      setAnnouncement("Örnek sinyal çalıyor.");

      if (reducedRef.current) {
        paintStatic();
        return;
      }

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const peaks = peaksRef.current;
      const values = new Array<number>(BAND_COUNT).fill(0);

      const loop = () => {
        const activeAnalyser = analyserRef.current;
        if (!activeAnalyser) return;
        activeAnalyser.getByteFrequencyData(frequencyData);

        const usable = Math.floor(frequencyData.length * 0.62);
        for (let band = 0; band < BAND_COUNT; band += 1) {
          const from = Math.floor(Math.pow(band / BAND_COUNT, 1.7) * usable);
          const to = Math.max(
            from + 1,
            Math.floor(Math.pow((band + 1) / BAND_COUNT, 1.7) * usable),
          );
          let max = 0;
          for (let i = from; i < to && i < usable; i += 1) {
            const value = frequencyData[i];
            if (value > max) max = value;
          }
          const normalized = max / 255;
          values[band] = normalized;
          peaks[band] = Math.max(peaks[band] - 0.008, normalized);
        }

        paint(values, peaks);
        frameRef.current = window.requestAnimationFrame(loop);
      };

      frameRef.current = window.requestAnimationFrame(loop);
    } catch {
      setSupported(false);
      setAnnouncement("Ses çalıştırılamadı. Statik ölçer gösteriliyor.");
      paintStatic();
    }
  }, [paint, paintStatic]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    paintStatic();
  }, [paintStatic]);

  useEffect(() => {
    const onResize = () => {
      if (!playing) paintStatic();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frameRef.current);
      sourceRef.current?.stop?.();
      void contextRef.current?.close();
    };
  }, [playing, paintStatic]);

  return (
    <div className="scope">
      <div className="scope__canvas-wrap">
        <canvas ref={canvasRef} className="scope__canvas" role="img" aria-label="Örnek sinyal ölçeri" />
      </div>

      <div className="scope__legend">
        <span>
          <i /> 16 bant ölçer
        </span>
        <span>
          <i className="is-peak" /> tepe tutma
        </span>
        <span>FFT 1024</span>
      </div>

      <div className="scope__controls">
        <button
          type="button"
          className="button button--primary"
          onClick={() => void play()}
          aria-pressed={playing}
          disabled={playing}
        >
          Örnek sinyal dalgasını dinle
        </button>
        <button
          type="button"
          className="button button--metal"
          onClick={stop}
          disabled={!playing}
        >
          Durdur
        </button>
        <span className="scope__status" role="status" aria-live="polite">
          {announcement}
        </span>
      </div>

      {!supported ? (
        <p className="scope__caption">
          Bu tarayıcıda ses analizi kullanılamıyor; statik ölçer gösteriliyor. Örnek sinyal, ürün
          sesi değildir.
        </p>
      ) : (
        <p className="scope__caption">Örnek sinyal, ürün sesi değildir.</p>
      )}
    </div>
  );
}
