"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditMoney, auditTicketId, registrarLog } from "@/lib/audit";
import { db } from "@/lib/db";

export async function entregarCambio(formData: FormData) {
  const ventaId = Number(formData.get("ventaId"));
  if (!Number.isInteger(ventaId) || ventaId <= 0) redirect("/cambios");

  const venta = await db.venta.findFirst({
    where: { id: ventaId, cambioPendiente: true },
    include: { cliente: true }
  });

  if (venta) {
    await db.venta.update({
      where: { id: venta.id },
      data: { cambioPendiente: false, cambioMonto: 0 }
    });
    await registrarLog({
      accion: "actualizar",
      entidad: "Venta",
      entidadId: venta.id,
      detalle: `Cliente: ${venta.cliente.nombre} | Ticket ID ${auditTicketId(venta.id)} | Cambio entregado: ${auditMoney.format(Number(venta.cambioMonto))}`
    });
  }

  revalidatePath("/");
  revalidatePath("/cambios");
  revalidatePath("/clientes");
  revalidatePath("/ventas");
  redirect("/cambios?guardado=cambio");
}
