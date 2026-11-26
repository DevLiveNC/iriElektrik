#!/usr/bin/env node
/**
 * V2 Studio PBR Metallic HDRI + 2x2 SSAA 3D Cutaway Frame Sequence Renderer
 * Renders 72 razor-sharp WebP frames (960x540 from 1920x1080 SSAA) of an
 * Exploded Automotive Alternator & 3-Phase Copper Stator Assembly.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const OUT_DIR = join(process.cwd(), "public", "sequences", "alternator");
mkdirSync(OUT_DIR, { recursive: true });

const OUT_W = 960;
const OUT_H = 540;
const SS = 2; // 2x2 Supersampling Anti-Aliasing (1920x1080 internal)
const WIDTH = OUT_W * SS;
const HEIGHT = OUT_H * SS;
const TOTAL_FRAMES = 72;

const MAT_ALUMINUM = 1;
const MAT_STEEL = 2;
const MAT_COPPER = 3;
const MAT_COPPER_ENERGIZED = 4;
const MAT_LAMINATION = 5;
const MAT_COBALT = 6;
const MAT_CARBON = 7;

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function norm(a) {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

class CADMesh {
  constructor() {
    this.tris = [];
  }

  pushQuadOutward(p0, p1, p2, p3, refCenter, mat, partId, phase = 0, ao0 = 1, ao1 = 1) {
    const mid = [
      (p0[0] + p1[0] + p2[0] + p3[0]) * 0.25,
      (p0[1] + p1[1] + p2[1] + p3[1]) * 0.25,
      (p0[2] + p1[2] + p2[2] + p3[2]) * 0.25,
    ];
    let fn = norm(cross(sub(p1, p0), sub(p2, p0)));
    const out = sub(mid, refCenter);
    if (dot(fn, out) < 0) {
      fn = [-fn[0], -fn[1], -fn[2]];
      this.tris.push({ p0, p1: p3, p2: p2, n0: fn, n1: fn, n2: fn, mat, partId, phase, ao0, ao1: ao1, ao2: ao1 });
      this.tris.push({ p0, p1: p2, p2: p1, n0: fn, n1: fn, n2: fn, mat, partId, phase, ao0, ao1: ao1, ao2: ao0 });
    } else {
      this.tris.push({ p0, p1, p2, n0: fn, n1: fn, n2: fn, mat, partId, phase, ao0, ao1: ao0, ao2: ao1 });
      this.tris.push({ p0, p1: p2, p2: p3, n0: fn, n1: fn, n2: fn, mat, partId, phase, ao0, ao1: ao1, ao2: ao1 });
    }
  }

  /**
   * Smoothly shaded lathe around X-axis with mathematically verified outward smooth normals!
   * profile: array of [x, r, ao?]
   */
  addLathe(profile, segments, mat, partId, centerX, angleOffset = 0, arcSpan = Math.PI * 2, phase = 0) {
    // Compute smooth 2D outward normals at each profile vertex
    const profNormals = [];
    for (let i = 0; i < profile.length - 1; i++) {
      const [x0, r0] = profile[i];
      const [x1, r1] = profile[i + 1];
      const midX = (x0 + x1) * 0.5;
      const midR = (r0 + r1) * 0.5;
      let nx = -(r1 - r0);
      let nr = x1 - x0;
      const l = Math.hypot(nx, nr) || 1;
      nx /= l;
      nr /= l;
      // Verify outward relative to (centerX, 0)
      if (nx * (midX - centerX) + nr * midR < 0) {
        nx = -nx;
        nr = -nr;
      }
      profNormals.push([nx, nr]);
    }

    // Smoothly blend adjacent segment normals unless sharp crease (> 50 deg)
    const vtxNormals = profile.map((_, idx) => {
      if (idx === 0) return profNormals[0];
      if (idx === profile.length - 1) return profNormals[profNormals.length - 1];
      const nPrev = profNormals[idx - 1];
      const nNext = profNormals[idx];
      if (nPrev[0] * nNext[0] + nPrev[1] * nNext[1] > 0.55) {
        const sx = nPrev[0] + nNext[0];
        const sr = nPrev[1] + nNext[1];
        const l = Math.hypot(sx, sr) || 1;
        return [sx / l, sr / l];
      }
      return null; // sharp chamfer edge -> use segment face normal
    });

    for (let s = 0; s < segments; s++) {
      const a0 = angleOffset + (s / segments) * arcSpan;
      const a1 = angleOffset + ((s + 1) / segments) * arcSpan;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);

      for (let i = 0; i < profile.length - 1; i++) {
        const [x0, r0, aoA = 1] = profile[i];
        const [x1, r1, aoB = 1] = profile[i + 1];
        if (r0 < 1e-4 && r1 < 1e-4) continue;

        const segN = profNormals[i];
        const vn0 = vtxNormals[i] || segN;
        const vn1 = vtxNormals[i + 1] || segN;

        const p00 = [x0, r0 * c0, r0 * s0];
        const p01 = [x0, r0 * c1, r0 * s1];
        const p11 = [x1, r1 * c1, r1 * s1];
        const p10 = [x1, r1 * c0, r1 * s0];

        const n00 = norm([vn0[0], vn0[1] * c0, vn0[1] * s0]);
        const n01 = norm([vn0[0], vn0[1] * c1, vn0[1] * s1]);
        const n11 = norm([vn1[0], vn1[1] * c1, vn1[1] * s1]);
        const n10 = norm([vn1[0], vn1[1] * c0, vn1[1] * s0]);

        // Ensure counter-clockwise winding matches normal direction
        const testCross = cross(sub(p10, p00), sub(p11, p00));
        if (dot(testCross, n00) >= 0) {
          this.tris.push({ p0: p00, p1: p10, p2: p11, n0: n00, n1: n10, n2: n11, mat, partId, phase, ao0: aoA, ao1: aoB, ao2: aoB });
          this.tris.push({ p0: p00, p1: p11, p2: p01, n0: n00, n1: n11, n2: n01, mat, partId, phase, ao0: aoA, ao1: aoB, ao2: aoA });
        } else {
          this.tris.push({ p0: p00, p1: p11, p2: p10, n0: n00, n1: n11, n2: n10, mat, partId, phase, ao0: aoA, ao1: aoB, ao2: aoB });
          this.tris.push({ p0: p00, p1: p01, p2: p11, n0: n00, n1: n01, n2: n11, mat, partId, phase, ao0: aoA, ao1: aoA, ao2: aoB });
        }
      }
    }
  }

  /**
   * Add a smooth cylindrical tube along arbitrary axis A -> B (great for copper coil loops, studs, bolts!)
   */
  addTube(a, b, radius, segs, mat, partId, phase = 0, ao = 0.92, capEnds = true) {
    const axis = norm(sub(b, a));
    const upRef = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = norm(cross(axis, upRef));
    const v = norm(cross(axis, u));

    for (let s = 0; s < segs; s++) {
      const th0 = (s / segs) * Math.PI * 2;
      const th1 = ((s + 1) / segs) * Math.PI * 2;
      const d0 = [
        u[0] * Math.cos(th0) + v[0] * Math.sin(th0),
        u[1] * Math.cos(th0) + v[1] * Math.sin(th0),
        u[2] * Math.cos(th0) + v[2] * Math.sin(th0),
      ];
      const d1 = [
        u[0] * Math.cos(th1) + v[0] * Math.sin(th1),
        u[1] * Math.cos(th1) + v[1] * Math.sin(th1),
        u[2] * Math.cos(th1) + v[2] * Math.sin(th1),
      ];
      const p00 = add(a, [d0[0] * radius, d0[1] * radius, d0[2] * radius]);
      const p01 = add(a, [d1[0] * radius, d1[1] * radius, d1[2] * radius]);
      const p11 = add(b, [d1[0] * radius, d1[1] * radius, d1[2] * radius]);
      const p10 = add(b, [d0[0] * radius, d0[1] * radius, d0[2] * radius]);

      const tc = cross(sub(p10, p00), sub(p11, p00));
      if (dot(tc, d0) >= 0) {
        this.tris.push({ p0: p00, p1: p10, p2: p11, n0: d0, n1: d0, n2: d1, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
        this.tris.push({ p0: p00, p1: p11, p2: p01, n0: d0, n1: d1, n2: d1, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
      } else {
        this.tris.push({ p0: p00, p1: p11, p2: p10, n0: d0, n1: d1, n2: d0, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
        this.tris.push({ p0: p00, p1: p01, p2: p11, n0: d0, n1: d1, n2: d1, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
      }

      if (capEnds) {
        const nA = [-axis[0], -axis[1], -axis[2]];
        const nB = axis;
        this.tris.push({ p0: a, p1: p01, p2: p00, n0: nA, n1: nA, n2: nA, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
        this.tris.push({ p0: b, p1: p10, p2: p11, n0: nB, n1: nB, n2: nB, mat, partId, phase, ao0: ao, ao1: ao, ao2: ao });
      }
    }
  }

  /**
   * Tapered radial claw/blade/boss with verified outward normals
   */
  addTaperedRadialBlock(x0, x1, r0a, r1a, w0, r0b, r1b, w1, theta, mat, partId, phase = 0, ao = 0.88) {
    const ct = Math.cos(theta), st = Math.sin(theta);
    const pt = (x, r, t) => [x, r * ct - t * st, r * st + t * ct];

    const f00 = pt(x0, r0a, -w0);
    const f01 = pt(x0, r0a, w0);
    const f11 = pt(x0, r1a, w0);
    const f10 = pt(x0, r1a, -w0);

    const b00 = pt(x1, r0b, -w1);
    const b01 = pt(x1, r0b, w1);
    const b11 = pt(x1, r1b, w1);
    const b10 = pt(x1, r1b, -w1);

    const center = pt((x0 + x1) * 0.5, (r0a + r1a + r0b + r1b) * 0.25, 0);
    this.pushQuadOutward(f00, f01, f11, f10, center, mat, partId, phase, ao, ao);
    this.pushQuadOutward(b00, b10, b11, b01, center, mat, partId, phase, ao, ao);
    this.pushQuadOutward(f10, f11, b11, b10, center, mat, partId, phase, 1.0, 1.0);
    this.pushQuadOutward(f00, b00, b01, f01, center, mat, partId, phase, 0.55, 0.55);
    this.pushQuadOutward(f01, f11, b11, b01, center, mat, partId, phase, ao, ao);
    this.pushQuadOutward(f00, f10, b10, b00, center, mat, partId, phase, ao, ao);
  }
}

function buildAssembly() {
  const m = new CADMesh();

  // =========================================================================
  // PART 0: PRECISION MACHINED SERPENTINE PULLEY & ANODIZED LOCK NUT
  // =========================================================================
  const pulleyProf = [
    [-1.44, 0.00, 0.7],
    [-1.44, 0.20, 0.85],
    [-1.36, 0.20, 0.55],
    [-1.36, 0.40, 0.65],
    [-1.41, 0.43, 0.95],
    [-1.41, 0.58, 1.0],
    [-1.34, 0.58, 1.0],
    [-1.31, 0.50, 0.45],
    [-1.28, 0.57, 0.98],
    [-1.25, 0.50, 0.45],
    [-1.22, 0.57, 0.98],
    [-1.19, 0.50, 0.45],
    [-1.16, 0.57, 0.98],
    [-1.13, 0.50, 0.45],
    [-1.10, 0.57, 0.98],
    [-1.07, 0.50, 0.45],
    [-1.04, 0.58, 1.0],
    [-0.98, 0.58, 1.0],
    [-0.98, 0.28, 0.75],
    [-0.92, 0.28, 0.70],
    [-0.92, 0.00, 0.60],
  ];
  m.addLathe(pulleyProf, 56, MAT_STEEL, 0, -1.18);
  // Hex cobalt spindle nut
  m.addLathe(
    [
      [-1.53, 0.00, 1.0],
      [-1.53, 0.13, 1.0],
      [-1.43, 0.15, 0.9],
      [-1.43, 0.00, 0.8],
    ],
    6,
    MAT_COBALT,
    0,
    -1.48,
  );

  // =========================================================================
  // PART 1: DIE-CAST ALUMINUM DRIVE-END HOUSING WITH VENT WINDOWS & MOUNTS
  // =========================================================================
  // Front bearing nose cone
  m.addLathe(
    [
      [-0.90, 0.26, 0.75],
      [-0.90, 0.64, 0.98],
      [-0.78, 0.78, 0.98],
      [-0.74, 0.74, 0.72],
      [-0.82, 0.56, 0.65],
      [-0.82, 0.26, 0.65],
      [-0.90, 0.26, 0.75],
    ],
    52,
    MAT_ALUMINUM,
    1,
    -0.84,
  );
  // Rear bolting flange ring
  m.addLathe(
    [
      [-0.27, 0.98, 0.75],
      [-0.27, 1.15, 1.0],
      [-0.15, 1.16, 1.0],
      [-0.15, 0.98, 0.75],
      [-0.27, 0.98, 0.75],
    ],
    56,
    MAT_ALUMINUM,
    1,
    -0.21,
  );
  // 10 Sculpted Cast Ribs bridging nose cone to bolting flange (leaving clean cutaway windows!)
  for (let r = 0; r < 10; r++) {
    const th = (r / 10) * Math.PI * 2;
    m.addTaperedRadialBlock(-0.80, -0.24, 0.71, 0.80, 0.09, 1.00, 1.14, 0.11, th, MAT_ALUMINUM, 1, 0, 0.94);
  }
  // 3 Machined Mounting Bosses + Cobalt Flange Bolts
  for (const ang of [0.52, 2.62, 4.48]) {
    const cy = Math.cos(ang), cz = Math.sin(ang);
    m.addTube([-0.38, cy * 1.24, cz * 1.24], [-0.12, cy * 1.24, cz * 1.24], 0.14, 20, MAT_ALUMINUM, 1, 0, 0.95);
    m.addTaperedRadialBlock(-0.32, -0.15, 1.08, 1.24, 0.11, 1.08, 1.24, 0.11, ang, MAT_ALUMINUM, 1, 0, 0.85);
    m.addTube([-0.43, cy * 1.24, cz * 1.24], [-0.09, cy * 1.24, cz * 1.24], 0.065, 6, MAT_COBALT, 1, 0, 1.0);
  }

  // =========================================================================
  // PART 2: STAMPED STEEL CENTRIFUGAL COOLING FAN
  // =========================================================================
  m.addLathe(
    [
      [-0.63, 0.20, 0.7],
      [-0.63, 0.76, 0.95],
      [-0.59, 0.76, 0.95],
      [-0.59, 0.20, 0.7],
      [-0.63, 0.20, 0.7],
    ],
    44,
    MAT_STEEL,
    2,
    -0.61,
  );
  for (let b = 0; b < 16; b++) {
    const th = (b / 16) * Math.PI * 2;
    m.addTaperedRadialBlock(-0.62, -0.48, 0.44, 0.82, 0.022, 0.48, 0.85, 0.018, th, MAT_STEEL, 2, 0, 0.9);
  }

  // =========================================================================
  // PART 3: FORGED CLAW-POLE ROTOR ("PENÇE KUTUP ROTOR"), FIELD COIL & SLIP RINGS
  // =========================================================================
  // Precision ground steel rotor shaft
  m.addLathe(
    [
      [-1.08, 0.00, 0.8],
      [-1.08, 0.135, 0.95],
      [1.16, 0.135, 0.95],
      [1.16, 0.00, 0.8],
    ],
    36,
    MAT_STEEL,
    3,
    0.04,
  );
  // Inner copper rotor field coil visible between the interlocking claws!
  m.addLathe(
    [
      [-0.34, 0.22, 0.5],
      [-0.34, 0.56, 0.78],
      [0.34, 0.56, 0.78],
      [0.34, 0.22, 0.5],
      [-0.34, 0.22, 0.5],
    ],
    44,
    MAT_COPPER,
    3,
    0.0,
  );
  // Rotor pole end-discs
  m.addLathe(
    [
      [-0.43, 0.14, 0.7],
      [-0.43, 0.74, 0.95],
      [-0.34, 0.76, 0.95],
      [-0.34, 0.14, 0.7],
      [-0.43, 0.14, 0.7],
    ],
    44,
    MAT_STEEL,
    3,
    -0.385,
  );
  m.addLathe(
    [
      [0.34, 0.14, 0.7],
      [0.34, 0.76, 0.95],
      [0.43, 0.74, 0.95],
      [0.43, 0.14, 0.7],
      [0.34, 0.14, 0.7],
    ],
    44,
    MAT_STEEL,
    3,
    0.385,
  );
  // 8 + 8 True Tapered Interlocking Claw-Pole Fingers!
  const nClaws = 8;
  for (let c = 0; c < nClaws; c++) {
    const aL = (c / nClaws) * Math.PI * 2;
    const aR = ((c + 0.5) / nClaws) * Math.PI * 2;
    // Left pole finger tapering from wide base (w=0.13) to narrow tip (w=0.045)
    m.addTaperedRadialBlock(-0.36, 0.28, 0.60, 0.76, 0.125, 0.64, 0.755, 0.042, aL, MAT_STEEL, 3, 0, 0.94);
    // Right pole finger tapering opposite way!
    m.addTaperedRadialBlock(-0.28, 0.36, 0.64, 0.755, 0.042, 0.60, 0.76, 0.125, aR, MAT_STEEL, 3, 0, 0.94);
  }
  // Insulator collar + Twin Burnished Copper Slip Rings ("Bakır Bilezikler")
  m.addLathe(
    [
      [0.58, 0.135, 0.7],
      [0.58, 0.21, 0.8],
      [0.98, 0.21, 0.8],
      [0.98, 0.135, 0.7],
      [0.58, 0.135, 0.7],
    ],
    32,
    MAT_CARBON,
    3,
    0.78,
  );
  for (const sx of [0.63, 0.81]) {
    m.addLathe(
      [
        [sx, 0.20, 0.85],
        [sx, 0.255, 1.0],
        [sx + 0.12, 0.255, 1.0],
        [sx + 0.12, 0.20, 0.85],
        [sx, 0.20, 0.85],
      ],
      36,
      MAT_COPPER,
      3,
      sx + 0.06,
    );
  }

  // =========================================================================
  // PART 4: LAMINATED SILICON-STEEL STATOR CORE + 24 MOLTEN COPPER WINDING LOOPS
  // =========================================================================
  // Stacked silicon-steel stator core with visible lamination ribs!
  const statorProf = [[ -0.38, 0.86, 0.65 ], [ -0.38, 1.11, 0.95 ]];
  const lamSteps = 10;
  for (let l = 0; l < lamSteps; l++) {
    const lx0 = -0.38 + (l / lamSteps) * 0.76;
    const lxMid = lx0 + (0.38 / lamSteps);
    const lx1 = lx0 + (0.76 / lamSteps);
    statorProf.push([lxMid, 1.135, 1.0]);
    statorProf.push([lx1, 1.105, 0.72]);
  }
  statorProf.push([0.38, 0.86, 0.65]);
  statorProf.push([-0.38, 0.86, 0.65]);
  m.addLathe(statorProf, 60, MAT_LAMINATION, 4, 0.0);

  // 24 Stator Teeth + Cylindrical Multi-Strand Enameled Copper End-Winding Hairpins!
  const slots = 24;
  for (let k = 0; k < slots; k++) {
    const th = (k / slots) * Math.PI * 2;
    const thNext = ((k + 1) / slots) * Math.PI * 2;
    const thMid = (th + thNext) * 0.5;
    const phase = k % 3;

    // Laminated iron stator tooth pointing inward
    m.addTaperedRadialBlock(-0.37, 0.37, 0.79, 0.88, 0.032, 0.79, 0.88, 0.032, th, MAT_LAMINATION, 4, 0, 0.75);

    // Dual concentric copper coil bundles inside slot + arched end-turns on BOTH sides!
    for (const rLayer of [0.85, 0.94]) {
      const yA = Math.cos(thMid) * rLayer;
      const zA = Math.sin(thMid) * rLayer;
      const yCrown = Math.cos(thMid + 0.09) * (rLayer + 0.025);
      const zCrown = Math.sin(thMid + 0.09) * (rLayer + 0.025);

      // Axial slot conductor
      m.addTube([-0.42, yA, zA], [0.42, yA, zA], 0.044, 10, MAT_COPPER_ENERGIZED, 4, phase, 0.92, false);
      // Front copper hairpin crown arch
      m.addTube([-0.42, yA, zA], [-0.55, yCrown, zCrown], 0.044, 10, MAT_COPPER_ENERGIZED, 4, phase, 0.98, true);
      // Rear copper hairpin crown arch
      m.addTube([0.42, yA, zA], [0.55, yCrown, zCrown], 0.044, 10, MAT_COPPER_ENERGIZED, 4, phase, 0.98, true);
    }
  }

  // =========================================================================
  // PART 5: 3-PHASE RECTIFIER BRIDGE ("DİYOT KÖPRÜSÜ") & REGULATOR ("KONJEKTÖR")
  // =========================================================================
  // Positive & Negative finned aluminum/cobalt rectifier plates
  m.addLathe(
    [
      [0.60, 0.44, 0.75],
      [0.60, 0.97, 0.98],
      [0.68, 0.97, 0.98],
      [0.68, 0.44, 0.75],
      [0.60, 0.44, 0.75],
    ],
    40,
    MAT_ALUMINUM,
    5,
    0.64,
    0.50,
    Math.PI * 1.48,
  );
  m.addLathe(
    [
      [0.73, 0.48, 0.78],
      [0.73, 0.92, 1.0],
      [0.81, 0.92, 1.0],
      [0.81, 0.48, 0.78],
      [0.73, 0.48, 0.78],
    ],
    36,
    MAT_COBALT,
    5,
    0.77,
    0.58,
    Math.PI * 1.40,
  );
  // 6 Cylindrical Copper Press-Fit Power Diodes + Leads
  for (let d = 0; d < 6; d++) {
    const dAng = 0.78 + d * 0.72;
    const dy = Math.cos(dAng) * 0.71;
    const dz = Math.sin(dAng) * 0.71;
    m.addTube([0.55, dy, dz], [0.87, dy, dz], 0.068, 16, MAT_COPPER, 5, d % 3, 0.96, true);
  }
  // Voltage Regulator Module ("Konjektör") + Carbon Brush Holder ("Kömür Yuvası")
  m.addTaperedRadialBlock(0.58, 0.93, 0.28, 0.88, 0.22, 0.28, 0.86, 0.20, 0.0, MAT_CARBON, 5, 0, 0.9);
  // Regulator aluminum heatsink fins
  for (let f = -2; f <= 2; f++) {
    m.addTaperedRadialBlock(0.62, 0.91, 0.86, 0.97, 0.016, 0.86, 0.97, 0.016, f * 0.075, MAT_ALUMINUM, 5, 0, 0.92);
  }
  // Twin Copper-Graphite Brushes ("Kömürler") aligned with slip rings
  m.addTaperedRadialBlock(0.65, 0.73, 0.22, 0.32, 0.042, 0.22, 0.32, 0.042, 0.0, MAT_COPPER_ENERGIZED, 5, 1, 0.95);
  m.addTaperedRadialBlock(0.83, 0.91, 0.22, 0.32, 0.042, 0.22, 0.32, 0.042, 0.0, MAT_COPPER_ENERGIZED, 5, 2, 0.95);
  // Heavy Copper B+ Output Terminal Stud + Cobalt Insulator
  const bAng = 2.15;
  const by = Math.cos(bAng) * 0.78, bz = Math.sin(bAng) * 0.78;
  m.addTube([0.76, by, bz], [1.26, by, bz], 0.055, 16, MAT_COPPER_ENERGIZED, 5, 0, 1.0, true);
  m.addTube([0.82, by, bz], [0.98, by, bz], 0.095, 8, MAT_COBALT, 5, 0, 0.95, true);

  // =========================================================================
  // PART 6: REAR ANODIZED VENTED PROTECTIVE END COVER
  // =========================================================================
  m.addLathe(
    [
      [0.44, 1.00, 0.8],
      [0.44, 1.13, 1.0],
      [0.54, 1.12, 0.98],
      [0.54, 1.00, 0.8],
      [0.44, 1.00, 0.8],
    ],
    52,
    MAT_LAMINATION,
    6,
    0.49,
  );
  m.addLathe(
    [
      [1.00, 0.00, 0.85],
      [1.00, 0.48, 0.95],
      [1.10, 0.42, 1.0],
      [1.10, 0.00, 0.95],
    ],
    44,
    MAT_LAMINATION,
    6,
    1.05,
  );
  for (let s = 0; s < 12; s++) {
    const th = (s / 12) * Math.PI * 2;
    m.addTaperedRadialBlock(0.50, 1.04, 1.01, 1.11, 0.11, 0.42, 0.52, 0.055, th, MAT_LAMINATION, 6, 0, 0.92);
  }

  return m.tris;
}

const TRIANGLES = buildAssembly();

/**
 * Studio Darkroom PBR Metallic Shader:
 * Evaluates analytic studio softbox HDRI reflections + GGX microfacet specular +
 * cavity ambient occlusion so metals have deep obsidian darks and bright metallic glints!
 */
function shadePBR(mat, nx, ny, nz, vx, vy, vz, ao, energize, phaseWave, worldX) {
  // Subtle lathe micro-grooves on machined steel/aluminum along X
  if (mat === MAT_STEEL || mat === MAT_ALUMINUM) {
    const groove = Math.sin(worldX * 190) * 0.045;
    nx = clamp(nx + groove, -1, 1);
    const inv = 1 / (Math.hypot(nx, ny, nz) || 1);
    nx *= inv; ny *= inv; nz *= inv;
  }

  // Material PBR parameters: F0 (metallic specular tint), diffuse albedo, roughness
  let f0R = 0.75, f0G = 0.78, f0B = 0.83;
  let diffR = 0.05, diffG = 0.06, diffB = 0.075;
  let rough = 0.24;
  let emitR = 0, emitG = 0, emitB = 0;

  if (mat === MAT_STEEL) {
    f0R = 0.82; f0G = 0.86; f0B = 0.92;
    diffR = 0.05; diffG = 0.06; diffB = 0.08;
    rough = 0.17;
  } else if (mat === MAT_ALUMINUM) {
    f0R = 0.70; f0G = 0.74; f0B = 0.80;
    diffR = 0.09; diffG = 0.10; diffB = 0.13;
    rough = 0.27;
  } else if (mat === MAT_COPPER) {
    f0R = 0.96; f0G = 0.52; f0B = 0.26;
    diffR = 0.14; diffG = 0.045; diffB = 0.018;
    rough = 0.20;
  } else if (mat === MAT_COPPER_ENERGIZED) {
    f0R = 0.98; f0G = 0.56; f0B = 0.28;
    diffR = 0.16; diffG = 0.05; diffB = 0.02;
    rough = 0.18;
    const p = energize * Math.pow(phaseWave, 1.6);
    emitR = p * 0.22;
    emitG = p * 0.48;
    emitB = p * 1.15;
  } else if (mat === MAT_LAMINATION) {
    f0R = 0.24; f0G = 0.29; f0B = 0.38;
    diffR = 0.025; diffG = 0.032; diffB = 0.048;
    rough = 0.34;
  } else if (mat === MAT_COBALT) {
    f0R = 0.22; f0G = 0.52; f0B = 1.00;
    diffR = 0.02; diffG = 0.07; diffB = 0.24;
    rough = 0.19;
    emitR = energize * 0.03;
    emitG = energize * 0.10;
    emitB = energize * 0.30;
  } else if (mat === MAT_CARBON) {
    f0R = 0.10; f0G = 0.12; f0B = 0.16;
    diffR = 0.018; diffG = 0.022; diffB = 0.032;
    rough = 0.45;
  }

  const ndv = Math.max(0.001, nx * vx + ny * vy + nz * vz);
  // Reflection vector R = 2*(N.V)*N - V
  const rx = 2 * ndv * nx - vx;
  const ry = 2 * ndv * ny - vy;
  const rz = 2 * ndv * nz - vz;

  // Schlick Fresnel
  const fPow = Math.pow(1 - ndv, 5);
  const frR = f0R + (1 - f0R) * fPow;
  const frG = f0G + (1 - f0G) * fPow;
  const frB = f0B + (1 - f0B) * fPow;

  // Analytic Dark-Studio 3-Softbox HDRI Environment Reflection!
  // Softbox 1: Overhead architectural key strip (warm-neutral studio bank)
  const sb1 = Math.exp(-Math.pow((ry - 0.62) * 3.1, 2) - Math.pow((rx + 0.25) * 1.4, 2)) * 1.55;
  // Softbox 2: Side-horizon dramatic rim strip
  const sb2 = Math.exp(-Math.pow((ry + 0.05) * 4.8, 2) - Math.pow((rz - 0.45) * 1.8, 2)) * 0.95;
  // Softbox 3: Electric Cobalt lower-back rim kicker
  const sb3 = Math.exp(-Math.pow((ry + 0.45) * 3.4, 2) - Math.pow((rx - 0.55) * 2.0, 2)) * (0.65 + 0.55 * energize);
  // Dark floor & studio bounce
  const envBase = 0.04 + 0.06 * Math.max(0, ry);

  const sharpness = (1 - rough) * (1 - rough);
  const envR = (envBase + sb1 * 1.04 + sb2 * 0.95 + sb3 * 0.28) * (0.45 + 0.75 * sharpness);
  const envG = (envBase + sb1 * 0.99 + sb2 * 0.96 + sb3 * 0.58) * (0.45 + 0.75 * sharpness);
  const envB = (envBase * 1.3 + sb1 * 0.94 + sb2 * 1.02 + sb3 * 1.25) * (0.45 + 0.75 * sharpness);

  // Direct Studio Point/Area Lights with GGX-like high-power specular + rim
  // Key Light (top-left-front)
  const l1 = [ -0.4472, 0.7638, 0.4654 ];
  // Cobalt Rim Light (back-right-top)
  const l2 = [ 0.6644, 0.3986, -0.6323 ];
  // Warm Copper Kicker (bottom-left-front)
  const l3 = [ -0.5883, -0.5491, 0.5936 ];

  const ndl1 = Math.max(0, nx * l1[0] + ny * l1[1] + nz * l1[2]);
  const ndl2 = Math.max(0, nx * l2[0] + ny * l2[1] + nz * l2[2]);
  const ndl3 = Math.max(0, nx * l3[0] + ny * l3[1] + nz * l3[2]);

  const specExp = Math.max(8, Math.round(2.0 / Math.pow(rough, 2.3)));
  const h1 = norm([l1[0] + vx, l1[1] + vy, l1[2] + vz]);
  const h2 = norm([l2[0] + vx, l2[1] + vy, l2[2] + vz]);
  const h3 = norm([l3[0] + vx, l3[1] + vy, l3[2] + vz]);

  const sp1 = Math.pow(Math.max(0, nx * h1[0] + ny * h1[1] + nz * h1[2]), specExp) * (0.6 + 1.8 * sharpness);
  const sp2 = Math.pow(Math.max(0, nx * h2[0] + ny * h2[1] + nz * h2[2]), specExp * 0.65) * 1.25;
  const sp3 = Math.pow(Math.max(0, nx * h3[0] + ny * h3[1] + nz * h3[2]), specExp * 0.5) * 0.75;

  const rim = Math.pow(1 - ndv, 3.6) * 0.32;

  let r =
    ao * (diffR * (0.25 + ndl1 * 1.4 + ndl3 * 0.6) + frR * (envR + sp1 * 1.25 + sp3 * 0.85)) +
    sp2 * f0R * 0.45 +
    rim * 0.16 +
    emitR;
  let g =
    ao * (diffG * (0.25 + ndl1 * 1.35 + ndl3 * 0.4) + frG * (envG + sp1 * 1.20 + sp3 * 0.52)) +
    sp2 * (f0G * 0.5 + 0.35) +
    rim * 0.30 +
    emitG;
  let b =
    ao * (diffB * (0.30 + ndl1 * 1.3 + ndl2 * 0.9) + frB * (envB + sp1 * 1.15 + sp3 * 0.25)) +
    sp2 * (f0B * 0.5 + 0.75) +
    rim * 0.68 +
    emitB;

  // ACES Filmic Tone Mapping (preserves deep studio blacks + rich saturated copper/cobalt!)
  const aces = (x) => clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0, 1);
  return [
    Math.pow(aces(r), 1 / 2.2) * 255,
    Math.pow(aces(g), 1 / 2.2) * 255,
    Math.pow(aces(b), 1 / 2.2) * 255,
  ];
}

function renderFrameBuffer(frameIdx) {
  const t = frameIdx / (TOTAL_FRAMES - 1);
  const explode = smoothstep(0.08, 0.74, t);
  const energize = smoothstep(0.18, 0.86, t);

  const partXOffset = [
    -1.72 * explode, // 0: Pulley
    -1.12 * explode, // 1: Front Cast Housing
    -0.60 * explode, // 2: Turbine Fan
    -0.05 * explode, // 3: Claw-Pole Rotor & Shaft
    0.50 * explode,  // 4: Laminated Stator & Molten Copper Windings
    1.16 * explode,  // 5: Rectifier Diode Bridge & Voltage Regulator
    1.74 * explode,  // 6: Rear Vented Shroud
  ];

  const spinAngle = t * Math.PI * 3.0;
  const camYaw = -0.66 + t * 0.52;
  const camPitch = 0.25 - 0.05 * Math.sin(t * Math.PI);
  const camDist = 4.25 + 1.50 * explode;

  const camPos = [
    Math.sin(camYaw) * Math.cos(camPitch) * camDist,
    Math.sin(camPitch) * camDist,
    Math.cos(camYaw) * Math.cos(camPitch) * camDist,
  ];
  const target = [0.05 * explode, -0.01, 0];
  const fwd = norm(sub(target, camPos));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);

  const fovScale = HEIGHT * 1.18;
  const cx = WIDTH * 0.5;
  const cy = HEIGHT * 0.5;

  const pixels = new Uint8Array(WIDTH * HEIGHT * 3);
  const zbuf = new Float32Array(WIDTH * HEIGHT);
  zbuf.fill(1e9);

  // 1. Pitch-Deep Obsidian Studio Backdrop (#060911 -> #0D1526 subtle halo)
  for (let y = 0; y < HEIGHT; y++) {
    const ny = (y - cy) / HEIGHT;
    for (let x = 0; x < WIDTH; x++) {
      const nx = (x - cx) / WIDTH;
      const r2 = nx * nx * 1.4 + ny * ny * 2.4;
      const halo = Math.exp(-r2 * 3.0);
      const copperGlow = Math.exp(-((nx - 0.06) ** 2 + ny ** 2) * 5.5) * (0.25 + 0.35 * explode);
      const cobaltGlow = Math.exp(-((nx + 0.16) ** 2 + (ny + 0.08) ** 2) * 4.5) * (0.25 + 0.55 * energize);

      const idx = (y * WIDTH + x) * 3;
      pixels[idx] = clamp(6 + halo * 10 + copperGlow * 26, 0, 255);
      pixels[idx + 1] = clamp(9 + halo * 15 + cobaltGlow * 18 + copperGlow * 12, 0, 255);
      pixels[idx + 2] = clamp(17 + halo * 28 + cobaltGlow * 48, 0, 255);
    }
  }

  const project = (wx, wy, wz) => {
    const dx = wx - camPos[0];
    const dy = wy - camPos[1];
    const dz = wz - camPos[2];
    const cz = dx * fwd[0] + dy * fwd[1] + dz * fwd[2];
    if (cz <= 0.2) return null;
    const invZ = fovScale / cz;
    return [
      cx + (dx * right[0] + dy * right[1] + dz * right[2]) * invZ,
      cy - (dx * up[0] + dy * up[1] + dz * up[2]) * invZ,
      cz,
    ];
  };

  // 2. Rasterize with Per-Pixel Normal Interpolation & PBR Shading
  const cSpin = Math.cos(spinAngle);
  const sSpin = Math.sin(spinAngle);

  for (let i = 0; i < TRIANGLES.length; i++) {
    const tri = TRIANGLES[i];
    const pid = tri.partId;
    const xOff = partXOffset[pid];
    const spins = pid === 0 || pid === 2 || pid === 3;

    const xformPt = (p) => {
      let y = p[1], z = p[2];
      if (spins) {
        const ny = y * cSpin - z * sSpin;
        const nz = y * sSpin + z * cSpin;
        y = ny; z = nz;
      }
      return [p[0] + xOff, y, z];
    };

    const xformN = (n) => {
      if (!spins) return n;
      return [n[0], n[1] * cSpin - n[2] * sSpin, n[1] * sSpin + n[2] * cSpin];
    };

    const w0 = xformPt(tri.p0);
    const w1 = xformPt(tri.p1);
    const w2 = xformPt(tri.p2);

    const fn = cross(sub(w1, w0), sub(w2, w0));
    const vxMid = camPos[0] - (w0[0] + w1[0] + w2[0]) / 3;
    const vyMid = camPos[1] - (w0[1] + w1[1] + w2[1]) / 3;
    const vzMid = camPos[2] - (w0[2] + w1[2] + w2[2]) / 3;
    const facing = fn[0] * vxMid + fn[1] * vyMid + fn[2] * vzMid;
    const twoSided = pid === 1 || pid === 2 || pid === 6;
    if (!twoSided && facing <= 0) continue;

    const s0 = project(w0[0], w0[1], w0[2]);
    const s1 = project(w1[0], w1[1], w1[2]);
    const s2 = project(w2[0], w2[1], w2[2]);
    if (!s0 || !s1 || !s2) continue;

    const area = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s1[1] - s0[1]) * (s2[0] - s0[0]);
    if (Math.abs(area) < 0.05) continue;
    const invArea = 1 / area;

    const minX = Math.max(0, Math.floor(Math.min(s0[0], s1[0], s2[0])));
    const maxX = Math.min(WIDTH - 1, Math.ceil(Math.max(s0[0], s1[0], s2[0])));
    const minY = Math.max(0, Math.floor(Math.min(s0[1], s1[1], s2[1])));
    const maxY = Math.min(HEIGHT - 1, Math.ceil(Math.max(s0[1], s1[1], s2[1])));
    if (minX > maxX || minY > maxY) continue;

    const flip = facing < 0 ? -1 : 1;
    const n0 = xformN(tri.n0);
    const n1 = xformN(tri.n1);
    const n2 = xformN(tri.n2);
    const phaseWave = 0.5 + 0.5 * Math.sin(t * Math.PI * 8 - (tri.phase * Math.PI * 2) / 3);
    const vView = norm([vxMid, vyMid, vzMid]);

    // Radial self-occlusion inside deep interior cavities
    const rAvg = Math.hypot((w0[1] + w1[1] + w2[1]) / 3, (w0[2] + w1[2] + w2[2]) / 3);
    const cavityAO = 0.68 + 0.32 * clamp(rAvg / 0.95, 0, 1);

    for (let py = minY; py <= maxY; py++) {
      const ry = py + 0.5;
      for (let px = minX; px <= maxX; px++) {
        const rx = px + 0.5;
        const wA = ((s1[0] - rx) * (s2[1] - ry) - (s1[1] - ry) * (s2[0] - rx)) * invArea;
        const wB = ((s2[0] - rx) * (s0[1] - ry) - (s2[1] - ry) * (s0[0] - rx)) * invArea;
        const wC = 1 - wA - wB;
        if (wA < 0 || wB < 0 || wC < 0) continue;

        const z = wA * s0[2] + wB * s1[2] + wC * s2[2];
        const pIdx = py * WIDTH + px;
        if (z < zbuf[pIdx]) {
          zbuf[pIdx] = z;
          let inx = (wA * n0[0] + wB * n1[0] + wC * n2[0]) * flip;
          let iny = (wA * n0[1] + wB * n1[1] + wC * n2[1]) * flip;
          let inz = (wA * n0[2] + wB * n1[2] + wC * n2[2]) * flip;
          const nl = 1 / (Math.hypot(inx, iny, inz) || 1);
          inx *= nl; iny *= nl; inz *= nl;

          const ao = (wA * tri.ao0 + wB * tri.ao1 + wC * tri.ao2) * cavityAO;
          const localX = wA * tri.p0[0] + wB * tri.p1[0] + wC * tri.p2[0];
          const col = shadePBR(tri.mat, inx, iny, inz, vView[0], vView[1], vView[2], ao, energize, phaseWave, localX);

          const cIdx = pIdx * 3;
          pixels[cIdx] = col[0];
          pixels[cIdx + 1] = col[1];
          pixels[cIdx + 2] = col[2];
        }
      }
    }
  }

  // 3. Crisp Volumetric High-Voltage Cobalt & Copper Plasma Filaments (Depth-Tested)
  if (energize > 0.04) {
    const arcs = 6;
    for (let a = 0; a < arcs; a++) {
      const baseTh = (a / arcs) * Math.PI * 2 + t * Math.PI * 3.5;
      const xStart = partXOffset[3] + 0.05;
      const xEnd = partXOffset[5] + 0.72;
      const steps = 160;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const wx = xStart + (xEnd - xStart) * u;
        const r = 0.74 + 0.21 * Math.sin(u * Math.PI) + 0.025 * Math.sin(u * 26 + t * 38 + a * 1.7);
        const th = baseTh + u * 0.45 + 0.035 * Math.cos(u * 20 - t * 32 + a);
        const pr = project(wx, Math.cos(th) * r, Math.sin(th) * r);
        if (!pr) continue;
        const px = Math.round(pr[0]);
        const py = Math.round(pr[1]);
        const env = Math.sin(u * Math.PI) * energize;
        const isCopperArc = a % 3 === 0;

        for (let oy = -2; oy <= 2; oy++) {
          for (let ox = -2; ox <= 2; ox++) {
            const gx = px + ox;
            const gy = py + oy;
            if (gx < 0 || gx >= WIDTH || gy < 0 || gy >= HEIGHT) continue;
            const pIdx = gy * WIDTH + gx;
            if (pr[2] > zbuf[pIdx] + 0.06) continue;
            const dist2 = ox * ox + oy * oy;
            const w = Math.exp(-dist2 * 0.65) * env;
            const cIdx = pIdx * 3;
            if (isCopperArc) {
              pixels[cIdx] = clamp(pixels[cIdx] + 255 * w, 0, 255);
              pixels[cIdx + 1] = clamp(pixels[cIdx + 1] + 155 * w, 0, 255);
              pixels[cIdx + 2] = clamp(pixels[cIdx + 2] + 75 * w, 0, 255);
            } else {
              pixels[cIdx] = clamp(pixels[cIdx] + 85 * w, 0, 255);
              pixels[cIdx + 1] = clamp(pixels[cIdx + 1] + 185 * w, 0, 255);
              pixels[cIdx + 2] = clamp(pixels[cIdx + 2] + 255 * w, 0, 255);
            }
          }
        }
      }
    }
  }

  // 4. Downsample 2x2 SSAA (1920x1080 -> 960x540) for silky razor-sharp anti-aliased edges!
  const out = new Uint8Array(OUT_W * OUT_H * 3);
  for (let y = 0; y < OUT_H; y++) {
    const sy0 = y * 2 * WIDTH;
    const sy1 = (y * 2 + 1) * WIDTH;
    for (let x = 0; x < OUT_W; x++) {
      const sx0 = x * 2;
      const sx1 = x * 2 + 1;
      const i00 = (sy0 + sx0) * 3;
      const i01 = (sy0 + sx1) * 3;
      const i10 = (sy1 + sx0) * 3;
      const i11 = (sy1 + sx1) * 3;
      const oIdx = (y * OUT_W + x) * 3;
      out[oIdx] = (pixels[i00] + pixels[i01] + pixels[i10] + pixels[i11] + 2) >> 2;
      out[oIdx + 1] = (pixels[i00 + 1] + pixels[i01 + 1] + pixels[i10 + 1] + pixels[i11 + 1] + 2) >> 2;
      out[oIdx + 2] = (pixels[i00 + 2] + pixels[i01 + 2] + pixels[i10 + 2] + pixels[i11 + 2] + 2) >> 2;
    }
  }

  const header = Buffer.from(`P6\n${OUT_W} ${OUT_H}\n255\n`, "ascii");
  return Buffer.concat([header, Buffer.from(out.buffer)]);
}

function encodeWebp(ppmBuffer, outPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn("convert", ["ppm:-", "-quality", "86", outPath]);
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`convert exited with ${code}`));
    });
    proc.stdin.write(ppmBuffer);
    proc.stdin.end();
  });
}

async function main() {
  const t0 = Date.now();
  console.log(`Rendering V2 PBR 2x2-SSAA 72 frames (${TRIANGLES.length} triangles)...`);
  const concurrency = 4;
  for (let i = 0; i < TOTAL_FRAMES; i += concurrency) {
    const batch = [];
    for (let j = i; j < Math.min(TOTAL_FRAMES, i + concurrency); j++) {
      const ppm = renderFrameBuffer(j);
      const name = `frame-${String(j).padStart(2, "0")}.webp`;
      batch.push(encodeWebp(ppm, join(OUT_DIR, name)));
    }
    await Promise.all(batch);
  }
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(2)}s -> ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
