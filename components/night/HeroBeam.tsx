"use client";

import dynamic from "next/dynamic";

/**
 * WebGL ışık geçişi ayrı bir chunk olarak yüklenir; ilk JS yüküne girmez.
 */
const HeroBeamCanvas = dynamic(() => import("./HeroBeamCanvas"), { ssr: false });

export default function HeroBeam() {
  return <HeroBeamCanvas />;
}
