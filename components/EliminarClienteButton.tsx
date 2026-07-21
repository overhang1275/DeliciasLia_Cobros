"use client";

import { Trash2 } from "@/components/AppIcon";
import { eliminarCliente } from "@/app/clientes/actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export function EliminarClienteButton({ clienteId, nombre }: { clienteId: number; nombre: string }) {
  return (
    <form action={eliminarCliente}>
      <input name="clienteId" type="hidden" value={clienteId} />
      <input name="confirmacion" type="hidden" value="CONFIRMAR" />
      <ConfirmSubmitButton
        className="ui-icon-button size-10 rounded-full text-red-700"
        title="Eliminar cliente"
        description={`Se ocultará a ${nombre} de la lista de clientes. Su historial no se borrará.`}
        confirmLabel="Eliminar"
      >
        <Trash2 aria-hidden="true" className="size-5" />
      </ConfirmSubmitButton>
    </form>
  );
}
