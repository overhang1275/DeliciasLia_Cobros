"use client";

import { Trash2 } from "@/components/AppIcon";
import { eliminarFiado } from "@/app/fiados/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export function EliminarFiadoForm({ ventaId }: { ventaId: number }) {
  return (
    <form action={eliminarFiado}>
      <input name="ventaId" type="hidden" value={ventaId} />
      <input name="confirmacion" type="hidden" value="CONFIRMAR" />
      <ConfirmSubmitButton
        className="ui-button-danger gap-2"
        title="Eliminar crédito"
        description="Se eliminará este crédito y sus pagos registrados. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        Eliminar
      </ConfirmSubmitButton>
    </form>
  );
}
