"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clienteSchema } from "@/lib/validators/clientes";

function estadoToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export async function crearCliente(formData: FormData) {
  const cliente = clienteSchema.parse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono") || undefined,
    notas: formData.get("notas") || undefined
  });

  await db.cliente.create({ data: { ...cliente, estadoToken: estadoToken() } });
  revalidatePath("/clientes");
  redirect("/clientes?guardado=cliente");
}

export async function editarCliente(id: number, formData: FormData) {
  const cliente = clienteSchema.parse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono") || undefined,
    notas: formData.get("notas") || undefined
  });

  await db.cliente.update({ where: { id }, data: cliente });
  revalidatePath("/clientes");
  redirect("/clientes?guardado=cliente");
}

export async function eliminarCliente(formData: FormData) {
  const id = Number(formData.get("clienteId"));
  const confirmacion = formData.get("confirmacion");

  if (!Number.isInteger(id) || id <= 0 || confirmacion !== "CONFIRMAR") {
    redirect("/clientes");
  }

  await db.cliente.update({ where: { id }, data: { activo: false } });
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/fiados");
  revalidatePath("/reportes");
  redirect("/clientes?guardado=cliente-eliminado");
}
