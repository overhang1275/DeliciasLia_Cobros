"use client";

import { darCambio } from "./actions";

export function DarCambioButton({ ventaId, total }: { ventaId: number; total: string }) {
  return (
    <form
      action={darCambio}
      onSubmit={(event) => {
        if (!confirm(`Confirmas que ya diste el cambio de ${total}?`)) event.preventDefault();
      }}
    >
      <input name="ventaId" type="hidden" value={ventaId} />
      <button className="ui-button-danger min-h-8 px-3 py-1" type="submit">
        Dar cambio
      </button>
    </form>
  );
}
