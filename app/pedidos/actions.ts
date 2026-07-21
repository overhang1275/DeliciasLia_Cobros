"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pedidoSchema } from "@/lib/validators/pedidos";

export async function crearPedido(formData: FormData) {
  const pedido = pedidoSchema.parse({
    clienteId: formData.get("clienteId"),
    productoId: formData.get("productoId"),
    piezas: formData.get("piezas"),
    fechaEntrega: formData.get("fechaEntrega"),
    notas: formData.get("notas")
  });

  await db.pedido.create({ data: pedido });

  revalidatePath("/pedidos");
  redirect("/pedidos?guardado=pedido");
}

export async function cancelarPedido(formData: FormData) {
  const pedidoId = Number(formData.get("pedidoId"));
  if (!Number.isInteger(pedidoId) || pedidoId <= 0) redirect("/pedidos");

  await db.pedido.update({
    where: { id: pedidoId },
    data: { estado: "CANCELADO" }
  });

  revalidatePath("/pedidos");
  redirect("/pedidos?guardado=pedido-cancelado");
}
