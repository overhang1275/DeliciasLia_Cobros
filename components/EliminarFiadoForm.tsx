"use client";

import { useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { eliminarFiado } from "@/app/fiados/actions";

const HOLD_MS = 900;

export function EliminarFiadoForm({ ventaId }: { ventaId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const progress = useMotionValue(0);
  const bg = useTransform(progress, [0, 1], ["#fef2f2", "#fee2e2"]);

  function cancel() {
    controlsRef.current?.stop();
    controlsRef.current = animate(progress, 0, { duration: 0.18, ease: "easeOut" });
  }

  function start() {
    cancel();
    controlsRef.current = animate(progress, 1, {
      duration: HOLD_MS / 1000,
      ease: "linear",
      onComplete: () => {
        if (confirmRef.current) confirmRef.current.value = "CONFIRMAR";
        formRef.current?.requestSubmit();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={eliminarFiado}
      onSubmit={(event) => {
        if (confirmRef.current?.value !== "CONFIRMAR") event.preventDefault();
      }}
    >
      <input name="ventaId" type="hidden" value={ventaId} />
      <input ref={confirmRef} name="confirmacion" type="hidden" />
      <div className="w-40 overflow-hidden rounded-lg bg-red-50 shadow-sm">
        <motion.button
          className="min-h-10 w-full px-3 text-sm font-bold text-red-700"
          onBlur={cancel}
          onKeyDown={(event) => {
            if (event.repeat) return;
            if (event.key === " " || event.key === "Enter") start();
          }}
          onKeyUp={cancel}
          onPointerCancel={cancel}
          onPointerDown={start}
          onPointerLeave={cancel}
          onPointerUp={cancel}
          style={{ backgroundColor: bg }}
          type="button"
        >
          Manten para eliminar
        </motion.button>
        <div className="h-1 bg-red-100">
          <motion.div className="h-full origin-left bg-red-600" style={{ scaleX: progress }} />
        </div>
      </div>
    </form>
  );
}
