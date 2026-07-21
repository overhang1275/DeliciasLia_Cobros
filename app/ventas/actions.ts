"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditMoney, auditTicketId, registrarLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { registrarVenta } from "@/lib/ventas";
import { ventaSchema } from "@/lib/validators/ventas";

export async function crearVenta(formData: FormData) {
  const venta = ventaSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
    estado: formData.get("estado"),
    metodoPago: formData.get("metodoPago"),
    cambioPendiente: formData.get("cambioPendiente"),
    montoRecibido: formData.get("montoRecibido")
  });
  if (venta.estado === "FIADA") redirect("/fiados");

  const [cliente, producto] = await Promise.all([
    db.cliente.findUnique({ where: { id: venta.clienteId }, select: { nombre: true } }),
    db.producto.findUnique({ where: { id: venta.productoId }, select: { nombre: true } })
  ]);
  const creada = await registrarVenta(venta);
  await registrarLog({
    accion: "crear",
    entidad: "Venta",
    entidadId: creada.id,
    detalle: `Cliente: ${cliente?.nombre || venta.clienteId} | Ticket ID ${auditTicketId(creada.id)} | Producto: ${producto?.nombre || venta.productoId} x ${venta.piezas} | Total: ${auditMoney.format(Number(creada.total))} | Pago: ${venta.metodoPago}${creada.cambioPendiente ? ` | Cambio pendiente: ${auditMoney.format(Number(creada.cambioMonto))}` : ""}`
  });
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/fiados");
  redirect("/ventas?guardado=venta");
}

export async function darCambio(formData: FormData) {
  const ventaId = Number(formData.get("ventaId"));
  if (!Number.isInteger(ventaId) || ventaId <= 0) redirect("/ventas");

  const venta = await db.venta.update({
    where: { id: ventaId },
    data: { cambioPendiente: false, cambioMonto: 0 },
    include: { cliente: true }
  });
  await registrarLog({ accion: "actualizar", entidad: "Venta", entidadId: ventaId, detalle: `Cliente: ${venta.cliente.nombre} | Ticket ID ${auditTicketId(venta.id)} | Cambio entregado` });

  revalidatePath("/ventas");
  redirect("/ventas?guardado=cambio");
}
