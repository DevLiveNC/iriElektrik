"use client";

import { useId, useRef, useTransition } from "react";

interface Props {
  label: string;
  confirmTitle: string;
  confirmText: string;
  action: () => void;
  danger?: boolean;
}

/** Kritik işlemler için klavye ile kullanılabilen yerel onay penceresi. */
export default function ConfirmButton({ label, confirmTitle, confirmText, action, danger }: Props) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-controls={id}
        className={`admin-action ${danger ? "admin-action--danger" : ""}`}
      >
        {label}
      </button>
      <dialog
        id={id}
        ref={dialogRef}
        aria-labelledby={`${id}-baslik`}
        className="dialog"
      >
        <h2 id={`${id}-baslik`} className="dialog__title">
          {confirmTitle}
        </h2>
        <p className="dialog__text">{confirmText}</p>
        <div className="dialog__actions">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              dialogRef.current?.close();
              startTransition(() => action());
            }}
            className={`button ${danger ? "button--danger" : "button--primary"}`}
          >
            {pending ? "Onaylanıyor…" : "Onayla"}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="button button--secondary"
          >
            Vazgeç
          </button>
        </div>
      </dialog>
    </>
  );
}
