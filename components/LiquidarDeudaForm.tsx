"use client";

import { liquidarDeudaCliente } from "@/app/fiados/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export function LiquidarDeudaForm({ clienteId, total }: { clienteId: number; total: string }) {
  return (
    <form action={liquidarDeudaCliente} className="grid gap-2 sm:grid-cols-[minmax(8rem,10rem)_auto]">
      <input name="clienteId" type="hidden" value={clienteId} />
      <select className="ui-input min-h-10 rounded-full px-3 text-sm" name="metodo" required>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA">Transferencia</option>
      </select>
      <ConfirmSubmitButton
        className="ui-button-primary min-h-10 whitespace-nowrap px-4 text-sm"
        title="Liquidar deuda"
        description={`Se registrará un pago por ${total} para liquidar todos los créditos pendientes de este cliente.`}
        confirmLabel="Liquidar"
      >
        Liquidar deuda {total}
      </ConfirmSubmitButton>
    </form>
  );
}
