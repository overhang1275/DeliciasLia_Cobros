"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

export function ConfirmSubmitButton({
  cancelLabel = "Cancelar",
  children,
  className,
  confirmLabel = "Confirmar",
  description,
  title
}: {
  cancelLabel?: string;
  children: ReactNode;
  className: string;
  confirmLabel?: string;
  description: string;
  title: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button ref={buttonRef} className={className} type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-black/40 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label={title}>
          <div className="grid w-full max-w-sm gap-4 rounded-[2rem] border bg-white p-5 text-[var(--text-main)] shadow-lg">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand)]">{title}</h2>
              <p className="ui-label mt-1">{description}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="ui-button-secondary" type="button" onClick={() => setOpen(false)}>
                {cancelLabel}
              </button>
              <button
                className="ui-button-danger min-h-14"
                type="button"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.closest("form")?.requestSubmit();
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
