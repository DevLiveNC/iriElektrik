"use client";

import type { ReactNode } from "react";

interface Props {
  href: string;
  event: "ara" | "yol_tarifi" | "whatsapp";
  className?: string;
  target?: string;
  children: ReactNode;
}

/** Tıklamayı hafif iç olayla ölçer; üçüncü taraf kod yüklemez. */
export default function TrackLink({ href, event, className, target, children }: Props) {
  const track = () => {
    try {
      navigator.sendBeacon("/api/event", JSON.stringify({ event, at: new Date().toISOString() }));
    } catch {
      /* ölçüm başarısızlığı kullanıcı akışını etkilemez */
    }
  };
  return (
    <a href={href} className={className} target={target} rel={target ? "noreferrer" : undefined} onClick={track}>
      {children}
    </a>
  );
}
