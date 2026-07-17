"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clienteSchema } from "@/lib/validators/clientes";

export async function crearCliente(formData: FormData) {
  const cliente = clienteSchema.parse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono") || undefined,
    notas: formData.get("notas") || undefined
  });

  await db.cliente.create({ data: cliente });
  revalidatePath("/clientes");
  redirect("/clientes");
}
