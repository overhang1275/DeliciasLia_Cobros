"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLog } from "@/lib/audit";
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

  const creado = await db.cliente.create({ data: { ...cliente, estadoToken: estadoToken() } });
  await registrarLog({ accion: "crear", entidad: "Cliente", entidadId: creado.id, detalle: `Cliente: ${creado.nombre}${creado.telefono ? ` | Teléfono: ${creado.telefono}` : ""}` });
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
  await registrarLog({ accion: "editar", entidad: "Cliente", entidadId: id, detalle: `Cliente: ${cliente.nombre}${cliente.telefono ? ` | Teléfono: ${cliente.telefono}` : ""}` });
  revalidatePath("/clientes");
  redirect("/clientes?guardado=cliente");
}

export async function eliminarCliente(formData: FormData) {
  const id = Number(formData.get("clienteId"));
  const confirmacion = formData.get("confirmacion");

  if (!Number.isInteger(id) || id <= 0 || confirmacion !== "CONFIRMAR") {
    redirect("/clientes");
  }

  const eliminado = await db.cliente.update({ where: { id }, data: { activo: false } });
  await registrarLog({ accion: "eliminar", entidad: "Cliente", entidadId: id, detalle: `Cliente: ${eliminado.nombre}${eliminado.telefono ? ` | Teléfono: ${eliminado.telefono}` : ""}` });
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/fiados");
  revalidatePath("/reportes");
  redirect("/clientes?guardado=cliente-eliminado");
}

