"use client";

import { liquidarDeudaCliente } from "@/app/fiados/actions";

export function LiquidarDeudaForm({ clienteId, total }: { clienteId: number; total: string }) {
  return (
    <form
      action={liquidarDeudaCliente}
      className="grid gap-2 sm:grid-cols-[minmax(8rem,10rem)_auto]"
      onSubmit={(event) => {
        if (!confirm(`Se liquidara toda la deuda pendiente de este cliente por ${total}.`)) event.preventDefault();
      }}
    >
      <input name="clienteId" type="hidden" value={clienteId} />
      <select className="ui-input min-h-10 rounded-full px-3 text-sm" name="metodo" required>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA">Transferencia</option>
      </select>
      <button className="ui-button-primary min-h-10 whitespace-nowrap px-4 text-sm" type="submit">
        Liquidar deuda {total}
      </button>
    </form>
  );
}
