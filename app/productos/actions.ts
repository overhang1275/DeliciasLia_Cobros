"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { productoSchema } from "@/lib/validators/productos";

export async function crearProducto(formData: FormData) {
  const producto = productoSchema.parse({
    nombre: formData.get("nombre"),
    precioVenta: formData.get("precioVenta")
  });

  await db.producto.create({
    data: {
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      costo: 0
    }
  });

  revalidatePath("/");
  revalidatePath("/productos");
  redirect("/productos");
}
