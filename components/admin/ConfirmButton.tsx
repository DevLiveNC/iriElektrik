"use client";

import { useRef } from "react";

interface Props {
  label: string;
  confirmTitle: string;
  confirmText: string;
  action: () => void;
  danger?: boolean;
}

/** Kritik işlemler için onay dialogu. */
export default function ConfirmButton({ label, confirmTitle, confirmText, action, danger }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
          danger
            ? "border-2 border-red-700 text-red-800 hover:bg-red-700 hover:text-white"
            : "border-2 border-petrol/25 text-petrol hover:border-petrol"
        }`}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${confirmTitle}-baslik`}
        className="w-[min(92vw,28rem)] rounded-2xl border border-petrol/20 bg-paper p-6 text-graphite shadow-xl backdrop:bg-petrol/50"
      >
        <h2 id={`${confirmTitle}-baslik`} className="font-display text-3xl font-semibold text-petrol">
          {confirmTitle}
        </h2>
        <p className="mt-2 leading-relaxed">{confirmText}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              action();
            }}
            className={`flex-1 rounded-full px-5 py-3 font-bold text-petrol ${
              danger ? "bg-red-700 text-white hover:bg-red-800" : "bg-lime hover:bg-lime-deep"
            }`}
          >
            Onayla
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="flex-1 rounded-full border-2 border-petrol/25 px-5 py-3 font-bold text-petrol hover:border-petrol"
          >
            Vazgeç
          </button>
        </div>
      </dialog>
    </>
  );
}
