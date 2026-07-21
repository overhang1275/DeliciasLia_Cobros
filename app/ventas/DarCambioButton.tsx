"use client";

import { darCambio } from "./actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export function DarCambioButton({ ventaId, total }: { ventaId: number; total: string }) {
  return (
    <form action={darCambio}>
      <input name="ventaId" type="hidden" value={ventaId} />
      <ConfirmSubmitButton
        className="ui-button-danger min-h-8 px-3 py-1"
        title="Marcar cambio entregado"
        description={`Confirma que ya entregaste el cambio de ${total}.`}
        confirmLabel="Marcar entregado"
      >
        Dar cambio
      </ConfirmSubmitButton>
    </form>
  );
}
