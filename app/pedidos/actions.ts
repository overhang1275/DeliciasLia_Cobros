"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { appDateFormatter } from "@/lib/timezone";
import { pedidoSchema } from "@/lib/validators/pedidos";

const fecha = appDateFormatter({ dateStyle: "medium" });

export async function crearPedido(formData: FormData) {
  const pedido = pedidoSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
    fechaEntrega: formData.get("fechaEntrega"),
    notas: formData.get("notas")
  });

  const creado = await db.pedido.create({ data: pedido, include: { cliente: true, producto: true } });
  await registrarLog({
    accion: "crear",
    entidad: "Pedido",
    entidadId: creado.id,
    detalle: `Cliente: ${creado.cliente.nombre} | Producto: ${creado.producto.nombre} x ${creado.piezas} | Entrega: ${fecha.format(creado.fechaEntrega)}`
  });

  revalidatePath("/pedidos");
  redirect("/pedidos?guardado=pedido");
}

export async function cancelarPedido(formData: FormData) {
  const pedidoId = Number(formData.get("pedidoId"));
  if (!Number.isInteger(pedidoId) || pedidoId <= 0) redirect("/pedidos");

  const pedido = await db.pedido.update({
    where: { id: pedidoId },
    data: { estado: "CANCELADO" },
    include: { cliente: true, producto: true }
  });
  await registrarLog({ accion: "cancelar", entidad: "Pedido", entidadId: pedidoId, detalle: `Cliente: ${pedido.cliente.nombre} | Producto: ${pedido.producto.nombre} x ${pedido.piezas} | Entrega: ${fecha.format(pedido.fechaEntrega)}` });

  revalidatePath("/pedidos");
  redirect("/pedidos?guardado=pedido-cancelado");
}
