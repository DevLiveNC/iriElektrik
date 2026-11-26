"use client";

import { useEffect, useRef, useState } from "react";

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * İki far huzmesi (buz beyazı ana huzme, daha sıcak omuz huzmesi),
 * kaydırmayla ilerleyen tek bir uzun far süpürmesi, sonra sabit çalışma
 * lambası ve huzme içinde ince toz zerreleri.
 */
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uRes;
uniform float uProg;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float beam(vec2 p, vec2 origin, vec2 dir, float spread, float len) {
  vec2 d = p - origin;
  float t = dot(d, dir);
  if (t <= 0.0) return 0.0;
  float perp = abs(d.x * dir.y - d.y * dir.x);
  float width = max(spread * t, 0.001);
  float core = 1.0 - smoothstep(0.0, width, perp);
  float fall = exp(-t * len);
  return core * fall;
}

void main() {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);

  float prog = clamp(uProg, 0.0, 1.0);
  float dipped = 1.0 - smoothstep(0.16, 0.40, prog);
  float sweep = smoothstep(0.20, 0.40, prog) * (1.0 - smoothstep(0.60, 0.78, prog));
  float work = smoothstep(0.58, 0.80, prog);

  vec2 origin = vec2(0.0, 0.14);
  float mainBeam = beam(p, origin + vec2(-0.15, 0.0), normalize(vec2(-0.30, 1.0)), 0.40, 1.30);
  float shoulder = beam(p, origin + vec2(0.17, 0.0), normalize(vec2(0.26, 0.94)), 0.28, 1.55);

  float strength = 0.55 + 0.45 * dipped;

  vec3 col = vec3(0.0);
  col += vec3(0.78, 0.89, 1.0) * mainBeam * (0.80 * strength + 0.55 * sweep);
  col += vec3(1.0, 0.80, 0.55) * shoulder * (0.50 * strength + 0.40 * sweep);

  // tek uzun far süpürmesi
  float sweepX = mix(-0.85, 0.85, clamp((prog - 0.20) / 0.40, 0.0, 1.0));
  float band = exp(-pow((p.x - sweepX) * 3.1, 2.0)) * smoothstep(0.02, 0.42, p.y);
  col += vec3(0.93, 0.96, 1.0) * band * 0.50 * sweep;

  // servis bölmesi çalışma lambası
  float wd = length(p - vec2(0.16, 1.02));
  col += vec3(1.0, 0.79, 0.50) * exp(-wd * 1.55) * 0.50 * work;

  // huzme içi toz
  float grain = hash(floor(p * 240.0 + vec2(uTime * 0.4, -uTime * 0.25)));
  float sparkle = step(0.9974, grain) * (mainBeam + shoulder) * 0.85;
  col += vec3(1.0, 0.95, 0.86) * sparkle;

  col = clamp(col, 0.0, 1.0);
  float alpha = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroBeamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });

    if (!gl) {
      setFallback(true);
      return;
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      setFallback(true);
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uProg = gl.getUniformLocation(program, "uProg");
    const uTime = gl.getUniformLocation(program, "uTime");

    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    let raf = 0;
    let running = true;
    let visible = true;
    let disposed = false;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const hero = canvas.closest<HTMLElement>("[data-beam-hero]");
    const frame = canvas.closest<HTMLElement>("[data-beam-frame]");

    const readProgress = () => {
      if (!hero) return 0;
      const rect = hero.getBoundingClientRect();
      const total = Math.max(rect.height, 1);
      return Math.min(1, Math.max(0, -rect.top / total));
    };

    const draw = (time: number) => {
      if (!running) return;
      resize();
      const progress = readProgress();
      if (frame) {
        frame.style.setProperty("--beam-progress", progress.toFixed(3));
      }
      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uTime, time / 1000);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = window.requestAnimationFrame(draw);
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      running = false;
      window.cancelAnimationFrame(raf);
      setFallback(true);
    };

    canvas.addEventListener("webglcontextlost", onLost);

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible === visible) return;
        visible = isVisible;
        if (visible && running) {
          raf = window.requestAnimationFrame(draw);
        } else {
          window.cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    if (hero) observer.observe(hero);

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
      } else if (visible && running) {
        raf = window.requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (disposed) return;
    };
  }, []);

  if (fallback) {
    return <div aria-hidden="true" className="cinema__beam--fallback" />;
  }

  return <canvas aria-hidden="true" ref={canvasRef} className="cinema__beam" />;
}
