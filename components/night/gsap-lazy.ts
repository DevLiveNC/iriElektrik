"use client";

type GsapApi = typeof import("gsap").gsap;
type ScrollTriggerApi = typeof import("gsap/ScrollTrigger").ScrollTrigger;

export interface GsapBundle {
  gsap: GsapApi;
  ScrollTrigger: ScrollTriggerApi;
}

/**
 * GSAP + ScrollTrigger yalnızca kullanıcı etkileşimi başladığında yüklenir.
 *
 * Böylece ilk JS yükü (LCP ölçümü) GSAP'i içermez; ağır animasyon kütüphanesi
 * sayfa görünür olduktan sonra ayrı bir chunk olarak gelir.
 */
export async function loadGsap(): Promise<GsapBundle> {
  const [gsapModule, scrollModule] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  const gsap = gsapModule.gsap ?? gsapModule.default;
  const ScrollTrigger = scrollModule.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
