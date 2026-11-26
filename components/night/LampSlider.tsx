"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export interface LampFrame {
  src: string;
  alt: string;
}

interface Props {
  before: LampFrame;
  after: LampFrame;
  /** Kıyaslamanın ne olduğunu açıklayan metin. */
  note: string;
  /** Görsel etiketi (erişilebilirlik). */
  label?: string;
}

const STEP = 4;

export default function LampSlider({ before, after, note, label }: Props) {
  const [split, setSplit] = useState(50);
  const draggingRef = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(100, Math.max(0, ratio)));
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(event.clientX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = Math.round(split);
    let next = current;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - STEP;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + STEP;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;
    else if (event.key === "PageDown") next = current - STEP * 3;
    else if (event.key === "PageUp") next = current + STEP * 3;
    else return;
    event.preventDefault();
    setSplit(Math.min(100, Math.max(0, next)));
  };

  const rounded = Math.round(split);

  return (
    <div>
      <div
        ref={frameRef}
        className="lamp"
        style={{ "--split": `${split}%` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="lamp__layer">
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(min-width: 1100px) 58vw, 100vw"
            className="lamp__image"
          />
        </div>
        <div className="lamp__layer lamp__layer--after">
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(min-width: 1100px) 58vw, 100vw"
            className="lamp__image"
          />
        </div>

        <span className="lamp__label lamp__label--before" aria-hidden="true">
          Önce
        </span>
        <span className="lamp__label lamp__label--after" aria-hidden="true">
          Sonra
        </span>

        <div className="lamp__divider" aria-hidden="true" />

        <div
          role="slider"
          tabIndex={0}
          className="lamp__handle"
          aria-label={label ?? "Karşılaştırma kaydırıcısı"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`Önce ${rounded} yüzde, sonra ${100 - rounded} yüzde`}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.5 7 5 12l4.5 5M14.5 7l4.5 5-4.5 5" />
          </svg>
        </div>
      </div>
      <p className="lamp__note">{note}</p>
    </div>
  );
}
