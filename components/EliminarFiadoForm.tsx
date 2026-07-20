"use client";

import { eliminarFiado } from "@/app/fiados/actions";

export function EliminarFiadoForm({ ventaId }: { ventaId: number }) {
  return (
    <form
      action={eliminarFiado}
      onSubmit={(event) => {
        const confirmacion = prompt("Escribe CONFIRMAR para eliminar este fiado.");
        if (confirmacion !== "CONFIRMAR") {
          event.preventDefault();
          return;
        }
        event.currentTarget.querySelector<HTMLInputElement>('input[name="confirmacion"]')!.value = confirmacion;
      }}
    >
      <input name="ventaId" type="hidden" value={ventaId} />
      <input name="confirmacion" type="hidden" />
      <button className="min-h-10 rounded-full bg-red-50 px-4 text-sm font-bold text-red-700" type="submit">
        🗑️ Eliminar
      </button>
    </form>
  );
}
