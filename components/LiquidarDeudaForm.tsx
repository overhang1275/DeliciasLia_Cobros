"use client";

import { liquidarDeudaCliente } from "@/app/fiados/actions";

export function LiquidarDeudaForm({ clienteId, total }: { clienteId: number; total: string }) {
  return (
    <form
      action={liquidarDeudaCliente}
      className="mt-4 flex flex-wrap items-center justify-end gap-2"
      onSubmit={(event) => {
        if (!confirm(`Se liquidara toda la deuda pendiente de este cliente por ${total}.`)) event.preventDefault();
      }}
    >
      <input name="clienteId" type="hidden" value={clienteId} />
      <select className="ui-input min-h-10 w-fit rounded-full px-3 text-sm" name="metodo" required>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA">Transferencia</option>
      </select>
      <button className="ui-button-primary min-h-10 px-4 text-sm" type="submit">
        Liquidar deuda {total}
      </button>
    </form>
  );
}
